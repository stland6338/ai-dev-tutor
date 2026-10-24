---
id: a03-verify
title: 確かめ方を渡す（/goal と Stop hook）
track: claude-code
order: 3
as_of: 2026-10-24
applies_to: Claude Code 2.1.310 / Opus 5.5
official_ref: best-practices「Give Claude a way to verify its work」/ Claude Code in Action · Configure Claude
estimated_minutes: 35
sources:
  - url: https://code.claude.com/docs/en/best-practices
    checked: 2026-10-24
  - url: https://code.claude.com/docs/en/goal
    checked: 2026-10-24
  - url: https://code.claude.com/docs/en/hooks
    checked: 2026-10-24
  - url: https://support.claude.com/en/articles/14554000
    checked: 2026-10-24
announcements:
  - author: "@bcherny"
    date: 2026-01-03
    url: https://x.com/bcherny/status/2007179832300581177
    summary: 「Claude に自分の仕事を確かめる手段を渡すと品質が2〜3倍になる」が最重要の tip として挙げられている
    verified: false
  - author: Claude Help Center
    url: https://support.claude.com/en/articles/14554000
    summary: 「Claude Code power user tips」。確かめる手段を渡すことを1番目の tip にしている
    verified: true
history:
  - version: 2025-04 ブログ
    date: 2025-04
    advice: テストを先に書かせる（TDD）、スクリーンショットで確かめさせる
    status: current
    note: 2026-10 の docs では「確かめ方を渡すこと」が最重要の柱として先頭に置かれている
  - version: 1.0.38
    date: 2025-06-30
    advice: hooks で決まった処理を必ず実行させる
    status: current
  - version: 2.1.139
    date: 2026-05-11
    advice: /goal で終了条件を決め、満たすまで Claude に作業を続けさせる
    status: current
---

## この章でできるようになること

- 公式が「最も効く」とする「確かめ方を渡す」を、4つの強さで使い分けられる
- 再現テストを先に書かせてからバグを直させられる
- `/goal` と Stop hook で、テストが通るまで Claude が終われないようにできる

## 公式の要点

2026-10 時点の best-practices は、先頭に「Claude が自分の作業を確かめられる手段を渡す」を置いています [V]。テスト・ビルドの終了コード・スクリーンショットなど、合否が機械的に出るものです。

確かめ方を強制する方法は、弱い順に4段階あります [V]。

| 強さ | 方法 | 特徴 |
|---|---|---|
| 1 | プロンプトに書く（「終える前に npm test を実行して」） | 手軽。忘れられることがある |
| 2 | `/goal <条件>` | ターンごとに小さなモデルが条件を確かめ、満たすまで続けさせる。`/goal clear` で解除 |
| 3 | Stop hook | 終わろうとするたびにスクリプトが走る。決定的（必ず実行される） |
| 4 | 検証用の subagent / `/code-review` | 別の context で、書いた本人以外が確かめる |

### Stop hook の仕組み

hooks のページに書かれている動きです [V]。

- Claude が応答を終えようとすると実行される。終了コード 2 か `{"decision": "block", "reason": "..."}` を返すと、Claude は止まらずに続ける（stderr か reason が理由として渡る）
- 入力の JSON に `stop_hook_active` がある。hook によってすでに続行中なら true になる。これを見ずに毎回止めると、満たせない条件で回り続ける（連続8回で打ち切られる）

## ハンズオン: 再現テスト → 修正 → 強制

`sample-app/ISSUE.md` のバグ（今日が期限のタスクが期限切れに出る）を直します。

### 1. 再現テストを先に書かせる

```text
ISSUE.md のバグを再現するテストを test/overdue.test.js に書いて。
まだ src は直さないで。テストが落ちることを npm test で見せて。
```

<!-- exercise id="a03-repro" check="file-contains" path="sample-app/test/overdue.test.js" pattern="overdue\(" -->
`test/overdue.test.js` に、`overdue` の再現テストを書かせる。直す前に落ちることを自分の目で確かめる。
<!-- /exercise -->

### 2. テストが落ちていたら Stop hook で差し戻す

`sample-app/.claude/hooks/require-tests.sh` を作ります。Claude に頼んで作らせても構いません。

```sh
#!/bin/sh
# Stop hook: テストが落ちていたら、Claude を一度だけ差し戻す
# hook による続行中（stop_hook_active が true）は止めない。止め続けると、満たせない条件で回り続けるため
active=$(node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.parse(s).stop_hook_active===true))')
[ "$active" = "true" ] && exit 0
cd "$CLAUDE_PROJECT_DIR" || exit 0
if ! out=$(npm test --silent 2>&1); then
  echo "npm test が失敗しています。直してから終えてください:" >&2
  printf '%s\n' "$out" | tail -20 >&2
  exit 2
fi
```

- 文字列の grep だと Claude の最後の応答に同じ文字列が入っていたときに誤判定するので、入力の JSON は node で読みます
- 失敗したテストの出力の末尾を stderr に出すと、Claude はそれを理由として受け取り、何が落ちたかが分かります
- この作りでは差し戻しは一度だけです。ループを防ぐ代わりに、2回目の停止は通します。直りきるまで続けさせたいときは、次の `/goal` と組み合わせます

```bash
chmod +x .claude/hooks/require-tests.sh
```

`sample-app/.claude/settings.json` に登録します。

```json
{
  "hooks": {
    "Stop": [
      { "hooks": [ { "type": "command", "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/require-tests.sh" } ] }
    ]
  }
}
```

<!-- exercise id="a03-stop-script" check="command" cwd="sample-app" run="test -x .claude/hooks/require-tests.sh && grep -q stop_hook_active .claude/hooks/require-tests.sh" -->
Stop hook のスクリプトを作る。実行ビットが無いと hook はエラーになるだけで止める働きをしないので、`chmod +x` で実行できるようにする。`stop_hook_active` を見て無限に回らないようにすること。
<!-- /exercise -->

<!-- exercise id="a03-stop-hook" check="json-has" path="sample-app/.claude/settings.json" key="hooks.Stop" -->
`.claude/settings.json` に Stop hook を登録する。Claude Code を起動し直し、`/hooks` で登録されたことを確かめる。
<!-- /exercise -->

### 3. /goal で直させる

```text
/goal npm test が全部通る
```

続けて「ISSUE.md のバグを直して」と頼みます。Claude が途中で終わろうとしても、テストが落ちていれば Stop hook が止め、`/goal` が続行させます。

<!-- exercise id="a03-goal" check="manual" -->
`/goal` を設定した状態でバグを直させ、Claude が自分でテストを回して終える様子を見る。終えたら `npm run done -- a03-goal` で完了にする。
<!-- /exercise -->

<!-- exercise id="a03-fixed" check="command" cwd="sample-app" run="node --test test/overdue.test.js" -->
`test/overdue.test.js` が通る。テストを弱めて通すのは不正解。
<!-- /exercise -->

## 振り返り

- 強さ1（プロンプト）と強さ3（hook）の違いは「Claude の注意に頼るかどうか」です。何度も同じことを頼んでいるなら、hook にする合図です（pstack の encode-lessons-in-structure と同じ考え。B1 で比べます）
- 次の A4 では毎回伝えたいことを CLAUDE.md に、条件付きのことを rules に分けます
