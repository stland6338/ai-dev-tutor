---
id: a02-workflow
title: Explore → Plan → Implement → Commit と context の管理
track: claude-code
order: 2
as_of: 2026-10-24
applies_to: Claude Code 2.1.310 / Opus 5.5
official_ref: Claude Code 101 · Module 3（Daily workflows）
estimated_minutes: 30
sources:
  - url: https://code.claude.com/docs/en/best-practices
    checked: 2026-10-24
  - url: https://code.claude.com/docs/en/common-workflows
    checked: 2026-10-24
announcements:
  - author: "@bcherny"
    date: 2026-01-03
    url: https://x.com/bcherny/status/2007179832300581177
    summary: Claude Code 作者の13の tips。plan mode で計画を詰めてから auto-accept で実装する、など
    verified: false
history:
  - version: 2025-04 ブログ
    date: 2025-04
    advice: engineering ブログ「Claude Code: Best practices for agentic coding」で explore → plan → code → commit を推奨
    status: superseded
    note: 記事は docs の best-practices に統合された（旧 URL は転送される）。4段階の考え方は継続
  - version: 1.0.33 以前
    date: 2025-06
    advice: plan mode で計画してから実装する
    status: current
    note: 2026-10 時点の docs は「diff を1文で説明できるなら計画は省いてよい」と条件付き
  - version: 2.0.0
    date: 2025-09-29
    advice: /rewind（Esc Esc）で会話とファイルを巻き戻す
    status: current
  - version: 2026-10 時点
    advice: AskUserQuestion で Claude に聞き取りをさせて spec を書かせ、新しいセッションで実装する
    status: current
---

## この章でできるようになること

- 公式の4段階 Explore → Plan → Implement → Commit で、1つのバグを直してコミットできる
- 計画を省いてよい場面と、省くべきでない場面を区別できる
- `/clear`・`/compact`・`/rewind`・`/btw` を使い分けて、context を汚さずに進められる

## 公式の要点

### 4段階

best-practices に書かれている進め方です [V]。

| 段階 | すること | Claude Code の操作 |
|---|---|---|
| Explore | 関係するファイルを読ませる。まだ書かせない | plan mode（`Shift+Tab`、または `claude --permission-mode plan`） |
| Plan | 実装の計画を書かせ、人が直す | `Ctrl+G` で計画をエディタで開いて直接直す |
| Implement | 計画どおりに実装させ、確かめる | plan mode を抜ける |
| Commit | コミットメッセージを書かせてコミット | 「コミットして」と頼む |

- 計画を省いてよいのは「diff を1文で説明できる」ときだけです。方針が定まらない、複数ファイルにまたがる、知らないコード、のどれかに当たるなら計画します [V]
- 大きめの機能は Claude に AskUserQuestion で聞き取りをさせて spec を書かせ、新しいセッションで spec から実装させる方法も公式に載っています [V]

### context の管理

context は最も限られた資源です [V]。

| 操作 | 使う場面 |
|---|---|
| `/clear` | 関係のない次の作業に移るとき |
| `/compact <残したいこと>` | 同じ作業を続けるが、履歴が長くなったとき。何を残すか指示できる |
| `Esc Esc` / `/rewind` | 失敗した試みを無かったことにしたいとき。「ここまでを要約」もできる |
| `/btw <質問>` | 履歴に残したくない、ちょっとした質問 |
| `/context` | 今 context に何が入っているかを見る |

> 補足 [U]: 2026-10 に「Claude Code チームは plan mode を不要と考え始めている」とする外部記事が出ていますが、出典が示されておらず未確認です。公式 docs は条件付きで plan mode を推奨したままです。

## ハンズオン: 失敗しているテストを直す

```bash
cd ~/ai-dev-tutor-workspace/sample-app
npm test          # summarize のテストが1つ落ちることを確かめる
claude --permission-mode plan
```

### Explore と Plan

plan mode のまま、次のように頼みます。

```text
npm test で落ちているテストの原因を調べて、直す計画を立てて。
計画には「何をもって直ったと確かめるか」も書いて。
計画を承認する前に、計画を docs/plan-summarize.md に書き出して。
```

<!-- exercise id="a02-plan" check="file-contains" path="sample-app/docs/plan-summarize.md" pattern="確かめ方|確認方法|検証" -->
計画を `sample-app/docs/plan-summarize.md` に書き出させる。計画に「確かめ方」（確認方法・検証）の節があること。無ければ `Ctrl+G` で自分で書き足す。
<!-- /exercise -->

### Implement

計画を承認して実装させます。

<!-- exercise id="a02-fix" check="command" cwd="sample-app" run="node --test test/summarize.test.js" -->
`test/summarize.test.js` が全部通るように直させる。テストの期待値を書き換えて通すのは不正解（期待値は正しい）。
<!-- /exercise -->

### Commit

<!-- exercise id="a02-commit" check="command" cwd="sample-app" run="git log --format=%s | grep -q '^fix'" -->
「変更をコミットして。メッセージは fix: で始めて」と頼んでコミットさせる。`git log` で確かめる。
<!-- /exercise -->

最後に context の操作を試します。同じセッションで `/context` を実行してから `/compact 直したバグとテストコマンドだけ残して` を実行し、もう一度 `/context` で減り方を見ます。

<!-- exercise id="a02-context" check="file-contains" path="notes/a02-workflow.md" pattern="使い分け: .{10,}" -->
`notes/a02-workflow.md` に、`/clear` と `/compact` の使い分けを自分の言葉で1文書く。
<!-- /exercise -->

## 振り返り

- 計画に「確かめ方」が無いと、Claude は「直しました」と報告して終わりがちです。次の A3 ではこの確かめ方を Claude に強制する方法（`/goal`・Stop hook）を扱います
