#!/usr/bin/env node
// 公開用の dist/ を作る（Cloudflare Workers の Static Assets で配信する）
// 配信するのはビューアと章だけ。調査メモ・模範解答・進捗などは出さない
import { createHash } from "node:crypto";
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, loadLessons } from "./check.mjs";
import { deckProblems, slideProblems } from "./site-checks.mjs";

const DIST = join(ROOT, "dist");
const FILES = ["index.html", "app.js", "style.css", "lib/lesson.js"];

// 静的配信ではフォルダの一覧が返らないので、章の一覧を index.json に書いておく
export function lessonIndex() {
  return readdirSync(join(ROOT, "lessons")).filter((f) => f.endsWith(".md")).sort();
}

const CSP = [
  "default-src 'self'",
  "script-src 'self' https://cdn.jsdelivr.net https://platform.twitter.com https://cdn.syndication.twimg.com",
  "frame-src 'self' https://platform.twitter.com https://syndication.twitter.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://pbs.twimg.com https://abs.twimg.com https://syndication.twitter.com",
  "connect-src 'self' https://cdn.syndication.twimg.com",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join("; ");

// 章に埋め込むスライド（slides/*.html）は1ファイルで完結させ、中の <script> は CSP のハッシュで許す。
// 自サイトの章から iframe で表示するので、このパスだけ frame-ancestors 'self' と SAMEORIGIN にする
const SLIDES = readdirSync(join(ROOT, "slides")).filter((f) => f.endsWith(".html")).sort();

const scriptHashes = SLIDES.flatMap((f) =>
  [...readFileSync(join(ROOT, "slides", f), "utf8").matchAll(/<script>([\s\S]*?)<\/script>/g)].map(
    (m) => `'sha256-${createHash("sha256").update(m[1]).digest("base64")}'`,
  ),
);
const SLIDE_CSP = [
  "default-src 'none'",
  `script-src ${scriptHashes.join(" ") || "'none'"}`,
  "style-src 'unsafe-inline'",
  "img-src 'self' data:",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'self'",
].join("; ");

const problems = [
  ...SLIDES.flatMap((f) => slideProblems(f, readFileSync(join(ROOT, "slides", f), "utf8"))),
  ...deckProblems(loadLessons(), SLIDES),
];
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}

rmSync(DIST, { recursive: true, force: true });
mkdirSync(join(DIST, "lessons"), { recursive: true });
for (const f of FILES) cpSync(join(ROOT, f), join(DIST, f));
// assets/ は図（diagrams/*.svg）だけを公開する。ほかのファイルを置いても出ないようにする
mkdirSync(join(DIST, "assets", "diagrams"), { recursive: true });
for (const f of readdirSync(join(ROOT, "assets", "diagrams")).filter((f) => f.endsWith(".svg"))) {
  cpSync(join(ROOT, "assets", "diagrams", f), join(DIST, "assets", "diagrams", f));
}
mkdirSync(join(DIST, "slides"));
for (const f of SLIDES) cpSync(join(ROOT, "slides", f), join(DIST, "slides", f));
const lessons = lessonIndex();
for (const f of lessons) cpSync(join(ROOT, "lessons", f), join(DIST, "lessons", f));
writeFileSync(join(DIST, "lessons", "index.json"), JSON.stringify(lessons) + "\n");
writeFileSync(
  join(DIST, "_headers"),
  `/*\n  Content-Security-Policy: ${CSP}\n  X-Content-Type-Options: nosniff\n  X-Frame-Options: DENY\n  Referrer-Policy: same-origin\n` +
    `\n/slides/*\n  ! Content-Security-Policy\n  ! X-Frame-Options\n  Content-Security-Policy: ${SLIDE_CSP}\n  X-Frame-Options: SAMEORIGIN\n`,
);
console.log(`dist/ を作りました（章 ${lessons.length} 件、スライド ${SLIDES.length} 件）`);
