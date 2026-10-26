// 公開の前に落とす検査。build.mjs と check.test.mjs の両方が使う

// 属性付きの <script>（type="module"・defer など）は build.mjs が CSP に入れるハッシュの対象から漏れ、本番だけで止まる。手元では CSP が付かず気づけないので、ここで落とす
export function slideProblems(name, html) {
  const bad = [...html.matchAll(/<script\b[^>]*>/g)].map((m) => m[0]).filter((tag) => tag !== "<script>");
  return bad.map((tag) => `slides/${name}: ${tag} は使えない。属性なしの <script> にする（docs/lesson-format.md）`);
}
// 章の deck が指すスライドが無いと、本番で iframe が 404 になる
export function deckProblems(lessons, slides) {
  return lessons
    .filter((l) => l.meta.deck && !slides.includes(String(l.meta.deck).replace(/^slides\//, "")))
    .map((l) => `lessons/${l.file}: deck の ${l.meta.deck} が slides/ に無い`);
}
