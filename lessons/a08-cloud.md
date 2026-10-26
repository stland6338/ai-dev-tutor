---
id: a08-cloud
title: クラウドで動かす（cloud sessions・GitHub Actions）
track: claude-code
order: 8
as_of: 2026-10-25
revised: 2026-10-25（公式 docs との照合で修正）
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
  - url: https://code.claude.com/docs/en/env-vars
    checked: 2026-10-25
  - url: https://code.claude.com/docs/en/claude-projects
    checked: 2026-10-25
  - url: https://code.claude.com/docs/en/ultrareview
    checked: 2026-10-25
  - url: https://code.claude.com/docs/en/desktop-scheduled-tasks
    checked: 2026-10-25
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
  - author: "@ClaudeDevs"
    date: 2026-10-06
    url: https://x.com/ClaudeDevs/status/2107542087243907506
    summary: cloud session はタスクごとに新しい VM で Claude Code を動かす。7つの使い方と GitHub の接続方法の現場ガイド
    verified: true
  - author: "@ClaudeDevs"
    date: 2026-10-16
    url: https://x.com/ClaudeDevs/status/2111209208012210409
    summary: Claude Code が会話を gzip して送るようになり、cloud session は入力を始めた時点で起動する
    verified: true
  - author: "@ClaudeDevs"
    date: 2026-10-08
    url: https://x.com/ClaudeDevs/status/2108320296323477683
    summary: Claude Managed Agents で、Slack や GitHub を定期的に読んで報告を投稿する自動化の作り方
    verified: true
  - author: "@ClaudeDevs"
    date: 2026-10-15
    url: https://x.com/ClaudeDevs/status/2110866210573386065
    summary: Code Review の一般提供
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

## 2026-10 の更新: cloud session の現場ガイドから

### 始める前に

- `claude --cloud "<依頼>"` は GitHub のリモートを今のブランチで clone するので、先に push する [V]
- 非公開リポジトリには、GitHub でのサインインに加えて Claude GitHub App のインストールが要る。Auto-fix、GitHub をきっかけにした routine、projects も App が前提 [V]
- VM はおよそ 4 vCPU、16 GB RAM、30 GB ディスク。使われていない VM は回収されるので、長い作業はこまめにコミットする [V]

### 環境の準備

| 置き場所 | 向いているもの |
|---|---|
| setup script | マシンの準備。root で動き `apt install` も使える。exit 0 で終わること。約5分以内なら結果がキャッシュされる |
| SessionStart hook | プロジェクトの準備（`npm install` など）。ローカルとクラウドで同じように動く |
| CLAUDE.md | テストの実行方法。個人の `~/.claude` はクラウドに届かない |

クラウドだけで動かしたい手順は `CLAUDE_CODE_REMOTE` を見て分けます [V]。

```json
"SessionStart": [
  { "matcher": "startup", "hooks": [ { "type": "command", "command": "[ \"$CLAUDE_CODE_REMOTE\" = true ] && npm ci; node --version && git log --oneline -5" } ] }
]
```

> 補足: docs の環境変数一覧によると、cloud session では `CLAUDE_CODE_REMOTE` が自動で `true` になります [V]（https://code.claude.com/docs/en/env-vars ）。

### チケットに「証明」を書く

記事の例では、「npm test を30回続けて回して証明して」と書いたチケットに対し、セッションは40回回して失敗0を示しました [V]。VM の CPU は手元のものではないので、確かめ方は手厚く頼んでかまいません（200回回す、50コミットで二分探索する、遅い結合テストを回すなど）。

### PR を見張らせる

Claude GitHub App を入れたリポジトリでは、セッションに PR を見張らせ、失敗したチェックやレビューコメントに対応させられます [V]。claude.ai/code の CI バーで Auto-fix をオンにするか、ターミナルで PR のブランチにいる状態で `/autofix-pr` を実行します。あいまいな点や設計に関わる点は、Claude が人に聞きます。

### routines（docs では scheduled tasks）

routine（research preview。docs では「cloud scheduled tasks（旧 routines）」）は、プロンプト・リポジトリ・コネクター・環境をまとめて保存したものです [V]。スケジュール（最短で毎時）、専用の HTTP エンドポイント、GitHub のイベントで起動し、毎回 cloud session として動きます。claude.ai/code/routines、デスクトップアプリ、CLI の `/schedule` から作ります。承認の確認なしで動き、既定では `claude/` で始まるブランチに push します。

### Code Review の一般提供

2026-10-15、Code Review が Team と Enterprise で一般提供になりました [V]。管理者はリポジトリごとに Quick / Standard / Deep を選べます。手元では `/code-review` が軽い版として動きます。製品は指摘を投稿するだけで、PR の承認は人の判断のままです。

<!-- exercise id="a08-proof" check="file-contains" path="notes/a08-cloud.md" pattern="[0-9]+ ?回続けて" -->
手順1のチケットの `## 確かめ方` に、テストを何回続けて通すかを書き足す（例: `npm test を20回続けて通す`）。
<!-- /exercise -->

### スケジュールの3つの選び方

desktop-scheduled-tasks のページの比較です [V]。

| | Cloud（scheduled tasks） | Desktop | `/loop` |
|---|---|---|---|
| どこで動くか | クラウド | 自分のマシン | 自分のマシン |
| マシンの電源 | 不要 | 要る（アプリを開いている間だけ） | 要る |
| 開いたセッション | 不要 | 不要 | 要る |
| 手元のファイル | 使えない（毎回新しく clone） | 使える | 使える |
| 最短の間隔 | 1時間 | 1分（Claude が設定したとき。フォームでは1時間） | 1分 |

### Claude Projects（public beta）

1つの会話に関連する仕事を次々に渡すと、Claude が仕事ごとにスレッド（たいていは cloud session）を立てて並列に進めます [V]。指示とメモリはプロジェクトで共有され、**Overview** で終わったスレッド、レビュー待ちの PR、返事待ちのスレッドを見られます。複数のリポジトリにまたがる目標や、1セッションに収まらない移行に向きます。2026-10 時点では Pro / Max で段階的に提供中で、Team / Enterprise ではまだ使えません。

### ultrareview（research preview）

`/code-review ultra` は、クラウドで多数のレビュー役のエージェントを走らせ、見つけたバグを1件ずつ再現して確かめてから報告します [V]。引数なしなら、今のブランチと既定ブランチの差分（コミット前の変更も含む）を見ます。起動前に範囲と見積もり費用が出て、確認すると裏で走ります。claude.ai のアカウントで認証が必要で、Bedrock / Agent Platform / Foundry では使えません。Claude が勝手に始めることはありません。

## 振り返り

- 次の A9 では、外部のツールを MCP でつなぎます。クラウドのセッションでも使えるように、リポジトリの `.mcp.json` に入れる方法も扱います
