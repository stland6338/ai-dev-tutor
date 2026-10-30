---
id: c03-cloudflare
title: Cloudflare に出す（Hono と Void）
track: env
order: 3
as_of: 2026-10-26
revised: 2026-10-29（Void 1.3.0 で静的なページと配信の検知を組んだ実例の節を足した）
applies_to: Claude Code 2.1.310 / Hono 4.13.14 / Void 1.2.1・1.3.0
estimated_minutes: 35
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
  - url: https://void.cloud/guide/jobs
    checked: 2026-10-29
  - url: https://void.cloud/guide/pages-routing/islands
    checked: 2026-10-29
  - url: https://void.cloud/guide/edge/prerendering
    checked: 2026-10-29
  - url: https://void.cloud/guide/env-vars
    checked: 2026-10-29
  - url: https://developers.google.com/youtube/v3/determine_quota_cost
    checked: 2026-10-29
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
  - version: Void 1.3.0
    date: 2026-10-29
    advice: Next.js を使わず、Island ページの事前描画・crons・void/kv・routes を1つの Void アプリにまとめて Workers に出せた（この教材の作者の実例）
    status: experimental
    note: 1.x になって間もなく、版ごとに API が変わる。版を固定し、node_modules/void/docs/ を一次資料にする
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

## 実例: 静的なページと配信の検知を Void だけで組む

この教材の作者が 2026-10-29 に、にじさんじのスプラトゥーン3大会の非公式観戦ガイドを Void 1.3.0 で作った例です。はじめは Next.js の静的書き出しと別の Worker（アルプススタンド2026 と同じ形）で考えていましたが、Void の docs と使った人の記事を読んで、Next.js をやめて Void だけで組みました。

| できること | Void の部品 |
|---|---|
| 読むだけのページ（ルール・概要） | island を持たない Island ページ。デプロイのたびに事前描画され、JS を送らない [V] |
| 一部だけ動くページ（いま配信中・まとめて見る） | Island ページの island だけが hydrate する [V] |
| 配信の検知（1分ごと） | `crons/live.ts` が `void/kv` に書く [V] |
| 配信の情報を返す API | `routes/api/live.ts`。応答に `x-revalidate` を付けて短くキャッシュする [V] |
| 出す | `void deploy` 1回 [V] |

### 使って分かったこと

- **一次資料は同梱の docs**: `npm install` すると `node_modules/void/docs/` に、その版の docs と skill が入る。ネットの記事は版が古いことがあるので、エージェントにはこちらを読ませた [R]
- **確かめるのは `void dev`**: 事前描画はデプロイのときに行われ、`vite build` だけでは HTML が出ない。画面の確かめはローカルの `void dev` で行った [R]
- **cron は手で起こす**: ローカルでは cron が自動で動かない。起動時に出るトークン付きで `POST /__void/scheduled` を送ると1回動く [V]
- **island は相対パスで import する**: `@/` の別名で import した部品は island として登録されず、hydrate されなかった（1.3.0）[R]
- **`.env` と開発時だけの経路**: `.env` があると、起動時のシェルの環境変数が worker に届かなかった。開発時だけ使う切り替えは `routes/api/dev/fixture.dev.ts` に置いた。`.dev.ts` の経路は本番のビルドに入らない [V]。念のため、ビルドのあとに「開発時だけの経路の印が dist に無い」ことを確かめる検査を足した [R]
- **秘密の値の写し**: Cloudflare の Vite プラグインが `.env` の中身を `dist/ssr/.dev.vars` に写していた。ビルドの最後で消し、`void deploy` もこのファイルを送らないことを確かめた [R]。A10 の「秘密の値を外に出さない」は、ビルドの成果物まで見る

### 外の API の利用枠と、無料プランの上限

- **YouTube Data API**: 1日 10,000 ユニット。`videos.list`・`playlistItems.list` は1回1ユニットで、`videos.list` は50件まで ID を渡せる [V]。チャンネルごとに新着を問い合わせる作りだと、97チャンネルを1分ごとに見ると1日約49,000ユニットで足りない。「新しい動画を見つける」（RSS・WebSub・Holodex の API。YouTube の枠を使わない）と「状態を確かめる」（`videos.list` をまとめて）を分けると、最悪でも1日 5,760 ユニットに収まった [R]
- **Workers の無料プラン**: 1日10万回まで [U]（数字は公開の前に Cloudflare の docs で確かめる）。閲覧者のページが30秒ごとに API を取りに行く作りだと、本戦の日のように人が集まる日は足りなくなる。取りに行く間隔を延ばす、タブが裏にある間は止める、結果を Worker を通さずに配る、を検討した
- どちらも、見積もりをデータの検査（`check:data`）に入れ、上限を超える設定にしたら失敗するようにした（B2・A6 の「仕組みで止める」）

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
