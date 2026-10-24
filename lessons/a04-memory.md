---
id: a04-memory
title: CLAUDE.md・rules・memory を短く保つ
track: claude-code
order: 4
as_of: 2026-10-24
revised: 2026-10-24（2026-09〜10 の公式発信を反映）
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
  - author: claude.dev blog
    date: 2026-10-15
    url: https://claude.dev/blog/solving-code-review-at-anthropic/
    summary: CLAUDE.md は短く保ち、他の文書を指す。コードオーナーが REVIEW.md でレビューの観点を書く
    verified: true
  - author: claude.dev blog
    date: 2026-10-06
    url: https://claude.dev/blog/claude-code-in-the-cloud/
    summary: 個人の ~/.claude は cloud session に届かない。テストの実行方法は CLAUDE.md に書く
    verified: true
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

### CLAUDE.md を短く保つ

CLAUDE.md は毎回読まれるので、短く保ちます [V]（memory・best-practices）。

- `/init` で雛形を作る
- 各行を「この行を消したら Claude が間違えるか？」で判定し、間違えないなら消す
- 書くもの: 推測できないコマンド（テストの実行方法など）、そのプロジェクト特有の決まり、よくある失敗
- 書かないもの: コードを読めば分かること、一般的な良い習慣、たまにしか要らない手順（→ skills。A5）
- `@path` で他のファイルを読み込める。個人用は `CLAUDE.local.md`（gitignore する）
- CLAUDE.md が無く `AGENTS.md` があれば、そちらを読む（C1 で使います）
- `/doctor` が削れる行を提案する

### rules

特定のファイルを触るときだけ読ませる決まりは `.claude/rules/` に置きます [V]。

```markdown
---
paths:
  - "test/**/*.js"
---
- テストは node:test と node:assert/strict で書く
- 期待値をテストに合わせて書き換えない
```

### auto memory

Claude が自分で `~/.claude/projects/<project>/memory/MEMORY.md` に覚え書きを残し、毎回先頭の 200 行（25KB まで）を読みます。`/memory` で確認・オンオフできます [V]。

> CLAUDE.md は助言であって強制ではありません [V]。必ず守らせたいことは A3・A6 の hooks にします。

## ハンズオン

```bash
cd ~/ai-dev-tutor-workspace/sample-app
claude
```

```text
/init
```

<!-- exercise id="a04-init" check="file-contains" path="sample-app/CLAUDE.md" pattern="npm test" -->
`/init` で `sample-app/CLAUDE.md` を作る。テストの実行方法（`npm test`）が入っていること。
<!-- /exercise -->

生成された CLAUDE.md を開き、各行を「消したら間違えるか？」で判定して削ります。`/doctor` の提案も参考にします。

<!-- exercise id="a04-short" check="command" cwd="sample-app" run="test $(wc -l < CLAUDE.md) -le 40" -->
CLAUDE.md を 40 行以内にする。
<!-- /exercise -->

<!-- exercise id="a04-import" check="file-contains" path="sample-app/CLAUDE.md" pattern="^@\S+" -->
長い説明は別ファイルに任せ、CLAUDE.md からは `@README.md` のように読み込む行を1つ入れる。
<!-- /exercise -->

<!-- exercise id="a04-rule" check="file-contains" path="sample-app/.claude/rules/tests.md" pattern="^paths:" -->
上の例を参考にして、テストを書くときの決まりを `sample-app/.claude/rules/tests.md` に `paths:` 付きで分ける。
<!-- /exercise -->

<!-- exercise id="a04-automemory" check="manual" -->
`/memory` を開き、auto memory がオンか、何が書かれているかを確かめる。終えたら `npm run done -- a04-automemory` で完了にする。
<!-- /exercise -->

## 2026-10 の更新: CLAUDE.md と REVIEW.md

コードレビューの記事（2026-10-15）は、レビューのたびに CLAUDE.md が読まれるので、大きなコードベースでは短く保ち、他の文書を指すようにしていると書いています [V]。自動レビューは CLAUDE.md の決まりに反するコードと、CLAUDE.md の行を古くする変更も指摘します。

あわせて `REVIEW.md` が紹介されています [V]。コードオーナーが、自分の担当範囲でレビューが何を重視するかを書くファイルです。記事によると、よい REVIEW.md は次の特徴を持ちます。

- 短い
- そのリポジトリで「失敗とは何か」を書く（docs なら「嘘をつく」、設定なら「誤って振り分ける」）
- 細かい指摘（nit）の数に上限を設け、見なくてよいパスを挙げる
- 名前からの推測ではなく、ファイルと行を証拠として求める
- 件数から始まる要約を求め、直すものが無いときははっきりそう言わせる

cloud session の記事（2026-10-06）は、個人の `~/.claude` はクラウドの VM に届かないので、結合テストの実行方法などはリポジトリの CLAUDE.md に書くよう勧めています [V]。CLAUDE.md・rules・skills・agents・commands はリポジトリと一緒にクラウドへ渡ります。

<!-- exercise id="a04-review-md" check="file-contains" path="sample-app/REVIEW.md" pattern="失敗" -->
`sample-app/REVIEW.md` を作り、tasklog で「失敗とは何か」を1行、見なくてよいパスを1行書く。
<!-- /exercise -->

## 振り返り

- Boris Cherny の tip（間違えるたびに1行足す）と、公式 docs の「短く保つ」は矛盾しません。足すのは実際に間違えたことだけで、間違えなくなった行や一般論は消します
- 次の A5 ではたまにしか要らない手順を skills に、調べ物を subagents に移します
