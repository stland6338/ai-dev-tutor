#!/usr/bin/env node
// starter/ を workspace に複製し、sample-app を git リポジトリにする
//   npm start              既定は ~/ai-dev-tutor-workspace（TUTOR_WORKSPACE で変更）
//   npm start -- --reset   今の workspace を退避してから作り直す（消さない）
import { cpSync, existsSync, realpathSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { ROOT, workspaceDir } from "./check.mjs";

// この教材が作った workspace の印。--reset はこれがあるフォルダしか退避しない
export const MARKER = ".ai-dev-tutor-workspace";

// まだ無いパスは、ある親までさかのぼって実体のパスにする（/tmp と /private/tmp などをそろえる）
const real = (p) => {
  const abs = resolve(p);
  if (existsSync(abs)) return realpathSync(abs);
  const parent = dirname(abs);
  return parent === abs ? abs : join(real(parent), abs.slice(parent.length + 1));
};
const within = (child, parent) => (child + sep).toLowerCase().startsWith((parent + sep).toLowerCase());

// 教材の中に置くと Claude Code が教材の CLAUDE.md まで読む。教材を含む親を指すと教材ごと退避してしまう
export function workspaceProblem(ws) {
  const w = real(ws);
  const root = real(ROOT);
  if (within(w, root)) return `workspace は教材フォルダの外に置いてください: ${w}`;
  if (within(root, w)) return `workspace に教材フォルダを含む場所は指定できません: ${w}`;
  return null;
}

export function createWorkspace(ws) {
  cpSync(join(ROOT, "starter"), ws, { recursive: true });
  try {
    const app = join(ws, "sample-app");
    // 利用者の git 設定（署名・hooks）に左右されないようにする
    const git = (...args) => execFileSync("git", ["-c", "commit.gpgsign=false", "-c", "core.hooksPath=/dev/null", ...args], { cwd: app, stdio: "pipe" });
    git("init", "-q", "-b", "main");
    git("add", "-A");
    git("-c", "user.name=ai-dev-tutor", "-c", "user.email=tutor@example.invalid", "commit", "-q", "-m", "chore: initial sample-app");
    writeFileSync(join(ws, MARKER), "このフォルダは ai-dev-tutor の workspace です（npm start で作成）\n");
  } catch (e) {
    // 作りかけを残すと、次の npm start が「作成済み」で止まってしまう。今作ったばかりのフォルダなので消す
    rmSync(ws, { recursive: true, force: true });
    throw new Error(`workspace の作成に失敗しました: ${e.stderr?.toString().trim() || e.message}`);
  }
}

function main(argv) {
  const ws = workspaceDir();
  const problem = workspaceProblem(ws);
  if (problem) return console.error(problem), 1;
  if (existsSync(ws)) {
    if (!argv.includes("--reset")) {
      console.log(`workspace は作成済み: ${ws}\n作り直すときは npm start -- --reset（今のものは退避します）`);
      return 0;
    }
    if (!existsSync(join(ws, MARKER))) {
      console.error(`${ws} は npm start で作った workspace ではないため、退避しません（${MARKER} がありません）`);
      return 1;
    }
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    renameSync(ws, `${ws}.bak-${stamp}`);
    console.log(`今の workspace を退避しました: ${ws}.bak-${stamp}`);
    const manual = join(ROOT, "progress-manual.json");
    if (existsSync(manual)) renameSync(manual, `${manual}.bak-${stamp}`);
  }
  createWorkspace(ws);
  console.log(`workspace を作りました: ${ws}\n次: lessons/00-intro.md を開くか、npm run serve でビューアを開く`);
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
  }
}
