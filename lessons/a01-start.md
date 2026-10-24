---
id: a01-start
title: インストールと最初の依頼
track: claude-code
order: 1
as_of: 2026-10-24
applies_to: Claude Code 2.1.310 / Opus 5.5
official_ref: Claude Code 101 · Module 1–2（What is Claude Code / Installing）
estimated_minutes: 20
sources:
  - url: https://anthropic.skilljar.com/claude-code-101
    checked: 2026-10-24
  - url: https://code.claude.com/docs/en/quickstart
    checked: 2026-10-24
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

- 手元の Claude Code の版と、使っているモデルを確かめられる
- 公式のインタラクティブ講座 `/powerup` を始められる
- 知らないコードベースについて、まず Claude に質問して全体像をつかめる

公式講座「Claude Code 101」の Module 1–2 に当たります。講座は動画とクイズが中心なので、この章では同じ内容を手元で実際に行います。

## 公式の要点

- Claude Code はターミナルで動くエージェントで、ファイルを読み、コマンドを実行し、コードを書き換えます。考える → 道具を使う → 結果を見る、を繰り返す仕組みです [V]（how-claude-code-works）
- 2026-10 時点の推奨モデルの起点は **Opus 5.5**（`claude-opus-5-5`、既定の effort は medium）です [V]
- 思考の深さは **effort**（low / medium / high / xhigh / max）で調整します。`/model` から変えられます。プロンプトに「think hard」と書く方法は古い推奨です（章末の年表を参照）[V]
- 知らないリポジトリでは、いきなり変更を頼まず、まず質問して読ませるのが公式の最初の一歩です [V]（quickstart・best-practices）

## ハンズオン

workspace の `sample-app/`（tasklog という小さな CLI）を使います。

```bash
cd ~/ai-dev-tutor-workspace/sample-app
claude --version
claude
```

<!-- exercise id="a01-version" check="file-contains" path="notes/a01-start.md" pattern="^claude --version: \d+\.\d+\.\d+" -->
**課題**: `claude --version` の結果を `notes/a01-start.md` の `claude --version:` の後ろに書く。教材の版（帯に表示）と違ったら、`claude update` で更新するかどうか考える。
<!-- /exercise -->

<!-- exercise id="a01-model" check="file-contains" path="notes/a01-start.md" pattern="^/model のモデル: \S+" -->
**課題**: Claude Code の中で `/model` を開き、今のモデルと effort を確かめて、`/model のモデル:` の後ろに書く。
<!-- /exercise -->

次に、何も変更させずに質問だけします。

```text
このリポジトリは何をするもの？ 構成と、テストの実行方法を教えて。まだ何も変更しないで。
```

<!-- exercise id="a01-purpose" check="file-contains" path="notes/a01-start.md" pattern="^tasklog の目的.*: .{8,}" -->
**課題**: Claude の答えから、tasklog の目的を1文にまとめて書く。Claude の答えに、README や src/ を読んだ形跡（どのファイルを開いたか）が出ていたかも見ておく。
<!-- /exercise -->

最後に公式講座を始めます。

<!-- exercise id="a01-powerup" check="manual" -->
**課題**: Claude Code で `/powerup` を実行し、レッスンを1つ以上終える。終えたら `npm run done -- a01-powerup`。
<!-- /exercise -->

## 振り返り

- 質問だけで、Claude はどのファイルを読みましたか。読む前に答えていたら、それは推測です。以降の章では「読ませてから答えさせる」を前提にします
- 次の A2 では、この sample-app の失敗しているテストを、公式の4段階（Explore → Plan → Implement → Commit）で直します
