---
id: a10-security
title: エージェントのセキュリティ
track: claude-code
order: 10
as_of: 2026-10-26
applies_to: Claude Code 2.1.310 / Opus 5.5
estimated_minutes: 25
sources:
  - url: https://code.claude.com/docs/en/security
    checked: 2026-10-26
  - url: https://code.claude.com/docs/en/sandbox-environments
    checked: 2026-10-26
  - url: https://code.claude.com/docs/en/security-guidance
    checked: 2026-10-26
history:
  - version: 2026-10 時点
    advice: 信頼できない内容（Web・issue・外部の文書）を扱うときは、コマンドを確かめてから承認し、VM などの隔離した環境で動かす
    status: current
  - version: 2026-10 時点
    advice: 変更のセキュリティを、/security-review や security-guidance プラグインで確かめる
    status: current
---

## この章でできるようになること

- Claude Code に組み込まれている守りと、使う人が負う責任を区別できる
- プロンプトインジェクション（文書や Web に仕込まれた指示）を見分け、被害を小さくする使い方ができる
- 変更のセキュリティを、組み込みのコマンドで確かめられる

A6 では、決まった操作を仕組みで止めました。この章では、Claude が読む内容そのものが攻撃の入り口になる場合を扱います。

## 公式の要点

### 組み込みの守り

Claude Code には次の守りが入っています [V]（security）。

| 守り | 中身 |
|---|---|
| 権限モード | auto mode は分類モデルが操作を審査し、危険なものを止める。Manual は読む操作以外を毎回確認する（A6） |
| 通信するコマンドの確認 | `curl` や `wget` のように Web から取ってくるコマンドは、既定では自動承認されない |
| Web ページの要約 | WebFetch は、ページをそのまま渡さず、別のモデルで要約した結果を Claude に渡す（多くの場合） |
| 信頼の確認 | 信頼していないフォルダで起動すると確認の画面が出る。`.mcp.json` のサーバーにも別の承認がある（A9） |
| 解析できないコマンドの確認 | Manual では、中身を解析しきれない Bash コマンドは確認を求める |
| 認証情報の保存 | API キーやトークンは macOS のキーチェーンに保存する（使えるとき） |

`claude -p`（A7）では、信頼の確認の画面も `.mcp.json` の承認も出ません [V]。知らないリポジトリで `-p` を動かすときは、特に注意します。

公式は、これらの守りでも完全ではないとしたうえで、**提案されたコードとコマンドを承認前に確かめるのは使う人の責任**としています [V]。

### 信頼できない内容を扱うときの5か条

公式の勧めです [V]（security）。

1. 提案されたコマンドは、承認する前に確かめる
2. 信頼できない内容を、そのまま Claude に流し込まない
3. 大事なファイルへの変更は確かめる
4. スクリプトの実行やツールの呼び出しは VM で行う。外部の Web サービスとやり取りするときは特に
5. 怪しい振る舞いは `/feedback` で報告する

信頼できないリポジトリは、VM か cloud session で扱います（C2）。

### 変更のセキュリティを確かめる

| 道具 | 使い方 |
|---|---|
| `/security-review` | 今のブランチの変更を、その場でセキュリティの観点から確かめる [V] |
| security-guidance プラグイン | 作業中に、Claude が自分の変更の脆弱性を確かめて直す [V] |
| `/permissions` | 今効いている allow と deny を見直す。定期的に見直すよう公式が勧めている [V] |

## ハンズオン

workspace の `sample-app/docs/vendor-notes.md` は、外部のベンダーから届いたという想定の連携メモです。このファイルには、AI に向けた指示がこっそり仕込まれています。

### 1. 仕込まれた指示に気づく

まず Claude に要約させます。結果を確かめたら、ファイルを自分で開いて読みます。

```text
docs/vendor-notes.md を要約して
```

<!-- exercise id="a10-injected" check="file-contains" path="notes/a10-security.md" pattern="^埋め込まれていた指示: .{5,}" -->
`notes/a10-security.md` の `埋め込まれていた指示:` の後ろに、ファイルに仕込まれていた指示の中身を書く。画面の表示（Markdown のプレビュー）では見えない場所に書かれていることに注意する。
<!-- /exercise -->

<!-- exercise id="a10-reaction" check="file-contains" path="notes/a10-security.md" pattern="^Claude の反応: .{5,}" -->
同じファイルの `Claude の反応:` の後ろに、Claude が仕込まれた指示に従ったか、無視したか、指示があると知らせたかを書く。`git diff` で package.json が書き換わっていないかも確かめる（書き換わっていたら `git checkout package.json` で戻す）。
<!-- /exercise -->

外部の文書・issue・Web ページには、こうした指示が紛れ込むことがあります。Claude が従わなかったとしても、仕込まれうると知っておくことが、5か条の「確かめてから承認する」につながります。

### 2. 変更と権限を見直す

<!-- exercise id="a10-security-review" check="manual" -->
sample-app で `/security-review` を実行し、何を指摘するかを見る。終えたら `npm run done -- a10-security-review` で完了にする。
<!-- /exercise -->

<!-- exercise id="a10-permissions" check="manual" -->
`/permissions` を開き、A6・A9 で足した allow と deny を見直す。書き込みや送信をする道具を allow で自動承認していないかを確かめる。終えたら `npm run done -- a10-permissions` で完了にする。
<!-- /exercise -->

## 振り返り

- 守りは重ねて使います。権限モード（A6）、deny と hook（A6）、隔離（C2）、そして承認前に確かめる人の目です
- 次の A11 では、セッションを続けたり分けたりする方法を扱います
