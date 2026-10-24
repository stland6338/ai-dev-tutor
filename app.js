// 教材ビューア。元データは lessons/*.md と progress.json だけで、ここは読んで表示するだけ
import { parseLesson } from "./lib/lesson.js";

const TRACKS = {
  intro: "はじめに",
  "claude-code": "A Claude Code 単体",
  pstack: "B pstack",
  env: "C 環境",
  grok: "D Grok",
  "llm-app": "E LLM アプリ",
  prompt: "F プロンプト",
};
const STATUS = { current: "継続", superseded: "置換", experimental: "実験" };
const CHECK = { "file-exists": "ファイル", "file-contains": "ファイルの中身", "json-has": "設定", command: "コマンド", manual: "手動" };

// localStorage は使えないことがある（プライベートウィンドウ等）。読み書きはすべてここを通す
const store = {
  get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
};

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const safeUrl = (u) => (/^https?:\/\//.test(String(u ?? "")) ? esc(u) : "#");
// 章の画像とそのリンクは lessons/ から見たパス（../assets/...）で書く。ビューアは教材の直下で開くので付け替える
const md = (s) => window.DOMPurify.sanitize(window.marked.parse(s)).replaceAll('="../assets/', '="assets/');
const $ = (id) => document.getElementById(id);

let LESSONS = [];
let PROGRESS = null;

// 公開版は build が書いた lessons/index.json、手元の npm run serve では python の http.server が返す一覧から .md を拾う
async function listLessonFiles() {
  const index = await fetch("lessons/index.json", { cache: "no-store" }).catch(() => null);
  if (index?.ok) return index.json();
  const html = await fetch("lessons/", { cache: "no-store" }).then((r) => r.text());
  return [...new Set([...html.matchAll(/href="([^"/]+\.md)"/g)].map((m) => m[1]))].sort();
}

async function load() {
  const files = await listLessonFiles();
  const all = await Promise.all(
    files.map(async (f) => ({ file: f, ...parseLesson(await fetch(`lessons/${f}`, { cache: "no-store" }).then((r) => r.text())) })),
  );
  // frontmatter の無い md（README など）は章として扱わない
  LESSONS = all.filter((l) => l.meta.id);
  try {
    const r = await fetch("progress.json", { cache: "no-store" });
    if (r.ok) PROGRESS = await r.json();
  } catch {}
}

const lessonProgress = (l) => {
  const done = l.exercises.filter((ex) => PROGRESS?.exercises?.[ex.id]?.ok).length;
  return { done, total: l.exercises.length };
};

function renderToc(currentId) {
  const groups = new Map();
  for (const l of LESSONS) {
    const t = l.meta.track ?? "intro";
    if (!groups.has(t)) groups.set(t, []);
    groups.get(t).push(l);
  }
  $("toc").innerHTML = [...groups]
    .map(([track, ls]) => `
      <section>
        <h2>${esc(TRACKS[track] ?? track)}</h2>
        <ol>${ls.map((l) => {
          const p = lessonProgress(l);
          const state = p.total && p.done === p.total ? "done" : p.done ? "partial" : "";
          return `<li><a href="#/${esc(l.meta.id)}" class="${l.meta.id === currentId ? "current" : ""} ${state}">
            <span class="t">${esc(l.meta.title)}</span><span class="n">${p.total ? `${p.done}/${p.total}` : ""}</span></a></li>`;
        }).join("")}</ol>
      </section>`)
    .join("");

  const all = LESSONS.flatMap((l) => l.exercises);
  const done = all.filter((ex) => PROGRESS?.exercises?.[ex.id]?.ok).length;
  $("overall").innerHTML = PROGRESS
    ? `<span class="bar"><span style="width:${all.length ? (done / all.length) * 100 : 0}%"></span></span>${done}/${all.length}`
    : `<span class="muted">npm run check で進捗が出ます</span>`;
}

function exerciseCard(ex) {
  const r = PROGRESS?.exercises?.[ex.id];
  const state = !PROGRESS ? "unknown" : r?.ok ? "ok" : "ng";
  const label = { unknown: "未判定", ok: "合格", ng: "まだ" }[state];
  const target = ex.check === "command" ? `${ex.cwd ? `${ex.cwd}: ` : ""}${ex.run}` : ex.path ?? "";
  const hint = ex.check === "manual" ? `npm run done -- ${ex.id}` : `npm run check -- --lesson ${ex.id.split("-")[0]}`;
  return `
    <section class="exercise ${state}" id="ex-${esc(ex.id)}">
      <header>
        <span class="badge ${state}">${label}</span>
        <code class="exid">${esc(ex.id)}</code>
        <span class="kind">${esc(CHECK[ex.check] ?? ex.check)}${target ? `：<code>${esc(target)}</code>` : ""}</span>
      </header>
      <div class="body">${md(ex.text)}</div>
      ${state === "ng" && r?.detail && ex.check !== "manual" ?`<p class="detail">${esc(r.detail)}</p>` : ""}
      <p class="hint"><code>${esc(hint)}</code></p>
    </section>`;
}

// 本文の exercise ブロックをカードに置き換えてから Markdown として表示する
function renderBody(body, exercises) {
  const parts = body.split(/<!--\s*exercise\s+[\s\S]*?-->[\s\S]*?<!--\s*\/exercise\s*-->/);
  return parts.map((p, i) => md(p) + (exercises[i] ? exerciseCard(exercises[i]) : "")).join("");
}

function renderAside(meta) {
  const items = meta.announcements ?? [];
  if (!items.length) return "";
  return `
    <details class="announce"${matchMedia("(min-width: 1101px)").matches ? " open" : ""}>
      <summary>公式の告知</summary>
      <ul>${items.map((a) => `
        <li>
          <div class="who">${esc(a.author)}${a.date ? ` · <time>${esc(a.date)}</time>` : ""}
            ${a.verified === false ? `<span class="unverified" title="原文を直接確かめていません">未確認</span>` : ""}</div>
          <p>${esc(a.summary)}</p>
          <a href="${safeUrl(a.url)}" target="_blank" rel="noopener noreferrer">原文を開く ↗</a>
        </li>`).join("")}</ul>
      <p class="note">投稿の本文は引用せず、要約だけを載せています。</p>
    </details>`;
}

// X の投稿 URL（announcements と sources から）。status の数字 ID を取り出す
const X_STATUS = /^https:\/\/(?:www\.|mobile\.)?(?:x|twitter)\.com\/([A-Za-z0-9_]{1,15})\/status\/(\d{5,25})(?:[/?#].*)?$/;
function xPosts(meta) {
  const seen = new Set();
  const out = [];
  for (const a of [...(meta.announcements ?? []), ...(meta.sources ?? [])]) {
    const m = X_STATUS.exec(String(a.url ?? ""));
    if (!m || seen.has(m[2])) continue;
    seen.add(m[2]);
    out.push({ id: m[2], url: `https://x.com/${m[1]}/status/${m[2]}`, author: a.author ?? `@${m[1]}`, date: a.date, summary: a.summary });
  }
  return out;
}

function renderXPosts(meta) {
  const posts = xPosts(meta);
  if (!posts.length) return "";
  return `
    <section class="x-posts">
      <div class="x-head">
        <h2>Xの関連投稿 <span class="muted">（${posts.length}件）</span></h2>
        <button type="button" class="x-toggle" aria-expanded="false" aria-controls="x-grid">投稿を表示</button>
      </div>
      <div class="x-body" id="x-grid" hidden>
        <p class="note">X の埋め込みで表示しています（開いたときだけ X に接続します）。読み込めないときはリンクだけを出します。</p>
        <div class="x-grid">${posts.map((p) => `
          <div class="x-card" data-tweet-id="${esc(p.id)}">
            <a class="x-fallback" href="${safeUrl(p.url)}" target="_blank" rel="noopener noreferrer">
              <span class="who">${esc(p.author)}${p.date ? ` · <time>${esc(p.date)}</time>` : ""}</span>
              ${p.summary ? `<span class="sum">${esc(p.summary)}</span>` : ""}
              <span class="open">X で開く ↗</span>
            </a>
            <div class="x-embed"></div>
          </div>`).join("")}</div>
      </div>
    </section>`;
}

// ボタンを押すまで widgets.js を読まない（X へ通信しない）
function bindXToggle() {
  const btn = document.querySelector(".x-toggle");
  if (!btn) return;
  const body = document.getElementById("x-grid");
  let embedded = false;
  btn.addEventListener("click", () => {
    const open = btn.getAttribute("aria-expanded") !== "true";
    btn.setAttribute("aria-expanded", String(open));
    btn.textContent = open ? "投稿を閉じる" : "投稿を表示";
    body.hidden = !open;
    if (open && !embedded) { embedded = true; embedXPosts(); }
  });
}

// widgets.js は X の投稿がある章を開いたときに一度だけ読む
let widgetsPromise = null;
function loadWidgets() {
  if (window.twttr?.widgets?.createTweet) return Promise.resolve(window.twttr);
  widgetsPromise ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://platform.twitter.com/widgets.js";
    s.async = true;
    s.charset = "utf-8";
    s.onload = () => (window.twttr?.ready ? window.twttr.ready((t) => resolve(t)) : reject(new Error("twttr missing")));
    s.onerror = () => { widgetsPromise = null; reject(new Error("widgets.js failed")); };
    document.head.append(s);
  });
  return widgetsPromise;
}

let renderSeq = 0;
async function embedXPosts() {
  const seq = ++renderSeq;
  const cards = [...document.querySelectorAll(".x-card")];
  if (!cards.length) return;
  let twttr;
  try {
    twttr = await Promise.race([loadWidgets(), new Promise((_, r) => setTimeout(() => r(new Error("timeout")), 8000))]);
  } catch {
    return; // リンク表示のまま
  }
  if (seq !== renderSeq) return; // 別の章に移った
  const dark = document.documentElement.dataset.theme
    ? document.documentElement.dataset.theme === "dark"
    : matchMedia("(prefers-color-scheme: dark)").matches;
  for (const card of cards) {
    const target = card.querySelector(".x-embed");
    twttr.widgets
      .createTweet(card.dataset.tweetId, target, { lang: "ja", dnt: true, theme: dark ? "dark" : "light", conversation: "none", align: "center" })
      .then((el) => { if (el) card.classList.add("embedded"); })
      .catch(() => {});
  }
}

function renderHistory(meta) {
  const h = meta.history ?? [];
  if (!h.length) return "";
  return `
    <section class="history">
      <h2>推奨の年表</h2>
      <ol>${h.map((x) => `
        <li class="${esc(x.status)}">
          <div class="when"><code>${esc(x.version)}</code>${x.date ? ` <time>${esc(x.date)}</time>` : ""}</div>
          <div class="what">${esc(x.advice)} <span class="status ${esc(x.status)}">${esc(STATUS[x.status] ?? x.status)}</span>
            ${x.note ? `<p>${esc(x.note)}</p>` : ""}</div>
        </li>`).join("")}</ol>
    </section>`;
}

function renderSources(meta) {
  const s = meta.sources ?? [];
  if (!s.length) return "";
  return `<section class="sources"><h2>出典</h2><ul>${s
    .map((x) => `<li><a href="${safeUrl(x.url)}" target="_blank" rel="noopener noreferrer">${esc(x.url)}</a>${x.checked ? ` <span class="muted">（${esc(x.checked)} 確認）</span>` : ""}</li>`)
    .join("")}</ul></section>`;
}

function versionWarning(meta) {
  const notes = (PROGRESS?.version_notes ?? []).filter((n) => n.startsWith(`${meta.id}:`));
  return notes.map((n) => `<p class="warn">${esc(n.replace(/^[^:]+: /, ""))}</p>`).join("");
}

// frontmatter の deck（slides/ の1ファイル HTML）を章の上に iframe で出す。自サイトのスライドだけを許す
function renderDeck(meta) {
  const src = String(meta.deck ?? "");
  if (!/^slides\/[a-z0-9-]+\.html$/.test(src)) return "";
  return `
    <section class="deck">
      <iframe src="${esc(src)}" title="${esc(meta.title)}（スライド）" loading="lazy" allow="fullscreen"></iframe>
      <p class="deck-open"><a href="${esc(src)}" target="_blank" rel="noopener">スライドを新しいタブで開く ↗</a></p>
    </section>`;
}

function renderLesson(l) {
  const { meta } = l;
  const i = LESSONS.indexOf(l);
  const prev = LESSONS[i - 1];
  const next = LESSONS[i + 1];
  $("main").innerHTML = `
    <article class="lesson">
      <div class="asof">
        <strong>${esc(meta.as_of)}</strong> 時点 · <strong>${esc(meta.applies_to)}</strong> の推奨
        ${meta.official_ref ? `<span class="ref">公式の対応: ${esc(meta.official_ref)}</span>` : ""}
        ${meta.estimated_minutes ? `<span class="ref">目安 ${esc(meta.estimated_minutes)} 分</span>` : ""}
      </div>
      ${versionWarning(meta)}
      ${renderDeck(meta)}
      <div class="cols">
        <div class="content">
          <h1>${esc(meta.title)}</h1>
          ${renderBody(l.body, l.exercises)}
          ${renderXPosts(meta)}
          ${renderHistory(meta)}
          ${renderSources(meta)}
          <nav class="pager">
            ${prev ? `<a href="#/${esc(prev.meta.id)}">← ${esc(prev.meta.title)}</a>` : "<span></span>"}
            ${next ? `<a href="#/${esc(next.meta.id)}">${esc(next.meta.title)} →</a>` : ""}
          </nav>
        </div>
        <aside>${renderAside(meta)}</aside>
      </div>
    </article>`;
  document.title = `${meta.title} · ai-dev-tutor`;
  renderSeq++; // 前の章の描画を捨てる
  bindXToggle();
}

function route() {
  let id = location.hash.replace(/^#\/?/, "");
  try { id = decodeURIComponent(id); } catch {}
  const l = LESSONS.find((x) => x.meta.id === id) ?? (id ? null : LESSONS[0]);
  renderToc(l?.meta.id);
  if (l) {
    store.set("last-lesson", l.meta.id);
    renderLesson(l);
  } else {
    $("main").innerHTML = `<p>章「${esc(id)}」が見つかりません。<a href="#/">最初の章へ</a></p>`;
  }
  document.body.classList.remove("toc-open");
  $("menu").setAttribute("aria-expanded", "false");
  window.scrollTo(0, 0);
}

function initTheme() {
  const saved = store.get("theme");
  if (saved) document.documentElement.dataset.theme = saved;
  $("theme").addEventListener("click", () => {
    const dark = document.documentElement.dataset.theme
      ? document.documentElement.dataset.theme === "dark"
      : matchMedia("(prefers-color-scheme: dark)").matches;
    const next = dark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    store.set("theme", next);
  });
  $("menu").addEventListener("click", () => {
    const open = document.body.classList.toggle("toc-open");
    $("menu").setAttribute("aria-expanded", String(open));
  });
}

initTheme();
window.addEventListener("load", async () => {
  if (!window.marked || !window.DOMPurify) {
    $("main").innerHTML = `<p class="warn">表示用のライブラリ（marked・DOMPurify）を cdn.jsdelivr.net から読み込めませんでした。ネットワークを確かめてください。章の Markdown は lessons/ をエディタで直接読むこともできます。</p>`;
    return;
  }
  try {
    await load();
  } catch (e) {
    $("main").innerHTML = `<p class="warn">章を読み込めませんでした。教材フォルダで <code>npm run serve</code> を実行し、http://localhost:3250 から開いてください。</p>`;
    return;
  }
  if (!location.hash && store.get("last-lesson")) location.hash = `#/${store.get("last-lesson")}`;
  window.addEventListener("hashchange", route);
  route();
});
