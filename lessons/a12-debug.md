---
id: a12-debug
title: 設定が効かないときに調べる
track: claude-code
order: 12
as_of: 2026-10-26
applies_to: Claude Code 2.1.310 / Opus 5.5
estimated_minutes: 20
sources:
  - url: https://code.claude.com/docs/en/debug-your-config
    checked: 2026-10-26
  - url: https://code.claude.com/docs/en/claude-directory
    checked: 2026-10-26
history:
  - version: 2026-10 時点
    advice: 効かない設定は、まず /context で読み込まれたかを見て、次に専用のコマンドで原因を絞る
    status: current
  - version: 2026-10 時点
    advice: claude --safe-mode で自分の設定を全部切って起動し、原因が設定にあるかを切り分ける
    status: current
---

## この章でできるようになること

- CLAUDE.md・rules・skills・hooks・MCP が実際に読み込まれたかを、コマンドで確かめられる
- 「読み込まれていない」「別の場所から読まれた」「別の設定に上書きされた」のどれかに絞り込める
- よくある置き場所と書き方の間違いを直せる

A3〜A9 でたくさんの設定を足しました。この章では、それらが効かないときの調べ方を扱います。

## 公式の要点

### まず何が読み込まれたかを見る

公式 docs は、設定が効かない原因はたいてい「ファイルが読み込まれていない」「思っていたのと別の場所から読まれた」「別のファイルに上書きされた」のどれかだとしています [V]（debug-your-config）。

最初に `/context` を実行します。system prompt・道具・MCP のツール・subagent・memory のファイル・skills・会話が、それぞれどれだけ context を使っているかが分かります [V]。

| コマンド | 分かること |
|---|---|
| `/memory` | memory のファイルの場所（ユーザー・プロジェクト）と auto memory |
| `/skills` | 使える skill（プロジェクト・ユーザー・プラグイン） |
| `/hooks` | 登録されている hook |
| `/mcp` | MCP サーバーとその状態・承認 |
| `/permissions` | 今効いている allow と deny |
| `/doctor` | インストールの状態、壊れた設定ファイル、使っていない拡張など。直す案も出す |
| `/debug [問題]` | debug ログを有効にし、Claude にログと設定の場所から原因を調べさせる |
| `/status` | どの設定ファイルが効いているか（組織の管理設定を含む） |

シェルからは `claude doctor` で、セッションを始めずに読み取り専用の診断を出せます [V]。

### 自分の設定を切って切り分ける

`claude --safe-mode` は、CLAUDE.md・skills・プラグイン・hooks・MCP サーバー・自分のコマンドとエージェントなどを切って起動します。問題が消えれば、原因はそのどれかです [V]。

hook が登録されているのに動かないときは、`claude --debug` で起動すると、どの matcher を確かめ、hook が何を返したかがログに残ります [V]。

### よくある原因

docs の表から、この教材で起きやすいものを選びました [V]。

| 症状 | 原因 | 直し方 |
|---|---|---|
| skill が `/skills` に出ない | `.claude/skills/名前.md` に置いている | フォルダにする: `.claude/skills/名前/SKILL.md` |
| hook が動かない | `matcher` が配列になっている | `"Edit\|Write"` のように1つの文字列にする |
| hook が動かない | `matcher` が小文字（`"bash"`） | ツール名は大文字で始まる: `Bash`・`Edit` |
| hook や権限が効かない | `~/.claude.json` に書いている | それは画面の状態を残すファイル。`~/.claude/settings.json` に書く |
| settings.json の値が効かない | 同じ項目が settings.local.json にある | settings.local.json が優先される |
| `.mcp.json` のサーバーが出ない | `.claude/` の中に置いている、または `mcpServers` ではなく `servers` に書いている | リポジトリ直下に置き、`mcpServers` の下に書く（A9） |
| `Bash(rm *)` の deny が `/bin/rm` を止めない | Bash のルールはコマンドの文字列に合わせて見る | 確実に止めたいなら hook か sandbox（A6） |

`/context` で読み込まれているのに守られない指示は、書き方の問題です。あいまいな指示、2つのファイルの食い違い、長すぎるファイルが原因になります（A4）[V]。

## ハンズオン

workspace の sample-app には、わざと置き場所を間違えた skill（`.claude/skills/summary-report.md`）が入っています。

### 1. 読み込まれていないことを確かめる

```bash
cd ~/ai-dev-tutor-workspace/sample-app
claude
```

```text
/skills
```

summary-report が一覧に無いことを確かめます。

### 2. 置き場所を直す

<!-- exercise id="a12-skill-fixed" check="file-exists" path="sample-app/.claude/skills/summary-report/SKILL.md" -->
skill を `.claude/skills/summary-report/SKILL.md` に移す。Claude Code を起動し直し、`/skills` に summary-report が出ることを確かめる。
<!-- /exercise -->

<!-- exercise id="a12-skill-old-removed" check="command" cwd="sample-app" run="test ! -e .claude/skills/summary-report.md" -->
古い `.claude/skills/summary-report.md` を消す（移したなら残っていないはず）。
<!-- /exercise -->

### 3. 診断のコマンドを使う

```bash
claude doctor
```

<!-- exercise id="a12-doctor" check="file-contains" path="notes/a12-debug.md" pattern="^claude doctor で見た行: .{5,}" -->
`notes/a12-debug.md` の `claude doctor で見た行:` の後ろに、`claude doctor` の出力から1行を写し、それが何を意味するかを添える（Auto-updates の行など）。
<!-- /exercise -->

<!-- exercise id="a12-safe-mode" check="manual" -->
`claude --safe-mode` で起動し、`/hooks` と `/skills` に A3〜A9 で足したものが出ないことを確かめる。終えたら `npm run done -- a12-safe-mode` で完了にする。
<!-- /exercise -->

## 振り返り

- 設定が効かないときは、書き直す前に「読み込まれたか」を確かめます。読み込まれていなければ置き場所、読み込まれていれば書き方の問題です
- 次の A13 では、推奨の変化を追い、この教材の「いつの時点の推奨か」と照らす方法を扱います
