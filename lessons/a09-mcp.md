---
id: a09-mcp
title: MCP で外部のツールにつなぐ
track: claude-code
order: 9
as_of: 2026-10-26
applies_to: Claude Code 2.1.310 / Opus 5.5
official_ref: Claude Code 101 · Module 4（Customizing: MCP）
estimated_minutes: 30
sources:
  - url: https://code.claude.com/docs/en/mcp-quickstart
    checked: 2026-10-26
  - url: https://code.claude.com/docs/en/mcp
    checked: 2026-10-26
  - url: https://code.claude.com/docs/en/permissions
    checked: 2026-10-26
  - url: https://www.anthropic.com/news/model-context-protocol
    checked: 2026-10-26
history:
  - version: MCP 公開
    date: 2024-11-25
    advice: Anthropic が Model Context Protocol をオープンソースで公開した。AI と外部のデータやツールを、個別の連携ではなく1つの規格でつなぐ
    status: current
  - version: 2026-10 時点
    advice: tool search が既定。接続したサーバーのツールは、Claude が検索してから呼び出す
    status: current
    note: tool search を切る設定（ENABLE_TOOL_SEARCH=false）もある
---

## この章でできるようになること

- `claude mcp add` で MCP サーバーをつなぎ、つながったことを確かめられる
- local・project・user の3つのスコープを使い分け、チームで `.mcp.json` を共有できる
- MCP のツールに権限ルールを書き、信頼できるサーバーだけを入れる判断ができる

公式講座「Claude Code 101」の Module 4（Customizing）で、CLAUDE.md・subagents・skills・hooks と並んで扱われる仕組みです。

## 公式の要点

### MCP とは

Model Context Protocol（MCP）は、Claude Code が組み込みの道具の外にあるツールを使うための規格です。課題管理の検索、データベースへの問い合わせ、ブラウザの操作などのツールが、MCP サーバーから提供されます。サーバーは手元のプログラムとして動くものと、URL で公開されているものがあります [V]（mcp-quickstart）。

### スコープ

`claude mcp add` は既定で local スコープに登録します [V]。

| スコープ | 書き込まれる場所 | 使える人 |
|---|---|---|
| `local`（既定） | `~/.claude.json` の、このプロジェクトの項目 | 自分だけ・このプロジェクトだけ |
| `project` | プロジェクト直下の `.mcp.json` | リポジトリを clone した全員 |
| `user` | `~/.claude.json` の `mcpServers` | 自分だけ・全プロジェクト |

- `.mcp.json` はリポジトリに入れて共有します。clone した人が Claude Code を起動すると、サーバーを承認するかを聞かれます。clone しただけのリポジトリが、手元でプロセスを勝手に起動できないようにするためです [V]
- 一度断った承認をやり直すときは `claude mcp reset-project-choices` を使います [V]
- cloud session は、リポジトリの `.mcp.json` を読みます [V]。Grok Build も `.mcp.json` を読むので、1つのファイルで複数のエージェントに同じサーバーを渡せます（調査メモ C2）

### 管理のコマンド

| したいこと | コマンド |
|---|---|
| つなぐ（URL のサーバー） | `claude mcp add --transport http <名前> <URL>` |
| つなぐ（手元のプログラム） | `claude mcp add <名前> -- <起動コマンド>` |
| 一覧と状態を見る | `claude mcp list` |
| 1つの詳細とスコープを見る | `claude mcp get <名前>` |
| 外す | `claude mcp remove <名前>` |
| セッションの中で状態を見る・認証する | `/mcp` |

ログインが要るサーバー（Sentry・Linear・Notion など）は、追加すると `! Needs authentication` になります。セッションで `/mcp` を開き、サーバーを選んで Authenticate を選ぶと、ブラウザでサインインできます [V]。

### 権限ルール

MCP のツールにも、A6 と同じ allow / deny のルールを書けます [V]（permissions）。

- サーバーのツール全部: `mcp__<server>__*`
- ツール1つ: `mcp__<server>__<tool>`
- サーバー名の `.` や空白は `_` になります（`my.server` なら `mcp__my_server__*`）

### context と出力の量

- つないだサーバーのツール名と説明は、毎回のセッションの context に載ります。使わなくなったサーバーは外します [V]（mcp-quickstart）
- tool search が既定で、Claude はサーバーのツールを検索してから呼び出します [V]（mcp）
- ツールの出力が1万トークンを超えると警告が出て、既定では2万5千トークンで打ち切られます。上限は `MAX_MCP_OUTPUT_TOKENS` で変えられます [V]

### セキュリティ

公式 docs は、サーバーをつなぐ前に信頼できるかを確かめるよう求めています。外部の内容を取ってくるサーバーは、プロンプトインジェクションの危険があります [V]（mcp）。Web ページや issue の本文に「〜を実行せよ」と書かれていると、Claude がそれを指示と取り違えるおそれがあるということです。

| 確かめること | 理由 |
|---|---|
| 誰が作り、どこで公開しているか | 手元のプログラムとして動くサーバーは、自分の権限で何でも実行できる |
| 外部の内容（Web・メール・issue）を読むか | 読んだ内容がプロンプトインジェクションの入り口になる |
| 書き込みや送信のツールがあるか | allow で自動承認するのは読むだけのツールに絞る |

## ハンズオン

最初のサーバーには、認証の要らない公式 docs の MCP サーバーを使います [V]（mcp-quickstart）。

### 1. project スコープで追加する

```bash
cd ~/ai-dev-tutor-workspace/sample-app
claude mcp add --scope project --transport http claude-code-docs https://code.claude.com/docs/mcp
cat .mcp.json
```

<!-- exercise id="a09-add" check="json-has" path="sample-app/.mcp.json" key="mcpServers.claude-code-docs.url" -->
`sample-app/.mcp.json` に `claude-code-docs` のサーバーを登録する。`claude mcp add` を使っても、下の形で手で書いても構わない。
<!-- /exercise -->

```json
{
  "mcpServers": {
    "claude-code-docs": { "type": "http", "url": "https://code.claude.com/docs/mcp" }
  }
}
```

### 2. つながったことを確かめる

```bash
claude mcp list
```

`claude` を起動すると、project スコープのサーバーを承認するかを聞かれます。承認したら、`/mcp` で状態を見ます。

<!-- exercise id="a09-list" check="file-contains" path="notes/a09-mcp.md" pattern="^claude mcp list の結果: .*Connected" -->
`claude mcp list` の `claude-code-docs` の行を、`notes/a09-mcp.md` の `claude mcp list の結果:` の後ろに写す。`✔ Connected` になっていること。`⏸ Pending approval` なら、`claude` を起動して承認する。
<!-- /exercise -->

### 3. 使ってみて、読むだけのツールを自動承認する

```text
claude-code-docs のサーバーで、MCP_TIMEOUT が何をするか調べて
```

出力のツール呼び出しにサーバー名が付いていれば、MCP から答えています。docs サーバーは読むだけなので、確認なしで使えるようにします。

<!-- exercise id="a09-allow" check="file-contains" path="sample-app/.claude/settings.json" pattern="mcp__claude-code-docs__" -->
`sample-app/.claude/settings.json` の `permissions.allow` に `mcp__claude-code-docs__*` を足す。A3・A6・A8 の設定は残す。
<!-- /exercise -->

### 4. スコープと信頼を自分の言葉で整理する

<!-- exercise id="a09-scope" check="file-contains" path="notes/a09-mcp.md" pattern="^local と project の違い: .{10,}" -->
`notes/a09-mcp.md` の `local と project の違い:` の後ろに、どちらをどんなときに使うかを1文で書く。
<!-- /exercise -->

<!-- exercise id="a09-trust" check="file-contains" path="notes/a09-mcp.md" pattern="^入れる前に確かめること: .{10,}" -->
同じファイルの `入れる前に確かめること:` の後ろに、自分が使いたい MCP サーバーを1つ挙げ、入れる前に確かめることを書く（上のセキュリティの表を参考に）。
<!-- /exercise -->

## うまくいかないとき

| 症状 | 対処 |
|---|---|
| `/mcp` に何も出ない | 別のプロジェクトで local スコープに追加している。今のプロジェクトで追加し直すか、`--scope user` にする [V] |
| `.mcp.json` を直しても変わらない | `.mcp.json` は起動時に読まれる。セッションを起動し直す [V] |
| `Failed to connect` | `claude mcp get <名前>` でエラーの詳細を見る。手元のプログラムなら、その起動コマンドを直接実行してみる [V] |
| 起動時にタイムアウトする | 既定は30秒。`MCP_TIMEOUT=60000 claude` のように延ばす [V] |

## 振り返り

- MCP は道具を増やす仕組みで、増やした分だけ context と危険も増えます。A5 の「subagent は必要なときだけ」と同じく、サーバーも必要なものだけをつなぎます
- `.mcp.json` は C 環境（複数のエージェントで1つのリポジトリを使う）でも使います

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
| A9 | MCP サーバーは必要なものだけ、信頼できるものだけをつなぐ |

次のトラック B ではここまでの公式の流儀と pstack を比べます。
