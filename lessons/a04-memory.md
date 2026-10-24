---
id: a04-memory
title: CLAUDE.md・rules・memory を短く保つ
track: claude-code
order: 4
as_of: 2026-10-24
applies_to: Claude Code 2.1.310 / Opus 5.5
official_ref: Claude Code 101 · Module 4（Customizing: CLAUDE.md）
estimated_minutes: 25
sources:
  - url: https://code.claude.com/docs/en/memory
    checked: 2026-10-24
  - url: https://code.claude.com/docs/en/best-practices
    checked: 2026-10-24
announcements:
  - author: "@bcherny"
    date: 2026-01-03
    url: https://x.com/bcherny/status/2007179832300581177
    summary: チームの CLAUDE.md を git で共有し、Claude が間違えるたびに1行足す。PR で @claude に頼んで更新させる
    verified: false
history:
  - version: 2025-04 ブログ
    date: 2025-04
    advice: CLAUDE.md にコマンド・スタイル・手順を書き、育てていく
    status: current
    note: 2026-10 の docs は「短く保ち、消して困らない行は消す」を強調
  - version: 2.0.20
    date: 2025-10-16
    advice: ときどきしか使わない知識は CLAUDE.md ではなく skills に置く
    status: current
  - version: 2.0.64
    advice: .claude/rules/*.md の paths で、特定のファイルを触るときだけ読ませる
    status: current
  - version: 2026-10 時点
    advice: /doctor が CLAUDE.md の削れる行を提案する
    status: current
---

## この章でできるようになること

- `/init` で CLAUDE.md を作り、公式の基準で短く削れる
- 条件付きの決まりを `.claude/rules/` に分けられる
- auto memory が何をどこに書いているかを確かめられる

## 公式の要点

**CLAUDE.md は毎回読まれる。だから短く** [V]（memory・best-practices）

- `/init` で雛形を作る
- 各行を「**この行を消したら Claude が間違えるか？**」で判定し、間違えないなら消す
- 書くもの: 推測できないコマンド（テストの実行方法など）、そのプロジェクト特有の決まり、よくある失敗
- 書かないもの: コードを読めば分かること、一般的な良い習慣、たまにしか要らない手順（→ skills。A5）
- `@path` で他のファイルを読み込める。個人用は `CLAUDE.local.md`（gitignore する）
- CLAUDE.md が無く `AGENTS.md` があれば、そちらを読む（C1 で使います）
- `/doctor` が削れる行を提案する

**rules: 特定のファイルを触るときだけ読ませる** [V]

```markdown
---
paths:
  - "test/**/*.js"
---
- テストは node:test と node:assert/strict で書く
- 期待値をテストに合わせて書き換えない
```

**auto memory** [V]: Claude が自分で `~/.claude/projects/<project>/memory/MEMORY.md` に覚え書きを残し、毎回先頭の 200 行（25KB まで）を読みます。`/memory` で確認・オンオフできます。

> CLAUDE.md は**助言**であって強制ではありません [V]。必ず守らせたいことは A3・A6 の hooks にします。

## ハンズオン

```bash
cd ~/ai-dev-tutor-workspace/sample-app
claude
```

```text
/init
```

<!-- exercise id="a04-init" check="file-contains" path="sample-app/CLAUDE.md" pattern="npm test" -->
**課題**: `/init` で `sample-app/CLAUDE.md` を作る。テストの実行方法（`npm test`）が入っていること。
<!-- /exercise -->

生成された CLAUDE.md を開き、各行を「消したら間違えるか？」で判定して削ります。`/doctor` の提案も参考にします。

<!-- exercise id="a04-short" check="command" cwd="sample-app" run="test $(wc -l < CLAUDE.md) -le 40" -->
**課題**: CLAUDE.md を 40 行以内にする。
<!-- /exercise -->

<!-- exercise id="a04-import" check="file-contains" path="sample-app/CLAUDE.md" pattern="^@\S+" -->
**課題**: 長い説明は別ファイルに任せ、CLAUDE.md からは `@README.md` のように読み込む行を1つ入れる。
<!-- /exercise -->

<!-- exercise id="a04-rule" check="file-contains" path="sample-app/.claude/rules/tests.md" pattern="^paths:" -->
**課題**: テストを書くときの決まりを `sample-app/.claude/rules/tests.md` に、`paths:` 付きで分ける（上の例を参考に）。
<!-- /exercise -->

<!-- exercise id="a04-automemory" check="manual" -->
**課題**: `/memory` を開き、auto memory がオンか、何が書かれているかを確かめる。終えたら `npm run done -- a04-automemory`。
<!-- /exercise -->

## 振り返り

- Boris Cherny の tip（間違えるたびに1行足す）と、公式 docs の「短く保つ」は矛盾しません。足すのは**実際に間違えた**ことだけで、間違えなくなった行や一般論は消します
- 次の A5 では、たまにしか要らない手順を skills に、調べ物を subagents に移します
