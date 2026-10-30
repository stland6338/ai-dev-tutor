#!/usr/bin/env node
// 配信の前に、手元が origin/main と同じかを確かめる
// build は作業ツリーをそのまま dist/ に写すので、作業中のブランチや未コミットの章が公開されないようにする
import { execFileSync } from "node:child_process";
import { ROOT } from "./check.mjs";

const git = (...args) => execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trimEnd();
const problems = [];

const branch = git("branch", "--show-current");
if (branch !== "main") problems.push(`ブランチが main ではない（${branch || "detached HEAD"}）`);

// 未追跡のファイルも数える。lessons/ に置いただけの章も build に入るため
const dirty = git("status", "--porcelain");
if (dirty) problems.push(`コミットしていない変更がある:\n${dirty.replace(/^/gm, "    ")}`);

try {
  git("fetch", "--quiet", "origin", "main");
  const head = git("rev-parse", "HEAD");
  const remote = git("rev-parse", "origin/main");
  if (head !== remote) problems.push(`HEAD が origin/main と違う（${head.slice(0, 7)} / ${remote.slice(0, 7)}）。pull か push をする`);
} catch {
  problems.push("origin/main を取りに行けなかった");
}

if (problems.length) {
  console.error("✗ 配信を止めた:");
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log("✓ origin/main と同じ内容なので配信する");
