---
id: a05-skills-agents
title: skills と subagents を使い分ける
track: claude-code
order: 5
as_of: 2026-10-24
revised: 2026-10-24（2026-09〜10 の公式発信を反映）
applies_to: Claude Code 2.1.310 / Opus 5.5
official_ref: Anthropic Academy · Introduction to agent skills / Introduction to subagents
estimated_minutes: 30
sources:
  - url: https://code.claude.com/docs/en/skills
    checked: 2026-10-24
  - url: https://code.claude.com/docs/en/sub-agents
    checked: 2026-10-24
  - url: https://anthropic.skilljar.com/introduction-to-agent-skills
    checked: 2026-10-24
  - url: https://anthropic.skilljar.com/introduction-to-subagents
    checked: 2026-10-24
announcements:
  - author: Claude blog
    date: 2026-10-22
    url: https://claude.com/resources/articles/building-agents-when-to-fold-subagents-into-your-main-agent-loop
    summary: subagent を増やすより、1つのループに skills と tool search を組み合わせるほうがよい場面が多い。Claude Code の system prompt も 80% 以上削った
    verified: true
  - author: "@ClaudeDevs"
    date: 2026-10-22
    url: https://x.com/ClaudeDevs/status/2113328526413996100
    summary: Agent Skills を Agentic AI Foundation に寄贈。ChatGPT・Cursor・GitHub Copilot・VS Code など 70 以上の基盤が採用
    verified: true
  - author: "@ClaudeDevs"
    date: 2026-10-01
    url: https://x.com/ClaudeDevs/status/2105721434807083061
    summary: Claude Code を mod で改造できるようになった。mod は plugin に入れて /plugin で入れる
    verified: true
history:
  - version: 1.0.60
    date: 2025-07-24
    advice: /agents でカスタム subagent を作り、調べ物やレビューを任せる
    status: current
    note: 2026-10-22 の記事で「まず skills と1つのループ、subagent は必要なときだけ」に重心が移った
  - version: 2.0.20
    date: 2025-10-16
    advice: skills（.claude/skills/<name>/SKILL.md）で手順や知識を必要なときだけ読ませる
    status: current
    note: .claude/commands/ より skills が推奨
  - version: 2.1.197
    date: 2026-06-30
    advice: subagent が既定でバックグラウンド実行になる
    status: current
---

## この章でできるようになること

- 手順を skill にまとめ、`/skill名 引数` で呼べる
- 副作用のある skill を、Claude が勝手に呼ばないようにできる
- subagent に任せる作業と、任せない作業を区別できる

## 公式の要点

| 仕組み | 置き場所 | 向いているもの |
|---|---|---|
| skills | `.claude/skills/<name>/SKILL.md` | たまに要る手順・知識。普段は `description` だけが読まれ、使うときに本文が読まれる |
| subagents | `.claude/agents/<name>.md` | 別の context でやらせたい調べ物・レビュー。要約だけが戻る |

### skill の frontmatter

skills のページに書かれている項目です [V]。

- `name`（`/` メニューに出る名前）、`description`（いつ使うか。Claude が自動で読むかの判断に使う）
- `disable-model-invocation: true` にすると、Claude は自分で呼ばない。デプロイやリリースのような副作用のある手順はこれにする
- 本文の `$ARGUMENTS` は `/name` の後ろに打った文字列に置き換わる

### subagent の frontmatter

必須は `name` と `description`。`tools` で使える道具を絞り、`model` でモデルを選べる。本文がその subagent の system prompt になる [V]。

### 2026-10 の方針の変化

公式ブログ（10-22）は subagent を増やす前に「1つのループ＋skills」で足りないか考えるよう勧めています [V]。subagent が向いているのは、大量の読み込みで主の context を汚したくないときと、書いた本人以外に確かめさせたいときです。

## ハンズオン

### 1. 副作用のある手順を skill にする

`sample-app/.claude/skills/release-note/SKILL.md` に次の内容を書きます。

```markdown
---
name: release-note
description: 直近のコミットから CHANGELOG.md に項目を追記する。リリース前に人が明示的に呼ぶ
disable-model-invocation: true
---

`git log` で前回のタグ（無ければ最初のコミット）以降のコミットを読み、
CHANGELOG.md の先頭に「## $ARGUMENTS」の見出しで、利用者向けの変更だけを箇条書きで追記する。
fix: と feat: 以外のコミットは載せない。
```

<!-- exercise id="a05-skill" check="file-contains" path="sample-app/.claude/skills/release-note/SKILL.md" pattern="^disable-model-invocation: true" -->
上の skill を作る。Claude が勝手に呼ばない設定にすること。
<!-- /exercise -->

<!-- exercise id="a05-args" check="file-contains" path="sample-app/CHANGELOG.md" pattern="^## 0\.2\.0" -->
Claude Code で `/release-note 0.2.0` を実行し、`CHANGELOG.md` に `## 0.2.0` の節ができることを確かめる。A2・A3 の fix が載っているか見る。
<!-- /exercise -->

### 2. 書いた本人以外に確かめさせる subagent

`sample-app/.claude/agents/test-reviewer.md` に次の内容を書きます。

```markdown
---
name: test-reviewer
description: テストの変更をレビューする。実装に合わせて期待値を弱めていないか、振る舞いを確かめているかを見る
tools: Read, Grep, Glob, Bash
---

あなたはテストのレビュアーです。git diff のうちテストの変更を読み、
次の観点で問題を挙げてください。問題が無ければ「問題なし」とだけ答えてください。
- 期待値を実装に合わせて書き換えていないか
- 内部の実装ではなく、使う側から見える振る舞いを確かめているか
```

<!-- exercise id="a05-agent" check="file-contains" path="sample-app/.claude/agents/test-reviewer.md" pattern="^tools: " -->
上の subagent を作り、`tools` で使える道具を絞る。「test-reviewer で直近のコミットのテストをレビューして」と頼んで動かしてみる。
<!-- /exercise -->

<!-- exercise id="a05-choose" check="file-contains" path="notes/a05-skills-agents.md" pattern="^subagent に任せる作業: .{5,}" -->
`notes/a05-skills-agents.md` に、自分の普段の開発で「subagent に任せる作業」と「skill にする手順」を1つずつ書く。
<!-- /exercise -->

## 2026-10 の更新

### skills は Claude Code の外でも使える標準になった

2026-10-22、Anthropic は Agent Skills を MCP と同じ Agentic AI Foundation に寄贈しました [V]。告知によると、2025 年 12 月以降、ChatGPT、Cursor、GitHub Copilot、VS Code を含む 70 以上のエージェント基盤がこの標準を取り入れています。この章で書いた `SKILL.md` は、他の道具でも読める形式だということです（トラック C で使います）。

### subagent を畳むかどうかの基準

10-22 の記事は Claude Platform でエージェントを作る人向けですが、Claude Code の system prompt を 80% 以上削ったことにも触れています [V]。subagent を残すのは次のどれかに当たるときです。

- 1つのループで、context が膨らんで性能が落ちたと測れる
- 新しい context で並列に進め、終わったら捨ててよい作業がある
- 1つのエージェントでは道具を選びきれない、または system prompt の指示がぶつかる

subagent に分けるなら、問題の種類ではなく context で分け、残りの部分にあまり依存しない作業を渡して、小さな結果を返させるよう勧めています。記事は skill の管理に `/skill-creator`（作成と見直し）と `/skill-doctor`（各 skill の費用と使用頻度を見て、使われていないものを消す）を挙げています。

### mods

2026-10-01 から、Claude Code を mod で改造できます [V]。mod は plugin に入る JavaScript / TypeScript のイベントハンドラーで、動作の変更や UI の追加ができます。Claude Code 2.1.287 以降で既定で有効です。作り方は、Claude に欲しい mod を説明すれば書いてくれます。mod は自分の権限で動くコードなので、信頼できる作者とマーケットプレイスからだけ入れます（A6）。

| 仕組み | 向いているもの |
|---|---|
| skills | たまに要る手順・知識 |
| subagents | 主の context を汚したくない大量の読み込み、書いた本人以外の確認 |
| mods | Claude Code そのものの見た目と動きを、自分の働き方に合わせる |

## 振り返り

- skill は「いつ読むか」を Claude に任せる仕組みなので、必ず実行させたいことには向きません。それは次の A6 の hooks の役割です
