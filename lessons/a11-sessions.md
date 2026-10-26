---
id: a11-sessions
title: セッションを続ける・分ける
track: claude-code
order: 11
as_of: 2026-10-26
applies_to: Claude Code 2.1.310 / Opus 5.5
estimated_minutes: 20
sources:
  - url: https://code.claude.com/docs/en/sessions
    checked: 2026-10-26
  - url: https://code.claude.com/docs/en/checkpointing
    checked: 2026-10-26
history:
  - version: 2.0.0
    date: 2025-09-29
    advice: /rewind（Esc Esc）で会話とファイルを巻き戻す
    status: current
  - version: 2026-10 時点
    advice: セッションに名前を付け、名前で再開する。別のやり方を試すときは /branch で分ける
    status: current
---

## この章でできるようになること

- 前のセッションを、名前や一覧から再開できる
- 今の会話を残したまま、別のやり方を試す分岐を作れる
- 会話をファイルに書き出し、保存場所と保存期間を知っている

A2 では、context を軽くする `/clear` と `/compact` を扱いました。この章では、会話そのものを残して、あとから戻る方法を扱います。

## 公式の要点

### 再開する

セッションは作業中ずっと手元のファイルに保存されるので、終了したあとや `/clear` のあとでも戻れます [V]（sessions）。

| コマンド | 何をするか |
|---|---|
| `claude --continue` | 今のフォルダの、いちばん新しいセッションを開く |
| `claude --resume` | セッションの一覧を開く |
| `claude --resume <名前>` | 名前を付けたセッションを直接開く |
| `claude --from-pr <番号>` | その PR に結び付いたセッションに絞った一覧を開く |
| `/resume` | セッションの中から、別のセッションに切り替える |

一覧では `Ctrl+A` で全プロジェクトに、`Ctrl+W` で同じリポジトリの全 worktree に広げられます [V]。

### 名前を付ける

並行して作業するほど、名前が効きます [V]。

- 起動するとき: `claude -n auth-refactor`
- セッションの中で: `/rename auth-refactor`
- 名前を付けなくても、最初の依頼から要約したタイトルが付き、そのタイトルでも再開できる

### 分岐する

`/branch` は、ここまでの会話を写して新しいセッションに切り替えます。元のセッションはそのまま残ります [V]。

```text
/branch try-streaming-approach
```

コマンドラインからは `claude --continue --fork-session` です。

| 操作 | 向いている場面 |
|---|---|
| `/clear` | 関係のない次の作業に移る。前の会話は `/resume` で戻れる |
| `/compact` | 同じ作業を続けるが、履歴を軽くしたい（A2） |
| `/branch` | 今のやり方を残したまま、別のやり方を試したい |
| `Esc Esc` / `/rewind` | 失敗した試みを無かったことにしたい（会話とファイルを巻き戻す） |

同じセッションを分岐させずに2つのターミナルで再開すると、両方のメッセージが1つの会話に混ざります [V]。

### 書き出しと保存場所

- `/export` は、会話を読める形のテキストでクリップボードかファイルに書き出す。ファイル名を付けるとそこに直接書く [V]
- 会話は `~/.claude/projects/<プロジェクト>/<セッション ID>.jsonl` に保存される。既定の保存期間は30日で、`cleanupPeriodDays` で変えられる [V]
- この JSONL の形式は内部のもので、バージョンで変わります。スクリプトで使うなら `/export` か `claude -p --resume <ID> --output-format json` を使う [V]

## ハンズオン

```bash
cd ~/ai-dev-tutor-workspace/sample-app
claude -n tutor-a11
```

### 1. 名前で再開する

何か1つ質問してから `/exit` で終了し、名前で再開します。

```bash
claude --resume tutor-a11
```

<!-- exercise id="a11-resume" check="file-contains" path="notes/a11-sessions.md" pattern="^名前で再開したコマンド: claude --resume \S+" -->
`notes/a11-sessions.md` の `名前で再開したコマンド:` の後ろに、実際に使った再開のコマンドを書く。前の質問の続きから始まったことを確かめる。
<!-- /exercise -->

### 2. 分岐して試す

```text
/branch try-csv-output
```

分岐した側で「overdue の結果を CSV で出す案を考えて」と頼み、元のセッションには `/resume tutor-a11` で戻ります。

<!-- exercise id="a11-branch" check="manual" -->
`/branch` で分岐し、分岐した側の会話が元のセッションに混ざっていないことを確かめる。終えたら `npm run done -- a11-branch` で完了にする。
<!-- /exercise -->

<!-- exercise id="a11-clear-branch" check="file-contains" path="notes/a11-sessions.md" pattern="^/clear と /branch の使い分け: .{10,}" -->
同じファイルの `/clear と /branch の使い分け:` の後ろに、どちらをどんなときに使うかを1文で書く。
<!-- /exercise -->

### 3. 書き出す

セッションの中で次を実行します（作業フォルダは sample-app なので、notes は1つ上です）。

```text
/export ../notes/a11-export.txt
```

<!-- exercise id="a11-export" check="command" run="test -s notes/a11-export.txt" -->
`/export` で会話を `notes/a11-export.txt` に書き出す。ファイルが空でないこと。
<!-- /exercise -->

## 振り返り

- 名前を付けて分けておくと、A7 の並列作業や C2 のクラウドとの行き来でも、どの会話がどの作業かを見失いません
- 次の A12 では、設定が効かないときに、何が読み込まれているかを調べる方法を扱います
