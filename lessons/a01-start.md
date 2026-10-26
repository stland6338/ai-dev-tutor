---
id: a01-start
title: インストールと最初の依頼
track: claude-code
order: 1
as_of: 2026-10-26
revised: 2026-10-26（インストール手順を追加）
applies_to: Claude Code 2.1.310 / Opus 5.5
official_ref: Claude Code 101 · Module 1–2（What is Claude Code / Installing）
estimated_minutes: 20
sources:
  - url: https://anthropic.skilljar.com/claude-code-101
    checked: 2026-10-24
  - url: https://code.claude.com/docs/en/quickstart
    checked: 2026-10-24
  - url: https://code.claude.com/docs/en/setup
    checked: 2026-10-26
  - url: https://code.claude.com/docs/en/how-claude-code-works
    checked: 2026-10-24
  - url: https://code.claude.com/docs/en/model-config
    checked: 2026-10-24
announcements:
  - author: Claude blog
    date: 2026-09-25
    url: https://claude.dev/blog/spending-your-effort/
    summary: 「Using Claude Code: Spending your effort」。effort の使い分けの公式ガイド
    verified: true
  - author: Claude blog
    date: 2026-09-24
    url: https://claude.com/resources/articles/claude-opus-5-5-built-for-coding-sessions-that-use-more-context
    summary: Opus 5.5 は長く context を多く使うコーディングセッション向けに作られた、という発表
    verified: true
  - author: "@ClaudeDevs"
    date: 2026-10-07
    url: https://x.com/ClaudeDevs/status/2107895955144208813
    summary: Haiku 5.5 を Claude Platform と Claude Code で提供。Haiku 4.5 より平均約 75% 安く、Opus 5.5 / Sonnet 5.5 の subagent に向く
    verified: true
history:
  - version: 0.2.44
    date: 2025-03-15
    advice: プロンプトに think / think harder / ultrathink と書いて思考量を指定する
    status: superseded
    note: 今は ultrathink（次のターンだけ high effort）以外の言葉は普通の文として扱われる。effort が主な調整手段
  - version: 1.0.0
    date: 2025-05-22
    advice: 一般提供開始（Opus 4 / Sonnet 4）
    status: current
  - version: 2.1.90
    date: 2026-04-01
    advice: CLI 内の公式インタラクティブ講座 /powerup で基本操作を学ぶ
    status: current
  - version: 2.1.283
    advice: 起動時の権限モードの既定が auto mode になった
    status: current
    note: 詳しくは A6
---

## この章でできるようになること

- 手元の Claude Code のバージョンと、使っているモデルを確かめられる
- 公式のインタラクティブ講座 `/powerup` を始められる
- 知らないコードベースについて、まず Claude に質問して全体像をつかめる

公式講座「Claude Code 101」の Module 1–2 に当たります。講座は動画とクイズが中心なので、この章では同じ内容を手元で実際に行います。

## 公式の要点

- Claude Code はターミナルで動くエージェントで、ファイルを読み、コマンドを実行し、コードを書き換えます。考える → 道具を使う → 結果を見る、を繰り返す仕組みです [V]（how-claude-code-works）
- 2026-10 時点の推奨モデルの起点は Opus 5.5（`claude-opus-5-5`、既定の effort は medium）です [V]
- 思考の深さは effort（low / medium / high / xhigh / max）で調整します。`/model` から変えられます。プロンプトに「think hard」と書く方法は古い推奨です（章末の年表を参照）[V]
- 知らないリポジトリでは、いきなり変更を頼まず、まず質問して読ませるのが公式の最初の一歩です [V]（quickstart・best-practices）

## インストールとログイン

公式の setup ページ（Advanced setup）に書かれている手順です [V]。迷ったら [quickstart](https://code.claude.com/docs/en/quickstart) と [setup](https://code.claude.com/docs/en/setup) を開いてください。

### 動く環境

- OS: macOS 13.0 以上、Windows 10 1809 以上（または Windows Server 2019 以上）、Ubuntu 20.04 以上、Debian 10 以上、Alpine Linux 3.19 以上
- メモリ 4GB 以上、x64 か ARM64、インターネット接続
- 公式のインストーラーを使う場合、Node.js は不要です（npm でのインストールは Node.js 22 以上が必要）。この教材の `npm start` や `npm run check` には Node.js 20 以上と git を使います

### インストールする

ターミナルで、使っている OS のコマンドを実行します。公式の推奨は native install で、バックグラウンドで自動更新されます。

```bash
# macOS / Linux / WSL
curl -fsSL https://claude.ai/install.sh | bash
```

```powershell
# Windows PowerShell（プロンプトが PS C:\ で始まる）
irm https://claude.ai/install.ps1 | iex
```

```batch
REM Windows CMD（プロンプトに PS が付かない）
curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
```

ほかに Homebrew（`brew install --cask claude-code`）や WinGet（`winget install Anthropic.ClaudeCode`）でも入れられます。この2つは自動更新されないので、自分で upgrade します。

終わったら**新しいターミナルを開いて** `claude --version` を実行し、バージョン番号が出れば成功です。`claude` が見つからないと言われたら、公式の Troubleshoot installation を見てください。`claude doctor` で設定まで含めて診断できます。

### Windows の場合

Windows では、そのまま（ネイティブ）でも WSL の中でも動きます。

| 方法 | 必要なもの | サンドボックス |
|---|---|---|
| ネイティブ Windows | なし（Git for Windows は任意） | 使えない |
| WSL 2 | WSL 2 | 使える |
| WSL 1 | WSL 1 | 使えない |

- ネイティブでは PowerShell か CMD からインストールします。管理者権限は要りません。Git for Windows を入れると、Claude Code が Bash ツールに Git Bash を使います。入れない場合は PowerShell でコマンドを実行します
- WSL では、WSL のターミナルの中で Linux 用のコマンドでインストールし、そこで `claude` を起動します
- この教材の課題はシェルスクリプトや bash 前提の hook を使うので、Windows では WSL 2 をおすすめします

### ログインする

Claude Code を使うには、Pro・Max・Team・Enterprise のいずれかのプラン、または Console（API）のアカウントが必要です。無料の claude.ai プランでは使えません [V]。

`claude` を起動すると、ブラウザでのログインに案内されます。そのまま進めればログインできます。環境変数 `ANTHROPIC_API_KEY` を設定していて、起動時にそのキーを使うことを承認した場合は、ログインを飛ばします。アカウントの種類ごとの詳しい手順は、公式の Authentication のページを見てください。

## ハンズオン

workspace の `sample-app/`（tasklog という小さな CLI）を使います。

```bash
cd ~/ai-dev-tutor-workspace/sample-app
claude --version
claude
```

<!-- exercise id="a01-version" check="file-contains" path="notes/a01-start.md" pattern="^claude --version: \d+\.\d+\.\d+" -->
`claude --version` の結果を `notes/a01-start.md` の `claude --version:` の後ろに書く。教材のバージョン（帯に表示）と違ったら、`claude update` で更新するかどうか考える。
<!-- /exercise -->

<!-- exercise id="a01-model" check="file-contains" path="notes/a01-start.md" pattern="^/model のモデル: \S+" -->
Claude Code の中で `/model` を開き、今のモデルと effort を確かめて、`/model のモデル:` の後ろに書く。
<!-- /exercise -->

次に、何も変更させずに質問だけします。

```text
このリポジトリは何をするもの？ 構成と、テストの実行方法を教えて。まだ何も変更しないで。
```

<!-- exercise id="a01-purpose" check="file-contains" path="notes/a01-start.md" pattern="^tasklog の目的.*: .{8,}" -->
Claude の答えから、tasklog の目的を1文にまとめて書く。Claude の答えに、README や src/ を読んだ形跡（どのファイルを開いたか）が出ていたかも見ておく。
<!-- /exercise -->

最後に公式講座を始めます。

<!-- exercise id="a01-powerup" check="manual" -->
Claude Code で `/powerup` を実行し、レッスンを1つ以上終える。終えたら `npm run done -- a01-powerup` で完了にする。
<!-- /exercise -->

## 2026-10 の更新: effort の目安

claude.dev の「Spending your effort」（2026-09-25、Thariq Shihipar）は、effort を「検証と境界条件のテストにどれだけ手間をかけ、どれだけ Claude 自身の判断で動くかを調整するもの」と説明しています [V]。記事にある目安は次のとおりです。

| effort | 向いている作業（記事の例） |
|---|---|
| low | すぐ返事がほしい対話的な作業。ブレインストーミング、たたき台、簡単な変更 |
| medium | 普段のソフトウェア開発の大半。新機能の実装 |
| high | 検証や境界条件が大事な作業。既存コードベースのバグ修正 |
| max | 難しい問題を完全に任せたいとき。アプリを作って検証するまで、重要なソフトウェアの脆弱性探し |

- effort は会話の途中でも `/effort` で変えられます [V]
- 高い effort が効くのは境界条件の多い作業で、アプローチそのものが間違っている失敗は effort を上げても直らない、と記事は述べています [V]
- 2026-10-07 に Haiku 5.5 が Claude Code で使えるようになりました。公式の告知は、要約・compaction・DB 問い合わせのような量が多くコストに敏感な作業で、Opus 5.5 や Sonnet 5.5 の subagent として使うことを勧めています [V]

<!-- exercise id="a01-effort" check="file-contains" path="notes/a01-start.md" pattern="^effort の使い分け: .{8,}" -->
`notes/a01-start.md` に `effort の使い分け:` の行を作り、自分の普段の作業を1つ挙げて、上の表のどの effort で始めるかを書く。
<!-- /exercise -->

## 振り返り

- 質問だけで、Claude はどのファイルを読みましたか。読む前に答えていたら、それは推測です。以降の章では「読ませてから答えさせる」を前提にします
- 次の A2 ではこの sample-app の失敗しているテストを、公式の4段階（Explore → Plan → Implement → Commit）で直します
