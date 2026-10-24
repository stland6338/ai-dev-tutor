---
id: a08-cloud
title: クラウドで動かす（cloud sessions・GitHub Actions）
track: claude-code
order: 8
as_of: 2026-10-24
applies_to: Claude Code 2.1.310 / Opus 5.5
official_ref: Claude Code in Action · Automate Repeat Work（Routines and Headless / GitHub Actions）
estimated_minutes: 40
sources:
  - url: https://code.claude.com/docs/en/claude-code-on-the-web
    checked: 2026-10-24
  - url: https://code.claude.com/docs/en/web-quickstart
    checked: 2026-10-24
  - url: https://code.claude.com/docs/en/routines
    checked: 2026-10-24
  - url: https://code.claude.com/docs/en/github-actions
    checked: 2026-10-24
  - url: https://claude.dev/blog/claude-code-in-the-cloud/
    checked: 2026-10-24
announcements:
  - author: Claude blog
    date: 2026-10-06
    url: https://claude.dev/blog/claude-code-in-the-cloud/
    summary: cloud sessions の現場ガイド。ローカルで計画し、クラウドで作り、teleport で手元に戻す
    verified: true
  - author: Claude blog
    date: 2026-10-15
    url: https://claude.com/resources/articles/code-review-is-now-generally-available
    summary: Code Review（PR ごとの自動レビュー）が一般提供になった
    verified: true
history:
  - version: 2.0.24
    date: 2025-10-20
    advice: Web と CLI の間でセッションを移す（teleport）
    status: current
  - version: 2026-04
    advice: routines で、スケジュール・GitHub のイベント・API からクラウドのエージェントを起動する
    status: current
    note: docs では「scheduled tasks（旧 routines）」に改称
  - version: 2026-10 時点
    advice: GitHub Actions は anthropics/claude-code-action@v1。/install-github-app で設定する
    status: current
    note: "@beta からの移行あり（mode・direct_prompt は廃止）"
---

## この章でできるようになること

- ローカルとクラウドのどちらで動かすかを、作業の性質で決められる
- クラウドのセッションに渡す依頼を「自己完結したチケット」として書ける
- GitHub Actions で、PR や issue の `@claude` に応答させる準備ができる

## 公式の要点

### どこで動かすか

Claude Code in the cloud（2026-10-06）に書かれている使い分けです [V]。

| ローカル | クラウド |
|---|---|
| ローカルの DB、VPN の内側のサービス、手元のハードウェアが要る作業 | 溜まった作業の消化、並列に多く走らせる作業、信頼しきれない作業 |

- 組み合わせ: ローカルで計画 → クラウドで実装 → teleport で手元に戻す
- 準備: GitHub を連携し、GitHub App を入れ、コミットを push しておく。環境の準備には setup script と SessionStart hook を使う
- その場で質問に答えられないので、クラウドに渡す依頼は確かめ方まで書いた自己完結したチケットにする

### 入り口

公式 docs にある入り口です [V]。

| 入り口 | 使い方 |
|---|---|
| claude.ai/code | ブラウザからリポジトリを選んでセッションを始める |
| CLI の `--cloud` / `--teleport` | 手元からクラウドに送る / クラウドのセッションを手元に移す |
| scheduled tasks（旧 routines） | スケジュールや GitHub のイベントで起動する |
| GitHub Actions | `anthropics/claude-code-action@v1`。`/install-github-app` で設定 |

### GitHub Actions の要点

github-actions のページに書かれている要点です [V]。

- `gh auth login` 済みで github.com のリポジトリなら、`/install-github-app` が GitHub App・secret・workflow の PR まで用意してくれる
- secret は `ANTHROPIC_API_KEY`（API キー）か `CLAUDE_CODE_OAUTH_TOKEN`（サブスクリプション。`claude setup-token` で作る）。キーをリポジトリに書かない
- `prompt` を渡さなければ `@claude` のメンションに応答し、渡せばイベントで自動実行する

## ハンズオン

この章の後半はクラウドに sample-app を置く必要があります。自分の GitHub に private リポジトリを作って push するかは、あなた自身が判断してください。教材は push を前提にしません。push しない場合は、ファイルを作る課題だけ行い、manual の課題は飛ばして構いません。

### 1. 自己完結したチケットを書く

<!-- exercise id="a08-ticket" check="file-contains" path="notes/a08-cloud.md" pattern="^## 確かめ方" -->
「tasklog の list に --done / --todo の絞り込みを足す」を題材に、クラウドに渡すチケットを `notes/a08-cloud.md` に書く。節は `## 背景` `## やること` `## 確かめ方` の3つにし、確かめ方には実行するコマンドを書く。
<!-- /exercise -->

### 2. セッション開始時の準備を hook にする

クラウドのセッションは毎回まっさらな環境で始まります。SessionStart hook の標準出力は context に入るので、始めに知っておくべき状態をこの hook で Claude に渡します。

```json
"SessionStart": [
  { "matcher": "startup", "hooks": [ { "type": "command", "command": "node --version && git log --oneline -5" } ] }
]
```

<!-- exercise id="a08-session-start" check="json-has" path="sample-app/.claude/settings.json" key="hooks.SessionStart" -->
A3・A6 の設定は残したまま、`sample-app/.claude/settings.json` の `hooks` に SessionStart hook を足す。
<!-- /exercise -->

### 3. GitHub Actions の workflow を用意する

`/install-github-app` を使うのが公式の近道です。push しない場合は、docs の例を `sample-app/.github/workflows/claude.yml` に写して中身を読みます。

<!-- exercise id="a08-gha" check="file-contains" path="sample-app/.github/workflows/claude.yml" pattern="anthropics/claude-code-action@v1" -->
`claude.yml` を用意する。`permissions` の各行が何のためにあるか（`id-token: write` など）を docs で確かめる。
<!-- /exercise -->

### 4. クラウドで動かす

push した場合だけ行います。

<!-- exercise id="a08-cloud-run" check="manual" -->
claude.ai/code で sample-app のセッションを始め、手順1のチケットを渡して実装させる。結果を `--teleport` で手元に移すか、PR として受け取り、手元で `npm test` を実行して確かめる。終えたら `npm run done -- a08-cloud-run` で完了にする。
<!-- /exercise -->

## トラック A のまとめ

| 章 | 公式が一番言いたいこと |
|---|---|
| A2 | 読ませて、計画して、作って、コミットする。context は限られた資源 |
| A3 | 確かめ方を渡す。強制したいなら hook |
| A4 | CLAUDE.md は短く。条件付きは rules、たまに要るものは skills |
| A5 | subagent は必要なときだけ |
| A6 | 守りは注意ではなく仕組みで |
| A7 | 1つを信頼できてから並べる |
| A8 | クラウドには自己完結したチケットを渡す |

次のトラック B ではここまでの公式の流儀と pstack を比べます。
