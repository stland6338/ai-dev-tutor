#!/usr/bin/env node
// 公開用の dist/ を作る（Cloudflare Workers の Static Assets で配信する）
// 配信するのはビューアと章だけ。調査メモ・模範解答・進捗などは出さない
import { cpSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "./check.mjs";

const DIST = join(ROOT, "dist");
const FILES = ["index.html", "app.js", "style.css", "lib/lesson.js"];

// 静的配信ではフォルダの一覧が返らないので、章の一覧を index.json に書いておく
export function lessonIndex() {
  return readdirSync(join(ROOT, "lessons")).filter((f) => f.endsWith(".md")).sort();
}

const CSP = [
  "default-src 'self'",
  "script-src 'self' https://cdn.jsdelivr.net",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "connect-src 'self'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join("; ");

rmSync(DIST, { recursive: true, force: true });
mkdirSync(join(DIST, "lessons"), { recursive: true });
for (const f of FILES) cpSync(join(ROOT, f), join(DIST, f));
const lessons = lessonIndex();
for (const f of lessons) cpSync(join(ROOT, "lessons", f), join(DIST, "lessons", f));
writeFileSync(join(DIST, "lessons", "index.json"), JSON.stringify(lessons) + "\n");
writeFileSync(
  join(DIST, "_headers"),
  `/*\n  Content-Security-Policy: ${CSP}\n  X-Content-Type-Options: nosniff\n  X-Frame-Options: DENY\n  Referrer-Policy: strict-origin-when-cross-origin\n`,
);
console.log(`dist/ を作りました（章 ${lessons.length} 件）`);
