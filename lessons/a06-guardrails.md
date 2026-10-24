---
id: a06-guardrails
title: hooks・permissions・sandbox・auto mode で守る
track: claude-code
order: 6
as_of: 2026-10-24
applies_to: Claude Code 2.1.310 / Opus 5.5
official_ref: Claude Code in Action · Configure Claude（Permission Modes / Hooks）
estimated_minutes: 30
sources:
  - url: https://code.claude.com/docs/en/permissions
    checked: 2026-10-24
  - url: https://code.claude.com/docs/en/hooks
    checked: 2026-10-24
  - url: https://code.claude.com/docs/en/best-practices
    checked: 2026-10-24
  - url: https://claude.com/resources/articles/auto-mode-default-in-claude-code
    checked: 2026-10-24
announcements:
  - author: "@bcherny"
    date: 2026-01-03
    url: https://x.com/bcherny/status/2007179832300581177
    summary: --dangerously-skip-permissions ではなく /permissions で安全なコマンドを許可しておく。PostToolUse でフォーマッタを回す
    verified: false
  - author: Claude
    url: https://claude.com/resources/articles/auto-mode-default-in-claude-code
    summary: auto mode を Claude Code の既定にした理由と、分類モデルが何を確かめるか
    verified: true
history:
  - version: 1.0.38
    date: 2025-06-30
    advice: hooks で毎回必ず行う処理（整形・危険なコマンドの拒否）を決める
    status: current
  - version: 2.0.24
    date: 2025-10-20
    advice: /sandbox で OS レベルの隔離をかけ、許可の確認を減らす
    status: current
  - version: 2.1.8x
    date: 2026-03
    advice: auto mode（research preview）。人の代わりに分類モデルが操作を審査する
    status: current
    note: v2.1.283 から全プランで起動時の既定。それ以前は Pro / Max / Team で既定
---

## この章でできるようになること

- 権限モードの違いを説明でき、今の既定を確かめられる
- `/permissions` の allow / deny で、確認の手間と危険を両方減らせる
- PreToolUse hook で、特定のコマンドを理由付きで止められる

## 公式の要点

### 権限モード

permissions のページに書かれているモードです [V]。

| モード | 動き |
|---|---|
| `default`（Manual） | 編集やコマンドのたびに確認 |
| `acceptEdits` | ファイル編集は確認なし、コマンドは確認 |
| `plan` | 読むだけ。計画を立てる |
| `auto` | 分類モデルが操作を審査し、危険なものだけ止める。v2.1.283 から起動時の既定 |
| `dontAsk` | 許可リストにないものは確認せず拒否（headless 向け） |
| `bypassPermissions` | 確認なし。隔離された環境以外では使わない |

### allow / deny

`.claude/settings.json` の `permissions` に書きます。deny は allow より優先されます [V]。

```json
{ "permissions": { "allow": ["Bash(npm test *)", "Bash(npm run *)"], "deny": ["Bash(git push *)"] } }
```

### hooks

hooks は CLAUDE.md と違って必ず実行されます [V]。PreToolUse hook は道具を使う直前に走り、終了コード 2 で止めます。このとき stderr が理由として Claude に渡ります。`exit 1` は止めません。

### sandbox

`/sandbox` で、コマンドが書き込める場所と通信先を OS レベルで制限します。許可の確認を減らしつつ、被害の範囲を絞れます [V]。

### 守り方の比較

| 守り方 | 何に頼るか | 向いているもの |
|---|---|---|
| CLAUDE.md に「push しないで」 | Claude の注意 | 破っても大きな害がないこと |
| deny ルール | Claude Code の設定 | 決まったコマンドの禁止 |
| PreToolUse hook | スクリプト | 条件付きの禁止、理由の説明 |
| sandbox | OS | 想定外の操作全般の被害を絞る |

## ハンズオン

### 1. 今の権限モードを確かめる

Claude Code を起動し、`Shift+Tab` でモードを切り替えながら表示を見ます。

<!-- exercise id="a06-mode" check="file-contains" path="notes/a06-guardrails.md" pattern="^起動時の権限モード: (auto|default|acceptEdits|plan|dontAsk|bypassPermissions)" -->
起動直後のモードを、`auto` や `default` などの名前で `notes/a06-guardrails.md` に書く。教材の記述（v2.1.283 から auto が既定）と合っているか見る。
<!-- /exercise -->

### 2. deny ルール

<!-- exercise id="a06-deny" check="file-contains" path="sample-app/.claude/settings.json" pattern="deny[^\]]*Bash\(git push" -->
`sample-app/.claude/settings.json` に `permissions.deny` を足し、`git push` を禁止する。A3 の `hooks` は残したまま、同じファイルに足すこと。
<!-- /exercise -->

### 3. PreToolUse hook で理由付きで止める

`sample-app/.claude/hooks/block-push.sh` に次の内容を書きます。

```sh
#!/bin/sh
# PreToolUse(Bash): git push を止め、理由を Claude に返す
# 簡易な例。コマンド文字列に "git push" を含むかだけを見るので、git -C . push のような書き方はすり抜ける
cmd=$(node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.parse(s).tool_input?.command ?? ""))')
case "$cmd" in
  *"git push"*)
    echo "この教材では push しません。push は人が確認してから行います" >&2
    exit 2 ;;
esac
exit 0
```

JSON 全体を grep するとコミットメッセージの中の「git push」などにも反応してしまうので、入力の JSON から `tool_input.command`（実行しようとしているコマンド）だけを取り出して調べます。すり抜けがあるので、確実に止めたいことは deny ルールや sandbox と重ねます。

`settings.json` の `hooks` に足します。

```json
"PreToolUse": [
  { "matcher": "Bash", "hooks": [ { "type": "command", "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/block-push.sh" } ] }
]
```

<!-- exercise id="a06-block-script" check="command" cwd="sample-app" run="test -x .claude/hooks/block-push.sh || exit 1; printf '{\042tool_input\042:{\042command\042:\042git push origin main\042}}' | ./.claude/hooks/block-push.sh 2>/dev/null; test $? -eq 2" -->
`block-push.sh` を作り、`chmod +x` する。判定では `git push` の入力を渡して終了コード 2 で止めるかを実際に確かめる。
<!-- /exercise -->

<!-- exercise id="a06-block-hook" check="json-has" path="sample-app/.claude/settings.json" key="hooks.PreToolUse" -->
PreToolUse hook を登録する。Claude に「git push して」と頼み、止められて理由が返ることを確かめる。リモートが無いので、hook が止めなくても push は失敗します。
<!-- /exercise -->

<!-- exercise id="a06-sandbox" check="manual" -->
`/sandbox` を開き、書き込める場所と通信先の設定を確かめる。終えたら `npm run done -- a06-sandbox` で完了にする。
<!-- /exercise -->

## 振り返り

- deny と hook の両方で push を止めました。どちらか1つで足りる場面と、両方が要る場面を考えてみてください（deny は理由を返せない、hook は条件を細かく書ける）
- 次の A7 では守りを固めた上で複数のセッションを並べて動かします
