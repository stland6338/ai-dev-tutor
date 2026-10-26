---
id: c03-cloudflare
title: Cloudflare に出す（Hono と Void）
track: env
order: 3
as_of: 2026-10-26
applies_to: Claude Code 2.1.310 / Hono 4.13.14 / Void 1.2.1
estimated_minutes: 30
sources:
  - url: https://hono.dev/docs/getting-started/cloudflare-workers
    checked: 2026-10-26
  - url: https://hono.dev/llms.txt
    checked: 2026-10-26
  - url: https://blog.cloudflare.com/deploy-with-void/
    checked: 2026-10-26
  - url: https://void.cloud/guide/quickstart
    checked: 2026-10-26
  - url: https://void.cloud/integrations/agents
    checked: 2026-10-26
  - url: https://void.cloud/integrations/hono
    checked: 2026-10-26
history:
  - version: Hono 4.13.14
    date: 2026-10-26
    advice: Workers に API を出すなら、create-hono の cloudflare-workers のひな形から始める。エージェントには llms.txt で docs を渡す
    status: current
  - version: Void 1.2.1
    date: 2026-10-15
    advice: Vite のアプリを、DB・AI・認証まで含めて Workers に出す。void init が AGENTS.md と skills を入れる
    status: experimental
    note: 公開から日が浅い。VoidZero は数か月本番で使ってきたと書いている
---

## この章でできるようになること

- Cloudflare に出すとき、Hono・Void・静的配信のどれを使うかを決められる
- Hono の Worker を Claude Code と一緒に作り、手元で動かせる
- Void がエージェントに渡すもの（AGENTS.md の節と skills）を確かめてから使える

C1・C2 で整えた環境から、作ったものを外に出す章です。この教材自身も Cloudflare Workers で配信しています。

## どれを使うか

| 作るもの | 使うもの | 例 |
|---|---|---|
| 静的なファイルだけ | Workers Static Assets（wrangler だけ） | この教材の `npm run deploy` |
| 画面の無い API・webhook | Hono の Worker | この章のハンズオン |
| 画面と API と DB・AI を1つのアプリで | Void | Vite のアプリに `void/db`・`void/ai` を足す |

### Hono

Web 標準の上に作られた、小さく速い Web フレームワークです。Cloudflare Workers・Deno・Bun・Node.js などで、同じコードが動きます [V]。`npm create hono@latest` に `cloudflare-workers` のひな形があり、`npm run dev` で手元（`http://localhost:8787`）、`npm run deploy` で Workers に出ます [V]。

### Void

Cloudflare と VoidZero（Vite の作者たち）が 2026-10-15 に公開しました。Vite のアプリを Workers のフルスタックのアプリにする SDK・CLI と、チームで自前で立てる Platform です [V]。

- `void deploy` が、build・migration・資源の用意・配信をまとめて行う。`void/db` を import すると、手元では DB、本番では D1 が用意される [V]
- handler は Hono の上で動く。Hono の middleware を `defineMiddleware`・`defineHandler` でそのまま使える [V]
- 認証は Better Auth、AI は AI Gateway を通る [V]
- MIT ライセンス（npm の void 1.2.1）[V]

## エージェントと組み合わせる

| 道具 | エージェントに渡すもの | この教材の章 |
|---|---|---|
| Hono | `https://hono.dev/llms.txt`（目次）、`llms-small.txt`（要点）、`llms-full.txt`（全部）[V] | 必要なときに読ませる（F2 の just-in-time） |
| Void | `void init` が AGENTS.md に Void の節を足し、skill の `void` と `migrate-vite-cloudflare-to-void` を `.claude/skills/` にリンクする。docs は `node_modules/void/docs/` に入る [V] | AGENTS.md（C1）、skills（A5） |

気をつけること:

- 道具が入れる skill や AGENTS.md の節も、外から来た指示です。使う前に中身を読みます（A10）
- `void init` は既存の AGENTS.md に足す前に確認を求め、Void の節の外は残します。CI では既存の指示を変えません [V]
- デプロイは外に出す操作です。Claude に任せるときも承認を挟みます（A6）。API キーなどは `wrangler secret put` で入れ、`wrangler.jsonc` の `vars` には書きません
- Hono の `cache()` は URL ごとに1つの応答をみんなに返します。利用者ごとに変わるルートには使いません [V]

## ハンズオン

### 1. Hono の Worker を作る

workspace の直下（sample-app の外）に作ります。

```bash
cd ~/ai-dev-tutor-workspace
npm create hono@latest hono-api -- --template cloudflare-workers --install --pm npm
cd hono-api
claude
```

<!-- exercise id="c03-hono-app" check="file-contains" path="hono-api/src/index.ts" pattern="new Hono" -->
`hono-api/src/index.ts` に、ひな形の `new Hono()` があることを確かめる。
<!-- /exercise -->

Claude に、docs を先に読ませてから頼みます。

```text
https://hono.dev/llms-small.txt を読んでから、GET /api/tasks を足して。
返すのは ../sample-app/tasks.json と同じ形（id・title・due・done）の配列。保存先はまだ要らない。
```

<!-- exercise id="c03-hono-route" check="file-contains" path="hono-api/src/index.ts" pattern="app\.get\(./api/tasks" -->
`src/index.ts` に `app.get('/api/tasks', …)` があり、タスクの配列を JSON で返す。
<!-- /exercise -->

<!-- exercise id="c03-hono-dev" check="manual" -->
`npm run dev` で起こし、別のターミナルで `curl http://localhost:8787/api/tasks` を実行して、JSON が返ることを確かめる。終えたら `npm run done -- c03-hono-dev` で完了にする。
<!-- /exercise -->

### 2. Void がエージェントに渡すものを見る

workspace の外の新しいフォルダで試します。

```bash
mkdir -p ~/void-try && cd ~/void-try
npm install -D void
npx void init
git status   # git init していなければ ls -a .claude
```

<!-- exercise id="c03-void-agents" check="file-contains" path="notes/c03-cloudflare.md" pattern="^void init が足すもの: .*(AGENTS\.md|skill)" -->
`notes/c03-cloudflare.md` の `void init が足すもの:` の後ろに、増えたファイル（AGENTS.md の節や `.claude/skills/` の skill）を書く。skill の中身も一度読む。
<!-- /exercise -->

<!-- exercise id="c03-choice" check="file-contains" path="notes/c03-cloudflare.md" pattern="^Hono と Void の使い分け: .{10,}" -->
同じファイルの `Hono と Void の使い分け:` の後ろに、自分が次に作るものならどちらを使うかと、その理由を書く。
<!-- /exercise -->

### 3. 出す（任意）

Cloudflare のアカウントがあるときだけ行います。Workers の無料枠の範囲で動きます。

```bash
cd ~/ai-dev-tutor-workspace/hono-api
npm run deploy
```

初回はブラウザで Cloudflare にログインします。Void なら `npx void deploy` です [V]。

<!-- exercise id="c03-deploy" check="manual" -->
任意。出した URL の `/api/tasks` が手元と同じ JSON を返すことを確かめる。出さない場合も、`npm run done -- c03-deploy` で完了にしてよい。
<!-- /exercise -->

## うまくいかないとき

| 症状 | 対処 |
|---|---|
| `npm create hono` が選択の画面で止まる | `-- --template cloudflare-workers` の前の `--` が抜けている。npm に渡す引数と create-hono に渡す引数を分ける |
| `npm run dev` で port 8787 が使えない | ほかの `wrangler dev` が動いている。止めるか `npx wrangler dev --port 8788` |
| Claude が古い Hono の書き方をする | `llms-small.txt` を読ませてから頼む。それでも違えば `llms-full.txt` の該当の節を読ませる |
| `void init` が AGENTS.md を変えない | CI や対話の無い実行では、既存の指示を変えない [V]。ターミナルで直接実行する |

## 振り返り

- 静的配信・Hono・Void の3つから、作るものに合わせて選べるようになりました。どれもエージェント向けの docs を持っているので、必要なときに読ませます
- 次のトラック D では、ここまでの環境の上で Grok Bot を使います
