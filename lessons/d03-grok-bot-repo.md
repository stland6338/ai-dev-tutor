---
id: d03-grok-bot-repo
title: リポジトリを Grok Bot 向けに整える
track: grok
order: 3
as_of: 2026-10-26
applies_to: "Grok Bot beta（2026-10 時点）"
estimated_minutes: 20
sources:
  - url: https://docs.x.ai/grok-bot/overview
    checked: 2026-10-26
  - url: https://docs.x.ai/grok-bot/teams-and-enterprises
    checked: 2026-10-26
  - url: https://docs.x.ai/grok-bot/files-and-results
    checked: 2026-10-26
  - url: https://docs.x.ai/grok-bot/private-networks
    checked: 2026-10-26
  - url: https://docs.x.ai/grok-bot/team-bots
    checked: 2026-10-26
  - url: https://cursor.com/docs/cloud-agent
    checked: 2026-10-26
  - url: https://cursor.com/docs/cloud-agent/setup
    checked: 2026-10-26
  - url: https://cursor.com/docs/rules
    checked: 2026-10-26
  - url: https://cursor.com/docs/integrations/github
    checked: 2026-10-26
announcements:
  - author: "@bot"
    date: 2026-09-30
    url: https://x.com/bot/status/2105373767568621895
    summary: Grok Bot の新機能の告知（Cursor フォーラムの公式回答から知った。日付は推定）
    verified: false
history:
  - version: beta
    date: 2026-08-11
    advice: Grok Bot がベータで公開。コーディングは Bot が Cursor Cloud Agent に任せられる
    status: current
    note: 公開日は x.ai/news（grok-bot-more-plans）の記述。Cloud Agent への委任がいつ始まったかは公式資料に記載なし
  - version: 2026-10
    date: 2026-10-26
    advice: Cloud Agent 向けの指示は AGENTS.md の専用の節に、環境は .cursor/environment.json の install に書く
    status: current
---

## この章でできるようになること

Grok Bot がコーディングを Cursor Cloud Agent に任せたときに、Cloud Agent が迷わず動けるようにリポジトリを整えます。読まれる指示ファイル、環境の準備、シークレットの置き場所を、公式資料で確かめた範囲で押さえます。

## Claude Code との違い

| 観点 | Claude Code | Grok Bot |
|---|---|---|
| コードを書く場所 | 手元の端末（またはクラウドのセッション） | Bot は自分のクラウドのコンピュータで作業し、コーディングは別のコンピュータで動く Cursor Cloud Agent に任せられる [V] |
| 読む指示ファイル | CLAUDE.md | Cloud Agent は AGENTS.md を読む [V]。CLAUDE.md を読むかは公式資料に記載なし（2026-10-26 時点） |
| 環境の準備 | 手元の環境そのもの | `.cursor/environment.json` の `install`、または dashboard でのエージェント任せの準備 [V] |
| シークレット | 手元の環境変数 | cursor.com/dashboard/cloud-agents の Secrets タブ（環境変数として渡る）[V] |
| リポジトリの接続 | 不要（手元の clone） | Cursor アカウントに GitHub などのソース管理を接続する [V] |

## 手順

### 1. 仕組みをつかむ

- Grok Bot はコーディングの仕事を、別のコンピュータで動く Cursor Cloud Agent に任せられます。チームでは管理者がこの委任を止められ、既定では有効です [V]（teams-and-enterprises）
- Cloud Agent はリポジトリを clone し、別のブランチで作業して push します [V]（cloud-agent）
- Bot 自身のコンピュータ（全 Bot で共有）と、Cloud Agent のコンピュータは別です [V]。Bot のコンピュータに入れたログインやファイルが Cloud Agent から見えるかは公式資料に記載なし（2026-10-26 時点）
- Cloud Agent は Cursor の機能です。使えるかどうかはプランやチームの設定によります。自分のプランで Grok Bot から Cloud Agent を起動できるかは、この教材では確かめていません [U]

### 2. GitHub を接続する

Cloud Agent をリポジトリから起動するには、Cursor アカウントの管理者がソース管理（GitHub・GitLab・Bitbucket・Azure DevOps）を接続しておく必要があります [V]（cloud-agent）。Cursor の GitHub App が求める権限は、リポジトリ（clone とブランチ作成）・Pull requests・Issues・Checks・Actions などで、一覧は Cursor の GitHub 連携のページにあります [V]（integrations/github）。Grok Bot の docs には、GitHub 連携の手順や権限について独自の記載はありません（2026-10-26 時点）。

<!-- exercise id="d03-github" check="manual" -->
cursor.com のダッシュボードで GitHub を接続し、演習に使うリポジトリが選べる状態にする。Integrations の GitHub の行が接続済みになっていれば完了。`npm run done -- d03-github` で完了にする。
<!-- /exercise -->

### 3. AGENTS.md に Cloud 用の節を作る

Cloud Agent は AGENTS.md を読みます。Cursor は、Cloud だけで要る準備とテストの手順を、`Cursor Cloud specific instructions` のような見出しの専用の節に書くよう勧めています [V]（cloud-agent/setup）。AGENTS.md はプロジェクトの直下とサブフォルダに置け、入れ子のものは親と合わさり、より深いものが優先されます [V]（rules）。

Claude Code の利用者向けのメモ: Cursor の docs は CLAUDE.md を Cloud Agent が読むとは書いていません（2026-10-26 時点）。両方を使うなら、共通の決まりは AGENTS.md に置き、CLAUDE.md からそれを参照する形が安全です [U]。

<!-- exercise id="d03-cloud-section" check="file-contains" path="sample-app/AGENTS.md" pattern="^## Cursor Cloud specific instructions" -->
**課題**: `sample-app/AGENTS.md` に `## Cursor Cloud specific instructions` の節を作り、Cloud でのテストの実行方法（`npm test`）を書く。AGENTS.md がまだ無ければ作る。
<!-- /exercise -->

### 4. 環境を `.cursor/environment.json` に書く

Cloud Agent の環境は、dashboard からエージェントに準備させるか、Dockerfile やスナップショットを `.cursor/environment.json` で指定します [V]。`install` に書いたスクリプトは Build を作るときに実行され、何度実行しても同じ結果になる（冪等な）必要があります [V]。開発サーバーやデータベースのように動き続けるものは `install` に入れず、起動用のコマンドに回します [V]。Build はデフォルトブランチの設定を使います [V]（いずれも cloud-agent/setup）。

`tasklog` は依存パッケージが無いので、`install` は `npm install` だけで足ります。

<!-- exercise id="d03-env-json" check="json-has" path="sample-app/.cursor/environment.json" key="install" -->
**課題**: `sample-app/.cursor/environment.json` を作り、`install` に冪等なコマンド（例: `npm install`）を書く。
<!-- /exercise -->

### 5. シークレットの置き場所を決める

- Cloud Agent のシークレットは、cursor.com/dashboard/cloud-agents の Secrets タブに入れるのが推奨で、環境変数として渡ります [V]
- シークレットは起動時に注入されるので、追加した後は新しい Cloud Agent を起動します [V]（cloud-agent）
- 特定の環境だけに渡す「環境ごとのシークレット」もあります [V]
- `.env.local` をスナップショットに含めることもできますが、Secrets タブのほうが推奨です [V]
- Team Bot の Secrets（最大25件、値は8文字以上、Bot も値は見られない）は Team Bot の機能で、Cloud Agent のシークレットとは別の場所です [V]（team-bots）
- Team Setup Scripts（Bot のコンピュータにスクリプトで道具を入れる仕組み）は Enterprise 専用です [V]（private-networks）。スクリプトの書式は公式資料に記載なし（2026-10-26 時点）

値はリポジトリにもチャットにも書きません。ワークシートにも名前だけを書きます。

<!-- exercise id="d03-secret-name" check="file-contains" path="notes/d03-grok-bot-repo.md" pattern="^シークレット名: [A-Z][A-Z0-9_]{2,}" -->
**課題**: `notes/d03-grok-bot-repo.md` の `シークレット名:` の後ろに、Cloud Agent に渡したいシークレットの名前だけを大文字で書く（例: `TASKLOG_API_TOKEN`）。値は書かない。
<!-- /exercise -->

## うまくいかないとき

| 症状 | 対処 |
|---|---|
| シークレットが Cloud Agent に見えない | Secrets タブに入れたか、正しいアカウントか確かめ、新しい Cloud Agent を起動する [V]（cloud-agent） |
| ブランチで変えた environment.json が使われない | Build はデフォルトブランチの設定を使う。ブランチに push してから、そのブランチで起動する [V]（cloud-agent/setup） |
| 別の Cursor チームが GitHub のインストールを持っている | 1つのインストールは1つの Cursor アカウントかチームに属する。所有側から共有してもらう [V]（integrations/github） |
| Team Setup Scripts が見当たらない | Enterprise 専用 [V] |

## 確認の記録

なし（この章の Cloud Agent の起動・PR 作成は実行していない。執筆者のプランでは Cursor Cloud Agent を起動できないため）
