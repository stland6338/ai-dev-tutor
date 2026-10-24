// 章ファイルの読み取り。ブラウザ（app.js）と Node（scripts/check.mjs）の両方から使う
// 形式は docs/lesson-format.md

const FM = /^---\n([\s\S]*?)\n---\n?/;

const scalar = (raw) => {
  const v = raw.trim();
  if (/^".*"$/.test(v) || /^'.*'$/.test(v)) return v.slice(1, -1);
  if (v === "true") return true;
  if (v === "false") return false;
  if (/^-?\d+$/.test(v)) return Number(v);
  return v;
};

// YAML の一部だけ: `key: 値` / `key:` + `- 値` の列 / `- k: v` + 字下げした続きの地図の列
// 引用符の外にある「空白 + #」以降はコメントとして捨てる（URL の # は前に空白が無いので残る）
const stripComment = (s) => {
  let quote = null;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quote) {
      if (c === quote) quote = null;
    } else if (c === '"' || c === "'") {
      quote = c;
    } else if (c === "#" && i > 0 && /\s/.test(s[i - 1])) {
      return s.slice(0, i).trimEnd();
    }
  }
  return s;
};

export function parseFrontmatter(raw) {
  const text = raw.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  const m = text.match(FM);
  if (!m) return { meta: {}, body: text };
  const meta = {};
  let key = null;
  let item = null;
  for (const raw of m[1].split("\n")) {
    const line = stripComment(raw);
    if (!line.trim()) continue;
    const top = line.match(/^([\w-]+):\s*(.*)$/);
    if (top) {
      key = top[1];
      item = null;
      meta[key] = top[2] === "" ? [] : scalar(top[2]);
      continue;
    }
    const li = line.match(/^\s*-\s+(.*)$/);
    if (li && key) {
      if (!Array.isArray(meta[key])) throw new Error(`frontmatter: ${key} は値を持つので、続けて列（- ...）は書けません`);
      const kv = li[1].match(/^([\w-]+):\s*(.*)$/);
      if (kv) {
        item = { [kv[1]]: scalar(kv[2]) };
        meta[key].push(item);
      } else {
        item = null;
        meta[key].push(scalar(li[1]));
      }
      continue;
    }
    const cont = line.match(/^\s+([\w-]+):\s*(.*)$/);
    if (cont && item) item[cont[1]] = scalar(cont[2]);
  }
  return { meta, body: text.slice(m[0].length) };
}

const EX = /<!--\s*exercise\s+([\s\S]*?)-->([\s\S]*?)<!--\s*\/exercise\s*-->/g;

export function parseExercises(raw) {
  const body = raw.replace(/\r\n?/g, "\n");
  const out = [];
  for (const m of body.matchAll(EX)) {
    const attrs = Object.fromEntries([...m[1].matchAll(/([\w-]+)="([^"]*)"/g)].map((a) => [a[1], a[2]]));
    out.push({ ...attrs, text: m[2].trim() });
  }
  return out;
}

// 開始タグと終了タグの数（閉じ忘れると、次の課題が前の課題の本文に呑まれて消えるため検査に使う）
export function countExerciseTags(body) {
  return {
    open: (body.match(/<!--\s*exercise\s/g) ?? []).length,
    close: (body.match(/<!--\s*\/exercise\s*-->/g) ?? []).length,
  };
}

export function parseLesson(text) {
  const { meta, body } = parseFrontmatter(text);
  return { meta, body, exercises: parseExercises(body) };
}

// "Claude Code 2.1.310 / Opus 5.5" → { "claude code": "2.1.310" }
export function parseAppliesTo(s) {
  const out = {};
  for (const part of String(s ?? "").split("/")) {
    const m = part.trim().match(/^(.*?)\s+(\d+\.\d+\.\d+)$/);
    if (m) out[m[1].toLowerCase()] = m[2];
  }
  return out;
}

export function compareVersions(a, b) {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i] > pb[i] ? 1 : -1;
  return 0;
}
