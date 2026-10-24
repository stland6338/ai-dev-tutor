# ai-dev-tutor

Anthropic / xAI が推奨する AI エージェント開発を、vimtutor 形式（読みながら手元を直し、`npm run check` で合否）で学ぶ教材。依存パッケージなし（Node 20+、python3 で配信）。

## コマンド
- `npm test` — 判定ロジックと全章の frontmatter のテスト
- `npm run self-test` — 新しい workspace で全課題が不合格、`solutions/` を重ねると全課題が合格になることを確かめる。**章や課題を変えたら必ず実行**
- `npm run serve` — ビューア（http://localhost:3250）。プレビューは launch.json の `ai-dev-tutor`
- `npm run deploy` — `dist/` を作って Cloudflare Workers（Static Assets）に配信。公開先は https://ai-dev-tutor.stland6338.workers.dev 。配信するのは `scripts/build.mjs` の FILES と lessons・slides だけ（調査メモ・模範解答・進捗は出さない）。セキュリティヘッダーは build が `dist/_headers` に書く

## 構成
- `lessons/<id>.md` — 章。形式は [docs/lesson-format.md](docs/lesson-format.md)
- `lib/lesson.js` — 章の読み取り。ビューア（app.js）と判定（scripts/check.mjs）の両方が使う
- `starter/` — 読み手の workspace の元。`solutions/files/` は同じ配置の模範解答、`solutions/steps.sh` はその後の手順
- `docs/research-2026-10-24.md` — 章の一次資料（調査メモ）。`[U]` は本文に載せる前に確かめ直す
- `docs/prompts/` — 外部エージェントに章を書かせるプロンプト
- `docs/diagrams/*.drawio` — 図の元（draw.io で編集する）。`sh scripts/diagrams.sh` で `assets/diagrams/*.svg` に書き出す（sandbox の外で実行）。章からは `../assets/diagrams/<名前>.svg` で載せる

## 決まり
- 推奨は版で変わる。章ごとに `as_of`・`applies_to`・`history` を必ず書き、根拠の URL を `sources` に残す
- X の投稿は要約と URL だけ。本文を引用しない。原文を直接確かめていなければ `verified: false`
- 例外: 本文下の「Xの関連投稿」欄は、閲覧者がボタンで開いたときだけ X 公式の埋め込みを表示する（教材の本文には引用せず、要約と URL だけを書く）
- 課題を足したら、`starter/` では不合格・`solutions/` では合格になるように両方を直す
- 外から受け取った章の `command` 課題は、取り込む前に `run` の中身を読む
- workspace（既定 `~/ai-dev-tutor-workspace`）は教材フォルダの外。中に置くと Claude Code がこの CLAUDE.md まで読む
