---
id: a07-parallel
title: 並列に動かす（worktree・Writer/Reviewer・headless）
track: claude-code
order: 7
as_of: 2026-10-25
revised: 2026-10-25（公式 docs との照合で修正）
applies_to: Claude Code 2.1.310 / Opus 5.5
official_ref: best-practices「Run parallel sessions」/ Claude Code in Action · Automate Repeat Work（Headless）
estimated_minutes: 35
sources:
  - url: https://code.claude.com/docs/en/headless
    checked: 2026-10-25
  - url: https://code.claude.com/docs/en/permission-modes
    checked: 2026-10-25
  - url: https://code.claude.com/docs/en/worktrees
    checked: 2026-10-24
  - url: https://code.claude.com/docs/en/best-practices
    checked: 2026-10-24
announcements:
  - author: "@bcherny"
    date: 2026-01-03
    url: https://x.com/bcherny/status/2007179832300581177
    summary: ターミナルで5つ、Web で5〜10のセッションを並列に動かしている
    verified: false
  - author: Claude blog
    date: 2026-10-16
    url: https://claude.dev/blog/solving-code-review-at-anthropic/
    summary: 「How the Claude Code team does code review」。書いたセッションとは別の context でレビューさせる
    verified: true
  - author: "@ClaudeDevs"
    date: 2026-10-14
    url: https://x.com/ClaudeDevs/status/2110445844675838148
    summary: Claude Code のデスクトップアプリで、多数のセッションを並べて動かしやすくした。開始が速く、各セッションの状態が常に見える
    verified: true
  - author: "@ClaudeDevs"
    date: 2026-10-16
    url: https://x.com/ClaudeDevs/status/2111168901723906176
    summary: Claude Code のコードの約 90% を Claude が書く。6〜9月にマージされた PR は2倍超、revert の割合は 40% 超減
    verified: true
history:
  - version: 2025-04 ブログ
    date: 2025-04
    advice: 複数の Claude を git worktree で並べ、1つが書き、もう1つが確かめる
    status: current
  - version: 2.1.49
    date: 2026-02-19
    advice: claude --worktree <name>（-w）で worktree を作って起動する
    status: current
  - version: 2.1.139
    date: 2026-05-11
    advice: claude agents（agent view）でバックグラウンドのセッションを一覧する
    status: experimental
    note: research preview
  - version: 2026-08
    advice: セッション間でメッセージを送り合える（cross-session messaging）
    status: current
---

## この章でできるようになること

- `claude -w` で worktree を作り、作業を互いに干渉させずに並べられる
- 書いたセッションとは別のセッションにレビューさせられる（Writer / Reviewer）
- `claude -p` で、対話なしに Claude を呼び出してスクリプトに組み込める

## 公式の要点

### worktree

worktrees のページに書かれている使い方です [V]。

- `claude --worktree <name>`（短縮 `-w`）で `.claude/worktrees/<name>` に作業用の checkout を作り、`worktree-<name>` ブランチで起動する
- `.claude/worktrees/` を `.gitignore` に入れておく
- gitignore されたファイル（`.env` など）を新しい worktree にも複製したいときは `.worktreeinclude` に書く

### Writer / Reviewer

書いたセッションは自分の判断に引きずられるので、別の context（別セッション、subagent、`/code-review`）に確かめさせます [V]。

### headless

`claude -p "<依頼>"` で対話なしに実行します [V]。

| オプション | 意味 |
|---|---|
| `--output-format json` | 結果を JSON で受け取る（`stream-json` は `--verbose` と併用） |
| `--allowedTools "Edit,Bash(npm test *)"` | 使ってよい道具を限定する |
| `--permission-mode dontAsk` | 許可されていない操作は確認せず拒否する（CI 向け） |
| `--permission-mode auto` | 一つずつ許可を並べる代わりに、分類モデルに審査させる |

- v2.1.302 以降、`claude -p` はモードを指定しないと Manual（`default`）で始まります。対話で確認できないので、承認が要る呼び出しは拒否されます。`--allowedTools` で許可するか、`--permission-mode auto` を渡します [V]（permission-modes・headless）

### その他の並列の道具

- `/batch <指示>`: 変更を 5〜30 の subagent に分け、それぞれの worktree で進める [V]
- `claude agents`: バックグラウンドのセッションを一覧する。research preview [V]

## ハンズオン

### 1. worktree の準備

<!-- exercise id="a07-ignore" check="file-contains" path="sample-app/.gitignore" pattern="^\.claude/worktrees" -->
`sample-app/.gitignore` に `.claude/worktrees/` を足してコミットする。
<!-- /exercise -->

### 2. Writer: worktree で機能を足す

```bash
cd ~/ai-dev-tutor-workspace/sample-app
claude -w add-search
```

```text
tasklog に search コマンドを足して。タイトルに文字列を含むタスクを表示する。
テストも書いて、npm test が通るのを確かめてからコミットして。
```

<!-- exercise id="a07-worktree" check="command" cwd="sample-app" run="git branch --list 'worktree-*' | grep -q ." -->
`claude -w` で worktree を作って作業させる。`git branch` に `worktree-` で始まるブランチがあること。
<!-- /exercise -->

### 3. Reviewer: 別のセッションでレビューする

別のターミナルで、元のフォルダ（worktree ではない方）から起動します。

```text
worktree-add-search ブランチの変更を main と比べてレビューして。
直すべき点だけを挙げて。直さないで。
```

`/code-review` も試します。

<!-- exercise id="a07-review" check="manual" -->
Writer とは別のセッション（または `/code-review`）でレビューさせ、Writer が見落としていた点が出るか確かめる。終えたら `npm run done -- a07-review` で完了にする。
<!-- /exercise -->

### 4. headless

```bash
cd ~/ai-dev-tutor-workspace/sample-app
claude -p "src/ の各関数を1行ずつ説明して" --output-format json --allowedTools "Read,Glob" > ../notes/a07-headless.json
```

<!-- exercise id="a07-headless" check="file-contains" path="notes/a07-headless.json" pattern="\x22result\x22" -->
上のコマンドで `notes/a07-headless.json` を作る。JSON の中の `result`（答え）と、費用や所要時間の項目を見ておく。
<!-- /exercise -->

## 2026-10 の更新

### 並べるときはファイルの境目で分ける

cloud session の記事（2026-10-06）では、同じリポジトリに3つのセッションを並べた結果、1つのセッションが、別のセッションが直している最中のバグを報告しました [V]。セッションは互いの変更を知りません。記事の助言は次のとおりです。

- 並列のタスクはファイルの境目で分ける
- ブランチは筋の通る順にマージする
- あるセッションが、別のセッションで直している問題を報告することを想定しておく

2026-10-14 には、デスクトップアプリで多数のセッションを並べやすくなったと告知されています [V]。

### レビューの重さはリスクで決める

Claude Code チームは、変更のリスクで人の承認の数を変えています [V]。

| リスク | 例 | 人の承認 |
|---|---|---|
| 低 | docs、文言、フラグの裏の追加 | 自動レビューとセキュリティチェックが通れば不要 |
| 中 | 普通の製品の変更、キャッシュ・自動更新・system prompt | 1人 |
| 高 | 最もリスクの高いコードと、常に2人が必要なパス | 2人 |

- 段階を決めるのは書いた人ではなく変更の中身
- エージェントの承認は人の承認として数えない
- エージェントに書かせた人も、必要なレビュアーの1人として数える

Writer / Reviewer で並べたときも、最後に何が起きても責任を持つのは人です。

## 振り返り

- 並列にできるのは、1つのセッションを信頼できるようになってからです。A3 の確かめ方と A6 の守りが無いまま並べると、確かめていない変更が並列に増えます（pstack の「fearless parallelism」も同じ前提。B1 で扱います）
- 次の A8 ではセッションをクラウドで動かします
