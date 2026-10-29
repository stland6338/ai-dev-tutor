---
id: d03-grok-bot-repo
title: リポジトリを Grok Bot 向けに整える
track: grok
order: 3
as_of: 2026-10-29
revised: 2026-10-29（Cursor のクラウドエージェント前提から、Bot のコンピューターで gh を使いブランチと PR まで作る手順に書き直した）
applies_to: "Grok Bot（2026-10 時点）/ GitHub CLI 2.103.0"
estimated_minutes: 20
sources:
  - url: https://docs.x.ai/grok-bot/overview
    checked: 2026-10-26
  - url: https://x.ai/changelog/bot
    checked: 2026-10-29
  - url: https://cli.github.com/manual/gh_auth_status
    checked: 2026-10-29
  - url: https://cli.github.com/manual/gh_pr_create
    checked: 2026-10-29
  - url: https://cursor.com/docs/cloud-agent/setup
    checked: 2026-10-26
history:
  - version: beta
    date: 2026-10-26
    advice: コーディングは Cursor Cloud Agent に任せ、AGENTS.md の Cloud 用の節と .cursor/environment.json で環境を整える
    status: superseded
    note: 執筆者のプランでは Cloud Agent を起動できず、手順を再現できなかった
  - version: 2026-10
    date: 2026-10-29
    advice: Bot のコンピューターで gh を使い、別の clone とブランチで作業し、テストを通して PR まで。main への push とデプロイは承認後
    status: current
---

## この章でできるようになること

Grok Bot にコードを変えてもらうとき、Bot が迷わず「別のブランチで作業し、テストを通し、PR を出して止まる」ようにリポジトリと Bot の環境を整えます。依頼の出し方と結果の確かめ方は次の [D4](#/d04-grok-bot-tasks)、承認と安全の全体は [D2](#/d02-grok-bot) の「承認と安全」を参照します。

## Claude Code との違い

| 観点 | Claude Code | Grok Bot |
|---|---|---|
| コードを書く場所 | 自分のパソコンの端末 | Bot のクラウドのコンピューター（アカウントに1台、全 Bot で共有）[V]（overview） |
| GitHub への書き込み | 自分の git の認証 | Bot のコンピューターに入れた `gh` のログイン。全 Bot から使える [V]（overview の「共有」） |
| 読む指示ファイル | CLAUDE.md | Bot はリポジトリを開いて読む。C1 の構成なら AGENTS.md を共通の指示にする |
| 止まる場所 | 自分で決める | 依頼文と AGENTS.md に「PR まで。push to main とデプロイは承認後」と書く |

## 手順

### 1. Bot の `gh` がログイン済みか確かめる

Bot に次のように頼みます。

```text
あなたのコンピューターで `gh auth status` を実行して、出力をそのまま見せて。ログインしていなければ、何もせずにそう伝えて。
```

`Logged in to github.com account <名前>` と出れば使えます [R]。出なければ、Bot に `gh auth login` を始めてもらい、ブラウザでのサインインは自分で行います。トークンをチャットに貼らないでください（[D2](#/d02-grok-bot) の「承認と安全」）。

ログインは共有のコンピューターに残り、ほかの Bot も使えます [V]（overview）。リポジトリに書ける範囲が広いアカウントなら、演習用のリポジトリだけに権限を絞ったアカウントやトークンを検討します [U]。

<!-- exercise id="d03-gh-auth" check="manual" -->
Bot に `gh auth status` を実行させ、`Logged in to github.com` の行が返ってくれば完了。`npm run done -- d03-gh-auth` で完了にする。
<!-- /exercise -->

### 2. 作業場所を分けると決める

共有のコンピューターでは、複数の Bot が同じフォルダの同じブランチを触ると、片方の未 push のコミットともう片方の push が食い違います。この教材を作る途中で実際に起きました [R]。

決まりは3つです。

- 仕事ごとに別の clone（例: `~/work/<リポジトリ>-<仕事の名前>`）を作る
- 作業の前に `git fetch` で最新の main を取り、そこから新しいブランチを切る
- ほかの Bot のフォルダは読むだけにする

<!-- exercise id="d03-workdir" check="file-contains" path="notes/d03-grok-bot-repo.md" pattern="^作業場所: .{5,}" -->
**課題**: `notes/d03-grok-bot-repo.md` の `作業場所:` の後ろに、Bot に使わせる clone のフォルダとブランチ名の付け方を書く（例: `~/work/tasklog-<仕事> に clone し、grok/<仕事> のブランチで作業`）。
<!-- /exercise -->

### 3. AGENTS.md に Grok Bot 用の節を作る

C1 で作った AGENTS.md に、Grok Bot に任せるときだけの決まりを足します。共通の決まり（テストの実行方法など）は既存の節にあるので、ここには止まる場所と返すものだけを書きます。

```markdown
## Grok Bot
- 仕事ごとに別の clone と新しいブランチで作業する。main に直接 push しない
- PR を出す前に `npm test` を実行し、コマンドと結果を PR の説明に書く
- `npm run deploy` や `wrangler` は実行しない。デプロイは持ち主が行う
```

<!-- exercise id="d03-agents-grok" check="file-contains" path="sample-app/AGENTS.md" pattern="^## Grok Bot" -->
**課題**: `sample-app/AGENTS.md` に `## Grok Bot` の節を作り、ブランチ・テスト・デプロイの決まりを書く。
<!-- /exercise -->

### 4. Bot に PR を1本出させて、流れを通す

完了条件つきの依頼文の書き方は D4 で詳しく扱います。ここでは流れが通るかだけを試します。

```text
<owner>/<repo> を ~/work/tasklog-readme に clone し、grok/readme-typo のブランチで README.md の誤字を1つ直して。
`npm test` を実行して出力を見せ、`gh pr create --draft` で下書きの PR を出したら止まって。main への push とデプロイはしないで。PR の URL を返して。
```

`gh pr create` は `--draft` で下書きの PR に、`--base` で入れ先のブランチを指定できます [V]（gh_pr_create）。

## 補足: Cursor のクラウドエージェントを使える人向け

プランにクラウドエージェントが含まれていれば、Bot がコーディングをそちらに任せることもできます。そのときの環境は `.cursor/environment.json` の `install`（何度実行しても同じ結果になるコマンド）で準備し、シークレットは cursor.com のダッシュボードの Secrets タブに入れます [V]（cloud-agent/setup、2026-10-26 時点）。執筆者のプランでは起動できないため、この教材では試していません [U]。

## うまくいかないとき

| 症状 | 対処 |
|---|---|
| `gh auth status` がログインしていないと出る | Bot に `gh auth login` を始めさせ、ブラウザでのサインインは自分で行う |
| Bot の PR に関係のないコミットが混ざる | ほかの Bot と同じ clone を使っている。仕事ごとに clone を分け、最新の main からブランチを切り直させる |
| Bot が main に push してしまう | 依頼文と AGENTS.md の `## Grok Bot` に「main に直接 push しない」を書く。GitHub のブランチ保護も検討する [U] |

## 確認の記録

- 2026-10-29: Bot のコンピューターで `gh auth status` がログイン済みと返し、別の clone とブランチで作業してこの章の変更をコミットした [R]
