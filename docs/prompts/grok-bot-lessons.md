# Grok Bot に渡すプロンプト（Grok Bot 章の執筆依頼）

下の「---ここから---」から「---ここまで---」までを Grok Bot にそのまま貼る。
出力形式は [docs/lesson-format.md](../lesson-format.md) に合わせてある。形式を変えたらここも直す。

受け取った章は、次の手順で取り込む。
1. `lessons/` に置き、`command` 課題の `run` の中身を読んで確かめる
2. `starter/` と `solutions/` に、課題に合わせたファイルを足す
3. `npm test` と `npm run self-test` を通す

セットアップの章は `lessons/d02-grok-bot.md` として手で書いた（2026-10-26）。このプロンプトで頼むのは、その続きの d03・d04 の2章。`d01` は Grok Build の章のために空けてある。

---ここから---

# 依頼: 「Grok Bot で開発する準備」教材の章を書く

## 目的
日本語のハンズオン教材サイト「ai-dev-tutor」に、Grok Bot の章を追加したい。
読み手が Grok Bot をセットアップし、自分の GitHub リポジトリの開発タスクを Grok Bot に任せられる状態になることが、この章のゴール。

## 読み手
- Claude Code を毎日使っている、実務経験のある開発者（日本在住）
- CLAUDE.md・hooks・skills・MCP は知っている。Grok Bot は触ったことがない
- 知っていることは説明しない。Claude Code との違いと、Grok Bot に固有の点だけを書く

## 書く内容（2章まで）
セットアップ（プラン、Bot の作り方、スキル、ルーティン、Connect apps）は既にある章で扱ったので書かない。

1. リポジトリを Grok Bot 向けに整える: GitHub 連携、Cursor Cloud Agents にコーディングを任せる流れ、AGENTS.md / CLAUDE.md のどちらがどこで読まれるか、セットアップスクリプトや secrets の扱い
2. 開発タスクを頼む: アプリ・X の @bot・Slack から頼む方法、結果（PR など）の受け取り方と確かめ方

章の分け方は内容に合わせて変えてよい（最大2章）。

## 守ること
- 根拠にするのは、公式資料（docs.x.ai/grok-bot/*、x.ai/news、xAI と Cursor の公式ドキュメント）と、あなた自身の実行結果だけにする
- 文ごとに、確認の度合いを次の印で示す
  - `[V]` 公式ページで確認した
  - `[R]` あなたが自分のクラウドコンピュータで実際に動かして確認した
  - `[U]` 未確認・推測
- 公式資料に書かれていないこと（例: GitHub のリポジトリ権限の詳細、Team Setup Scripts の書式）は、「公式資料に記載なし（YYYY-MM-DD 時点）」と書く。推測で埋めない
- 後で推奨が変わったときに「この時点ではこうだった」と読めるように、バージョンと日付を必ず残す。各章の frontmatter の `as_of` に確認日を、`applies_to` に Grok Bot アプリのバージョン（わからなければ "beta"）を書く
- 公式の告知: xAI の公式アカウントや関係者の X 投稿で、使い方や推奨の手順に触れたものを各章に1〜3件載せる。載せるのは「投稿者・日付・URL・1行の要約」だけで、本文は引用しない。原文を直接開いて確かめたものは `verified: true`、まとめ記事などで知っただけなら `verified: false`
- 推奨の移り変わりを frontmatter の `history` に残す（バージョンまたは日付・その時点の推奨・`current` / `superseded` / `experimental`）
- API キー・トークン・メールアドレスなどの値は書かない。必要な箇所は `<YOUR_XAI_API_KEY>` のような置き換え用の文字列にする
- 地域の制限（@bot の対象外の国など）が日本の読み手に関係するなら書く

## ハンズオンの形式（必須）
教材は「vimtutor 形式」にする。読み手は章の Markdown を読みながら、手元のリポジトリを編集し、`npm run check` で合否を確かめる。
編集を伴う課題は次の exercise ブロックで書く。

```markdown
<!-- exercise id="d03-agents-md" check="file-contains" path="sample-app/AGENTS.md" pattern="^## Test" -->
**課題**: AGENTS.md にテストの実行方法を書く。見出しは `## Test` にする。
<!-- /exercise -->
```

- 読み手の手元には演習用の workspace がある。中身は `sample-app/`（依存パッケージのない Node の CLI「tasklog」。`npm test` でテスト、git リポジトリ）と `notes/`（ワークシート）。`path` は workspace から見た相対パスで書く
- `check` に使える値
  - `file-exists`: `path` のファイルがあれば合格
  - `file-contains`: `path` のファイルに `pattern`（正規表現）に合う箇所があれば合格
  - `json-has`: `path` の JSON の `key`（`.` 区切り）に値があれば合格
  - `command`: `cwd` で `run` をシェルで実行し、終了コード 0 なら合格。読み手の手元で実行されるので、破壊的なコマンドや通信するコマンドは書かない
  - `manual`: 機械では判定できない課題。読み手が自分で完了にする
- 属性の値に `"` は使えない（必要なら正規表現で `\x22` と書く）
- 課題の `id` は `d03-` のように章の id の先頭3文字で始め、全章で重複させない
- アプリの操作のように手元のファイルでは判定できない課題は `manual` にし、「何が見えれば完了か」を1文で書く
- 1章あたり課題は3〜6個
- 課題ごとに、合格する模範解答（作るファイルの中身）も添える。ファイルで判定する課題は、読み手がまだ手を付けていない状態では不合格になること

## 出力形式
章ごとに Markdown ファイル1つ。ファイル名は `lessons/<id>.md`、id は `d03-grok-bot-repo`・`d04-grok-bot-tasks` のように `d03` から順に付ける（`d01` は Grok Build の章、`d02` はセットアップの章で使用済み）。**ファイルの中身だけ**をコードブロックに入れて返す。

frontmatter は YAML の一部だけを使う。`key: 値`、`key:` の下に `- 値` の列、`- k: v` で始めて続く行を字下げした地図の列、の3つだけ。`{}` や `[]` のインライン表記は使わない。

```markdown
---
id: d03-grok-bot-repo
title: リポジトリを Grok Bot 向けに整える
track: grok
order: 3
as_of: 2026-10-24
applies_to: "Grok Bot beta"
estimated_minutes: 20
sources:
  - url: https://docs.x.ai/grok-bot/get-started
    checked: 2026-10-24
announcements:
  - author: "@xai"
    date: 2026-08-11
    url: https://x.com/...
    summary: 1行の要約
    verified: true
history:
  - version: beta
    date: 2026-08-11
    advice: その時点で公式が勧めていたやり方を1行で
    status: current
---

## この章でできるようになること
（2〜3行）

## Claude Code との違い
（表で。観点 / Claude Code / Grok Bot）

## 手順
（exercise ブロックを含む本文）

## うまくいかないとき
（実際に起きた、または公式資料に書かれているつまずきだけ）

## 確認の記録
（あなたが [R] として実際に試した操作と結果の要約。試していなければ「なし」）
```

最後に、全章を通して `[U]` を付けた項目と、公式資料に記載がなかった項目を一覧にして添えること。

---ここまで---
