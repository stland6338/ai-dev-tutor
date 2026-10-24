#!/usr/bin/env node
// 「未完成なら落ち、答えなら通る」を確かめる
//   1. 新しい workspace では全課題が不合格
//   2. solutions/files を重ね、solutions/steps.sh を実行し、manual を全部完了にすると全課題が合格
import { cpSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ROOT, evaluate, loadLessons } from "./check.mjs";
import { createWorkspace } from "./start.mjs";

const base = mkdtempSync(join(tmpdir(), "ai-dev-tutor-selftest-"));
const ws = join(base, "workspace");
const exercises = loadLessons().flatMap((l) => l.exercises.map((ex) => ({ ...ex, lesson: l.meta.id })));
let failed = 0;

const ids = exercises.map((e) => e.id);
const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
if (dup.length) {
  console.log(`✗ 課題 ID の重複: ${[...new Set(dup)].join(", ")}`);
  failed++;
}

try {
  createWorkspace(ws);
  const passedFresh = exercises.filter((ex) => evaluate(ex, ws, {}).ok);
  for (const ex of passedFresh) console.log(`✗ 新しい workspace で合格してしまう: ${ex.id}`);
  failed += passedFresh.length;

  cpSync(join(ROOT, "solutions/files"), ws, { recursive: true });
  if (existsSync(join(ROOT, "solutions/steps.sh"))) {
    execFileSync("sh", [join(ROOT, "solutions/steps.sh")], { cwd: ws, stdio: "pipe" });
  }
  const manual = Object.fromEntries(exercises.filter((e) => e.check === "manual").map((e) => [e.id, true]));
  for (const ex of exercises) {
    const r = evaluate(ex, ws, manual);
    if (!r.ok) {
      console.log(`✗ 模範解答で不合格: ${ex.id} — ${r.detail}`);
      failed++;
    }
  }
} finally {
  rmSync(base, { recursive: true, force: true });
}

console.log(failed ? `\nself-test 失敗 ${failed} 件（課題 ${exercises.length} 件）` : `\nself-test 合格（課題 ${exercises.length} 件）`);
process.exitCode = failed ? 1 : 0;
