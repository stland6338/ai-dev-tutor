---
id: f02-context
title: context を設計する
track: prompt
order: 2
as_of: 2026-10-26
applies_to: Claude Code 2.1.310 / Opus 5.5
estimated_minutes: 25
sources:
  - url: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
    checked: 2026-10-24
  - url: https://code.claude.com/docs/en/best-practices
    checked: 2026-10-24
  - url: https://claude.com/resources/articles/building-agents-when-to-fold-subagents-into-your-main-agent-loop
    checked: 2026-10-24
history:
  - version: 2025-09-29 の記事
    date: 2025-09-29
    advice: 「Effective context engineering for AI agents」。望む結果につながる、最小で密度の高い token の組を探す
    status: current
  - version: 2026-10 時点
    advice: 長い作業は、進捗のメモ・compaction・要約を返す subagent で context を守る
    status: current
---

## この章でできるようになること

- context は限られた資源で、増やすほど質が落ちる理由を説明できる
- 指示・道具・例・資料を、context を無駄にしない形で渡せる
- 長い作業で、進捗のメモと compaction と subagent を使い分けられる

F1 はプロンプトの書き方でした。この章では、プロンプトを含めて Claude に何を見せるか（context）を設計します。A2・A4・A5・A9 で個別に扱ったことを、1つの考え方にまとめる章です。

## 公式の要点

Anthropic の engineering ブログ「Effective context engineering for AI agents」（2025-09-29）の要点です [V]。

### 最小で、密度の高い token を

context が増えるほど、モデルが情報を正しく取り出す力は落ちます（context rot）。注意を向けられる量には限りがあるので、**望む結果につながる、最小で密度の高い token の組**を探します [V]。

| 要素 | 勧められていること | この教材の章 |
|---|---|---|
| system prompt・指示 | 「適切な高度」で書く。ロジックを細かく書き込みすぎず、ぼんやりした指針にもしない。節に分ける | A4（CLAUDE.md を短く）・F1 |
| 道具 | 少数で、役割が重ならず、それだけで意味が分かる道具にする | A9（MCP は必要なものだけ） |
| 例 | 細かい規則を並べるより、種類の違う典型的な例をいくつか示す | F1 |
| 資料 | 全部を先に読み込まず、パスや問い合わせの形で持っておき、必要なときに道具で読む（just-in-time） | A5（skill は使うときに本文を読む） |

### 長い作業で context を守る

1つの context に収まらない長い作業には、3つの方法があります [V]。

| 方法 | 中身 | Claude Code での形 |
|---|---|---|
| compaction | 履歴を要約して、続きを新しい context で進める | `/compact <残したいこと>`（A2） |
| 構造化したメモ | 進捗と次にやることをファイルに書き、context の外に残す | `NOTES.md` などのファイル |
| subagent | 調べ物を別の context に任せ、要約だけを受け取る | subagent（A5）。ただし公式は2026-10に「まず1つのループと skills で足りるか考える」と勧めている |

## ハンズオン

### 1. 進捗のメモを context の外に残す

長い作業の途中で `/clear` しても続きから再開できるように、sample-app に進捗のメモを作ります。Claude に「今の作業の進捗と次にやることを NOTES.md に書いて。セッションをまたいで読み返せる形で」と頼んでも構いません。

<!-- exercise id="f02-notes-progress" check="file-contains" path="sample-app/NOTES.md" pattern="^## 進捗" -->
`sample-app/NOTES.md` を作り、`## 進捗` の節に、ここまでに終えたことを書く。
<!-- /exercise -->

<!-- exercise id="f02-notes-next" check="file-contains" path="sample-app/NOTES.md" pattern="^## 次にやること" -->
同じファイルに `## 次にやること` の節を作り、次のセッションで最初にやることを書く。新しいセッションで「NOTES.md を読んで続きをして」と頼み、続きから始まることを確かめる。
<!-- /exercise -->

### 2. compaction で残すものを決める

<!-- exercise id="f02-compact" check="file-contains" path="notes/f02-context.md" pattern="^compact で残す指示: .{10,}" -->
`notes/f02-context.md` の `compact で残す指示:` の後ろに、tasklog の作業で `/compact` するときに残すべきものを書く（例: 直したバグ、テストのコマンド、触ったファイル）。
<!-- /exercise -->

### 3. 調べ物を別の context に任せる

```text
/context
```

で今の量を見てから、「subagent に src/ と test/ を全部読ませて、テストの抜けを3つ、要約だけ返させて」と頼み、もう一度 `/context` を見ます。

<!-- exercise id="f02-subagent" check="manual" -->
調べ物を subagent に任せたときと、同じ調べ物を自分のセッションで直接させたときで、`/context` の量がどう違うかを比べる。終えたら `npm run done -- f02-subagent` で完了にする。
<!-- /exercise -->

## 振り返り

- context は、増やすほど良くなるものではありません。指示は短く（A4）、道具は少なく（A9）、資料は必要なときに（A5）、長い作業はメモと compaction で、という A トラックの決まりは、どれもこの考え方から来ています
