---
id: c02-local-cloud
title: ローカルとクラウドを使い分ける
track: env
order: 2
as_of: 2026-10-26
applies_to: Claude Code 2.1.310 / Opus 5.5
estimated_minutes: 30
sources:
  - url: https://code.claude.com/docs/en/cloud-environments
    checked: 2026-10-26
  - url: https://code.claude.com/docs/en/sandbox-environments
    checked: 2026-10-26
  - url: https://code.claude.com/docs/en/remote-control
    checked: 2026-10-26
  - url: https://claude.dev/blog/claude-code-in-the-cloud/
    checked: 2026-10-24
announcements:
  - author: claude.dev blog
    date: 2026-10-06
    url: https://claude.dev/blog/claude-code-in-the-cloud/
    summary: cloud sessions の現場ガイド。手元で計画し、クラウドで作り、teleport で手元に戻す
    verified: true
history:
  - version: 2.0.24
    date: 2025-10-20
    advice: Web と CLI の間でセッションを移す（teleport）
    status: current
  - version: 2026-10 時点
    advice: 依存のインストールは、クラウドだけなら setup script、手元とクラウドの両方なら SessionStart hook に書く
    status: current
  - version: 2026-10 時点
    advice: 手元のセッションを、スマホやブラウザから続ける（Remote Control）
    status: current
---

## この章でできるようになること

- 作業ごとに、手元・隔離した手元・クラウドのどこで動かすかを決められる
- クラウドのセッションに届く設定と届かない設定を区別し、必要なものをリポジトリに入れられる
- クラウドのときだけ依存を入れる準備を、手元の作業を邪魔せずに書ける

C1 でリポジトリの指示をまとめました。この章では、そのリポジトリを手元とクラウドのどちらで動かすかを決めます。A8 で触れたクラウドの基本を発展させた章です。

## 公式の要点

### どこで動かすか

| 手元 | クラウド |
|---|---|
| 手元の DB、VPN の内側のサービス、手元のハードウェアが要る作業 | 溜まった作業の消化、並列に多く走らせる作業、信頼しきれない作業 |

組み合わせて使うときは、**手元で計画し、クラウドで実装し、teleport で手元に戻す**流れが勧められています [V]（Claude Code in the cloud）。

### 隔離の選び方

手元で動かす場合も、確認を減らして任せるなら隔離を足します [V]（sandbox-environments）。

| 方法 | 隔離されるもの | 向いている場面 |
|---|---|---|
| sandboxed Bash（`/sandbox`） | Bash などのコマンドだけ | 普段の作業で確認を減らす |
| sandbox runtime（`srt claude`） | Claude Code の全体（ファイルの道具・MCP・hook も） | Docker なしで全体を隔離したい |
| dev container | 開発環境の全体 | チームで同じ隔離した環境をそろえる |
| VM | OS の全体 | 信頼できないリポジトリを扱う |
| cloud session | Anthropic が用意する VM | 手元に環境が無い、または信頼できないリポジトリ |

- auto mode は操作ごとに審査する仕組みで、隔離の境界ではありません。無人で走らせるなら、隔離を重ねると守りが厚くなります [V]
- `--dangerously-skip-permissions` は、コンテナ・VM・sandbox runtime の中でだけ使います [V]
- sandboxed Bash だけでは、ファイルの道具・MCP サーバー・hook は手元でそのまま動きます [V]

### クラウドに届くもの・届かないもの

cloud session はリポジトリを新しく clone して始まります。リポジトリに入れたものは届き、自分の PC にしか無いものは届きません [V]（cloud-environments）。hooks・権限・`.mcp.json` が届くのは、リポジトリ1つのセッションの場合です。Claude の Projects のスレッドでは、リポジトリの hooks は動かず、MCP は claude.ai のコネクタを使います [V]。

| 届く | 届かない |
|---|---|
| リポジトリの CLAUDE.md と `.claude/rules/` | `~/.claude/CLAUDE.md` |
| `.claude/settings.json` の hooks と権限 | `~/.claude/settings.json`（ユーザーの hooks を含む） |
| `.mcp.json` の MCP サーバー | local・user スコープで足した MCP サーバー |
| `.claude/skills/`・`.claude/agents/`・`.claude/commands/` | `~/.claude/skills/` など、ホームにあるもの |
| — | プラグイン（リポジトリで有効にしたものも、ユーザー設定のものも） |

A4・A9 で「リポジトリに入れる」と書いたものは、この表の左側に入るようにするためです。

### setup script と SessionStart hook

| | setup script | SessionStart hook |
|---|---|---|
| どこで設定するか | クラウド環境の画面（claude.ai/code） | `.claude/settings.json` |
| いつ動くか | Claude Code の起動前。キャッシュがあれば飛ばす | 起動後、毎回（再開を含む） |
| どこで動くか | クラウドだけ | 手元とクラウドの両方 |
| 向いているもの | 入っていない道具や言語を入れる | `npm install` のような、プロジェクトの準備 |

setup script は5分ほどで終わるように書くと、その結果がキャッシュされます。環境の環境変数と setup script は、その環境を使う全員が読めるので、秘密の値は入れません。Anthropic が用意する環境では、API キーを network secrets に入れると、プロキシが指定した宛先への通信にだけ付けてくれます [V]。

### Remote Control と teleport

| | 何をするか | どこで動くか |
|---|---|---|
| Remote Control | 手元のセッションを、スマホやブラウザから続ける | 手元の PC のまま [V] |
| teleport | セッションを手元とクラウドの間で移す | 移した先 |

Remote Control は `claude --remote-control`（`--rc`）で始めるか、セッション中に `/remote-control` を実行します。手元のファイル・MCP サーバー・設定をそのまま使えます [V]（remote-control）。

## ハンズオン

### 1. クラウドのときだけ依存を入れるスクリプト

公式 docs の例にならい、`CLAUDE_CODE_REMOTE` が `true` のとき（クラウドのとき）だけ動くスクリプトを作ります [V]。手元では何もせずに終わるので、毎回のセッションの邪魔になりません。

`sample-app/scripts/install_pkgs.sh` に次の内容を書きます。

```bash
#!/bin/bash
# SessionStart hook から呼ぶ。クラウドのセッションのときだけ依存を入れる
if [ "$CLAUDE_CODE_REMOTE" != "true" ]; then
  exit 0
fi
cd "$CLAUDE_PROJECT_DIR" || exit 1
npm install
```

```bash
chmod +x scripts/install_pkgs.sh
```

<!-- exercise id="c02-install-script" check="command" cwd="sample-app" run="test -x scripts/install_pkgs.sh && grep -q CLAUDE_CODE_REMOTE scripts/install_pkgs.sh" -->
`sample-app/scripts/install_pkgs.sh` を作り、実行できるようにする。`CLAUDE_CODE_REMOTE` を見て、クラウドのときだけ動くこと。
<!-- /exercise -->

<!-- exercise id="c02-local-skip" check="command" cwd="sample-app" run="test -x scripts/install_pkgs.sh && env -u CLAUDE_CODE_REMOTE ./scripts/install_pkgs.sh > /dev/null 2>&1" -->
手元（`CLAUDE_CODE_REMOTE` が無い状態）でスクリプトを実行すると、何もせずに終了コード 0 で終わることを確かめる。
<!-- /exercise -->

公式 docs の例は、`package.json` と `package-lock.json` が変わっていなければ `npm install` を飛ばす工夫も入れています。依存が多いリポジトリでは、そちらを使います。

### 2. どこで動かすかを決める

<!-- exercise id="c02-where-cloud" check="file-contains" path="notes/c02-local-cloud.md" pattern="^クラウドに渡す作業: .{5,}" -->
`notes/c02-local-cloud.md` の `クラウドに渡す作業:` の後ろに、自分の開発でクラウドに渡したい作業を1つ書き、理由を添える。
<!-- /exercise -->

<!-- exercise id="c02-where-local" check="file-contains" path="notes/c02-local-cloud.md" pattern="^手元に残す作業: .{5,}" -->
同じファイルの `手元に残す作業:` の後ろに、手元に残す作業を1つ書き、理由を添える（上の「どこで動かすか」の表を参考に）。
<!-- /exercise -->

### 3. hook に登録し、Remote Control を試す

`sample-app/.claude/settings.json` の `hooks` に、次の SessionStart hook を足します（A3・A6・A8・A9 の設定は残す）。

```json
"SessionStart": [
  { "matcher": "startup|resume", "hooks": [ { "type": "command", "command": "bash \"$CLAUDE_PROJECT_DIR\"/scripts/install_pkgs.sh" } ] }
]
```

A8 で足した SessionStart hook がすでにあるなら、同じ配列に並べます。A8 の例でクラウドのときに `npm ci` を実行しているなら、install_pkgs.sh と重なるので、どちらか一方にします。

<!-- exercise id="c02-hook" check="manual" -->
SessionStart hook に install_pkgs.sh を登録し、手元で起動しても何も入らないことを確かめる。あわせて `claude --remote-control` で起動し、スマホかブラウザ（claude.ai/code）からそのセッションに1つ指示を送る。Remote Control は Pro・Max・Team・Enterprise のプランで claude.ai にログインしているときだけ使え、API キーでは使えない（Team・Enterprise は管理者が有効にする必要がある）[V]。使えない場合は Remote Control の部分は飛ばしてよい。終えたら `npm run done -- c02-hook` で完了にする。
<!-- /exercise -->

## うまくいかないとき

| 症状 | 対処 |
|---|---|
| クラウドで hook が動かない | `~/.claude/settings.json` の hook はクラウドに届かない。リポジトリの `.claude/settings.json` に書く [V] |
| クラウドで MCP サーバーが無い | local・user スコープで足している。`claude mcp add --scope project` で `.mcp.json` に入れる [V] |
| クラウドでプラグインが使えない | cloud session はプラグインを入れない。必要な skill はリポジトリの `.claude/skills/` に入れる [V] |
| setup script の結果がキャッシュされない | 5分ほどを超えるとキャッシュされない。独立した処理を並べて短くする [V] |

## 振り返り

- C1 と C2 で、同じリポジトリを、手元・隔離した手元・クラウド・ほかのエージェントのどこで動かしても、同じ前提で動く状態になりました
- 次のトラック D では、この環境の上で Grok Bot を使います
