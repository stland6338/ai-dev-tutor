#!/usr/bin/env node
// exercise ブロックを workspace に対して判定し、progress.json を書く
//   npm run check                 全章を判定
//   npm run check -- --lesson a03 章 ID の前方一致で絞る
//   npm run done -- a01-powerup   manual 課題を完了にする（--undo で取り消し）
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { compareVersions, parseAppliesTo, parseLesson } from "../lib/lesson.js";

export const ROOT = resolve(fileURLToPath(import.meta.url), "../..");
export const workspaceDir = () => resolve(process.env.TUTOR_WORKSPACE || join(homedir(), "ai-dev-tutor-workspace"));
const manualFile = () => process.env.TUTOR_MANUAL || join(ROOT, "progress-manual.json");
const progressFile = () => process.env.TUTOR_PROGRESS || join(ROOT, "progress.json");

export function loadLessons(dir = join(ROOT, "lessons")) {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((f) => ({ file: f, ...parseLesson(readFileSync(join(dir, f), "utf8")) }));
}

const readJson = (p, fallback) => {
  try { return JSON.parse(readFileSync(p, "utf8")); } catch { return fallback; }
};

const nonEmpty = (v) =>
  v != null && v !== "" && !(Array.isArray(v) && v.length === 0) && !(typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === 0);

// 1課題を判定して { ok, detail } を返す。detail は不合格の理由（読み手向け）
export function evaluate(ex, ws, manual = {}) {
  const at = (p) => join(ws, p ?? "");
  switch (ex.check) {
    case "file-exists":
      return existsSync(at(ex.path)) ? { ok: true } : { ok: false, detail: `${ex.path} がまだ無い` };
    case "file-contains": {
      const p = at(ex.path);
      if (!existsSync(p) || statSync(p).isDirectory()) return { ok: false, detail: `${ex.path} がまだ無い` };
      let re;
      try { re = new RegExp(ex.pattern, "m"); } catch { return { ok: false, detail: `pattern が正規表現として読めない: ${ex.pattern}` }; }
      return re.test(readFileSync(p, "utf8"))
        ? { ok: true }
        : { ok: false, detail: `${ex.path} に /${ex.pattern}/ に合う行が無い` };
    }
    case "json-has": {
      const p = at(ex.path);
      if (!existsSync(p)) return { ok: false, detail: `${ex.path} がまだ無い` };
      const data = readJson(p, undefined);
      if (data === undefined) return { ok: false, detail: `${ex.path} が JSON として読めない` };
      const v = ex.key.split(".").reduce((o, k) => (o == null ? undefined : o[k]), data);
      return nonEmpty(v) ? { ok: true } : { ok: false, detail: `${ex.path} に ${ex.key} が無い` };
    }
    case "command": {
      const cwd = at(ex.cwd);
      if (!existsSync(cwd)) return { ok: false, detail: `${ex.cwd} がまだ無い` };
      // run は教材の作者が書いた文字列。外部入力ではない（取り込む章は docs/lesson-format.md の手順で確認する）
      const r = spawnSync("sh", ["-c", ex.run], { cwd, encoding: "utf8", timeout: 120_000 });
      if (r.status === 0) return { ok: true };
      const tail = `${r.stdout ?? ""}${r.stderr ?? ""}`.trim().split("\n").slice(-3).join(" / ");
      return { ok: false, detail: `\`${ex.run}\` が失敗${tail ? `: ${tail}` : ""}` };
    }
    case "manual":
      return manual[ex.id] ? { ok: true } : { ok: false, detail: `終えたら npm run done -- ${ex.id}` };
    default:
      return { ok: false, detail: `未知の check: ${ex.check}` };
  }
}

const toolVersion = (cmd) => {
  const r = spawnSync(cmd, ["--version"], { encoding: "utf8", timeout: 10_000 });
  return r.status === 0 ? (r.stdout.match(/\d+\.\d+\.\d+/) ?? [null])[0] : null;
};

const TOOL_NAMES = { "claude code": "Claude Code", "grok build": "Grok Build" };

// 教材が書かれた版より新しい道具が入っていれば、推奨が変わっている可能性を知らせる
export function versionNotes(lessons, installed) {
  const notes = [];
  for (const l of lessons) {
    for (const [key, written] of Object.entries(parseAppliesTo(l.meta.applies_to))) {
      const have = installed[key];
      if (!have) continue;
      const tool = TOOL_NAMES[key] ?? key;
      const cmp = compareVersions(have, written);
      if (cmp > 0) notes.push(`${l.meta.id}: ${tool} ${have} が入っています。教材は ${written} 時点の推奨です（${l.meta.as_of} 確認）。変わっている可能性があります`);
      if (cmp < 0) notes.push(`${l.meta.id}: ${tool} ${have} は教材の ${written} より古いです。\`claude update\` などで更新すると手順どおりに進められます`);
    }
  }
  return notes;
}

// 既存の progress.json に今回の結果を重ねる（1章だけの判定や manual の完了でも、ビューアの表示が更新されるように）
function writeProgress(patch) {
  const prev = readJson(progressFile(), {});
  const next = {
    ...prev,
    ...patch,
    lessons: { ...prev.lessons, ...patch.lessons },
    exercises: { ...prev.exercises, ...patch.exercises },
  };
  writeFileSync(progressFile(), JSON.stringify(next, null, 2) + "\n");
}

function markDone(id, undo) {
  const all = loadLessons().flatMap((l) => l.exercises);
  const ex = all.find((e) => e.id === id);
  if (!ex) return console.error(`課題 ${id} が見つかりません`), 1;
  if (ex.check !== "manual") return console.error(`${id} は自動で判定する課題です（npm run check）`), 1;
  const manual = readJson(manualFile(), {});
  if (undo) delete manual[id];
  else manual[id] = new Date().toISOString();
  writeFileSync(manualFile(), JSON.stringify(manual, null, 2) + "\n");
  writeProgress({ exercises: { [id]: evaluate(ex, workspaceDir(), manual) } });
  console.log(`${id} を${undo ? "未完了に戻しました" : "完了にしました"}`);
  return 0;
}

function main(argv) {
  if (argv.includes("--done")) {
    const id = argv.find((a) => !a.startsWith("--"));
    if (!id) return console.error("使い方: npm run done -- <課題ID> [--undo]"), 1;
    return markDone(id, argv.includes("--undo"));
  }

  const ws = workspaceDir();
  const filter = argv.includes("--lesson") ? argv[argv.indexOf("--lesson") + 1] : "";
  if (filter === undefined || filter.startsWith("--")) return console.error("使い方: npm run check -- --lesson <章 ID の先頭>"), 1;
  const lessons = loadLessons().filter((l) => String(l.meta.id).startsWith(filter));
  if (!existsSync(ws)) {
    console.log(`workspace が無い: ${ws}\n先に npm start で作ってください`);
  }
  const manual = readJson(manualFile(), {});
  const installed = { "claude code": toolVersion("claude"), "grok build": toolVersion("grok") };
  const result = { generated_at: new Date().toISOString(), workspace: ws, installed, lessons: {}, exercises: {} };

  let pass = 0, total = 0;
  for (const l of lessons) {
    if (!l.exercises.length) continue;
    const rows = l.exercises.map((ex) => ({ ex, r: existsSync(ws) || ex.check === "manual" ? evaluate(ex, ws, manual) : { ok: false, detail: "workspace が無い" } }));
    const ok = rows.filter((x) => x.r.ok).length;
    pass += ok; total += rows.length;
    result.lessons[l.meta.id] = { passed: ok, total: rows.length };
    console.log(`\n${ok === rows.length ? "✓" : "・"} ${l.meta.id} ${l.meta.title}  ${ok}/${rows.length}`);
    for (const { ex, r } of rows) {
      result.exercises[ex.id] = r;
      console.log(`   ${r.ok ? "✓" : "✗"} ${ex.id}${r.ok ? "" : `  — ${r.detail}`}`);
    }
  }
  const notes = versionNotes(lessons, installed);
  result.version_notes = notes;
  if (notes.length) console.log(`\n版の確認:\n${[...new Set(notes.map((n) => n.replace(/^[^:]+: /, "")))].map((n) => `  ! ${n}`).join("\n")}`);
  console.log(`\n合計 ${pass}/${total}`);
  if (filter) writeProgress(result);
  else writeFileSync(progressFile(), JSON.stringify(result, null, 2) + "\n");
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main(process.argv.slice(2));
}
