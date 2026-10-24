import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { homedir, tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { parseAppliesTo, parseExercises, parseFrontmatter, compareVersions, countExerciseTags } from "../lib/lesson.js";
import { ROOT, evaluate, loadLessons, versionNotes } from "./check.mjs";
import { MARKER, workspaceProblem } from "./start.mjs";

test("frontmatter: 引用符の中の # は残し、CRLF と BOM も読める", () => {
  const { meta } = parseFrontmatter('﻿---\r\nsummary: "fix #12 now"   # コメント\r\nid: x\r\n---\r\n本文');
  assert.equal(meta.summary, "fix #12 now");
  assert.equal(meta.id, "x");
});

test("frontmatter: 値のあとに列を書くとエラーにする", () => {
  assert.throws(() => parseFrontmatter("---\ntags: a\n  - b\n---\n"), /列/);
});

test("workspace の場所: 教材の中・教材を含む親は拒否する", () => {
  assert.match(workspaceProblem(join(ROOT, "workspace")), /外に置いて/);
  assert.match(workspaceProblem(dirname(ROOT)), /含む場所/);
  assert.match(workspaceProblem(homedir()), /含む場所/);
  assert.equal(workspaceProblem(join(tmpdir(), "somewhere-else")), null);
});

// node --test の中から起動すると NODE_TEST_CONTEXT が引き継がれ、課題の `node --test` が常に成功扱いになるので外す
const { NODE_TEST_CONTEXT, ...cleanEnv } = process.env;
const runScript = (script, args, env) =>
  spawnSync(process.execPath, [join(ROOT, "scripts", script), ...args], { encoding: "utf8", env: { ...cleanEnv, ...env } });

test("start: 作成・--reset での退避・印の無いフォルダの拒否", () => {
  const base = mkdtempSync(join(tmpdir(), "tutor-start-"));
  const env = { TUTOR_WORKSPACE: join(base, "ws"), TUTOR_MANUAL: join(base, "manual.json") };
  assert.equal(runScript("start.mjs", [], env).status, 0);
  assert.ok(existsSync(join(base, "ws", MARKER)));
  assert.ok(existsSync(join(base, "ws", "sample-app", ".git")));
  assert.equal(runScript("start.mjs", ["--reset"], env).status, 0);
  assert.equal(readdirSync(base).filter((f) => f.startsWith("ws.bak-")).length, 1);
  mkdirSync(join(base, "other"));
  const r = runScript("start.mjs", ["--reset"], { ...env, TUTOR_WORKSPACE: join(base, "other") });
  assert.equal(r.status, 1);
  assert.ok(existsSync(join(base, "other")), "印の無いフォルダは退避しない");
});

test("check: 1章だけの判定と done が progress.json に重なる", () => {
  const base = mkdtempSync(join(tmpdir(), "tutor-check-"));
  const env = { TUTOR_WORKSPACE: join(base, "ws"), TUTOR_MANUAL: join(base, "manual.json"), TUTOR_PROGRESS: join(base, "progress.json") };
  runScript("start.mjs", [], env);
  assert.equal(runScript("check.mjs", ["--lesson"], env).status, 1);
  runScript("check.mjs", [], env);
  const total = Object.keys(JSON.parse(readFileSync(env.TUTOR_PROGRESS, "utf8")).exercises).length;
  writeFileSync(join(base, "ws/notes/00-intro.md"), "準備OK: [x]\nworkspace の場所: /x\n");
  runScript("check.mjs", ["--lesson", "00"], env);
  assert.equal(runScript("check.mjs", ["--done", "--undo", "a01-powerup"], env).status, 0);
  assert.equal(runScript("check.mjs", ["--done", "a01-powerup"], env).status, 0);
  const p = JSON.parse(readFileSync(env.TUTOR_PROGRESS, "utf8"));
  assert.equal(Object.keys(p.exercises).length, total, "部分判定で他の章の結果が消えない");
  assert.equal(p.exercises["00-ready"].ok, true);
  assert.equal(p.exercises["a01-powerup"].ok, true);
  assert.equal(p.exercises["a02-fix"].ok, false);
});

const runHook = (name, input, env = {}) =>
  spawnSync(join(ROOT, "solutions/files/sample-app/.claude/hooks", name), { input, encoding: "utf8", env: { ...process.env, ...env } });

test("模範解答の hook: block-push は git push だけを止める", () => {
  assert.equal(runHook("block-push.sh", JSON.stringify({ tool_input: { command: "git push origin main" } })).status, 2);
  assert.equal(runHook("block-push.sh", JSON.stringify({ tool_input: { command: "npm test" } })).status, 0);
  assert.equal(runHook("block-push.sh", JSON.stringify({ tool_input: { command: "git commit -m x" }, note: "git push" })).status, 0);
});

test("模範解答の hook: require-tests は続行中なら止めず、テストが落ちていれば理由付きで止める", () => {
  const app = mkdtempSync(join(tmpdir(), "tutor-hook-"));
  writeFileSync(join(app, "package.json"), JSON.stringify({ scripts: { test: "echo boom && exit 1" } }));
  assert.equal(runHook("require-tests.sh", JSON.stringify({ stop_hook_active: true }), { CLAUDE_PROJECT_DIR: app }).status, 0);
  const r = runHook("require-tests.sh", JSON.stringify({ stop_hook_active: false, last_assistant_message: '"stop_hook_active": true' }), { CLAUDE_PROJECT_DIR: app });
  assert.equal(r.status, 2);
  assert.match(r.stderr, /boom/);
});

test("frontmatter: 値・値の列・地図の列・コメントを読める", () => {
  const { meta, body } = parseFrontmatter(`---
id: a01-start      # 章の ID
order: 1
title: "はじめる: 最初の依頼"
sources:
  - url: https://example.com/a#b
    checked: 2026-10-24
tags:
  - one
  - two
announcements:
  - author: "@bcherny"
    verified: false
---
本文`);
  assert.equal(meta.id, "a01-start");
  assert.equal(meta.order, 1);
  assert.equal(meta.title, "はじめる: 最初の依頼");
  assert.deepEqual(meta.sources, [{ url: "https://example.com/a#b", checked: "2026-10-24" }]);
  assert.deepEqual(meta.tags, ["one", "two"]);
  assert.deepEqual(meta.announcements, [{ author: "@bcherny", verified: false }]);
  assert.equal(body, "本文");
});

test("exercise ブロックの属性と本文を読める", () => {
  const ex = parseExercises(`前
<!-- exercise id="x-1" check="file-contains" path="a.md" pattern="^OK: \\d+" -->
**課題**: 書く
<!-- /exercise -->
後`);
  assert.equal(ex.length, 1);
  assert.deepEqual({ ...ex[0] }, { id: "x-1", check: "file-contains", path: "a.md", pattern: "^OK: \\d+", text: "**課題**: 書く" });
});

test("5種類の check が合否を返す", () => {
  const ws = mkdtempSync(join(tmpdir(), "tutor-test-"));
  mkdirSync(join(ws, "app/.claude"), { recursive: true });
  writeFileSync(join(ws, "app/notes.md"), "名前: tland\n");
  writeFileSync(join(ws, "app/.claude/settings.json"), JSON.stringify({ hooks: { Stop: [{}] , Empty: [] } }));

  assert.equal(evaluate({ check: "file-exists", path: "app/notes.md" }, ws).ok, true);
  assert.equal(evaluate({ check: "file-exists", path: "app/none.md" }, ws).ok, false);
  assert.equal(evaluate({ check: "file-contains", path: "app/notes.md", pattern: "^名前: \\S+" }, ws).ok, true);
  assert.equal(evaluate({ check: "file-contains", path: "app/notes.md", pattern: "^年齢:" }, ws).ok, false);
  assert.equal(evaluate({ check: "file-contains", path: "app", pattern: "x" }, ws).ok, false);
  assert.equal(evaluate({ check: "json-has", path: "app/.claude/settings.json", key: "hooks.Stop" }, ws).ok, true);
  assert.equal(evaluate({ check: "json-has", path: "app/.claude/settings.json", key: "hooks.Empty" }, ws).ok, false);
  assert.equal(evaluate({ check: "json-has", path: "app/.claude/settings.json", key: "hooks.PreToolUse" }, ws).ok, false);
  assert.equal(evaluate({ check: "command", cwd: "app", run: "test -f notes.md" }, ws).ok, true);
  assert.equal(evaluate({ check: "command", cwd: "app", run: "exit 3" }, ws).ok, false);
  assert.equal(evaluate({ check: "manual", id: "m-1" }, ws, { "m-1": true }).ok, true);
  assert.equal(evaluate({ check: "manual", id: "m-1" }, ws, {}).ok, false);
});

test("applies_to と版の比較", () => {
  assert.deepEqual(parseAppliesTo("Claude Code 2.1.310 / Opus 5.5"), { "claude code": "2.1.310" });
  assert.equal(compareVersions("2.1.310", "2.1.302"), 1);
  assert.equal(compareVersions("2.1.9", "2.1.10"), -1);
  const lessons = [{ meta: { id: "a01", applies_to: "Claude Code 2.1.310", as_of: "2026-10-24" } }];
  assert.equal(versionNotes(lessons, { "claude code": "2.1.310" }).length, 0);
  assert.match(versionNotes(lessons, { "claude code": "2.2.0" })[0], /変わっている可能性/);
  assert.match(versionNotes(lessons, { "claude code": "2.1.302" })[0], /古い/);
});

test("全章の frontmatter に必須項目があり、課題に check がある", () => {
  for (const l of loadLessons()) {
    for (const k of ["id", "title", "track", "order", "as_of", "applies_to"]) {
      assert.ok(l.meta[k] !== undefined && l.meta[k] !== "", `${l.file}: ${k} が無い`);
    }
    assert.equal(l.file, `${l.meta.id}.md`, `${l.file}: ファイル名は <id>.md にする`);
    const tags = countExerciseTags(l.body);
    assert.equal(tags.open, tags.close, `${l.file}: exercise の開始タグと終了タグの数が合わない`);
    assert.equal(l.exercises.length, tags.open, `${l.file}: 読めなかった exercise がある`);
    for (const ex of l.exercises) {
      assert.ok(ex.id && ex.check, `${l.file}: id か check が無い課題がある`);
      if (ex.pattern) new RegExp(ex.pattern, "m");
    }
  }
});
