---
id: b02-verification-skill
title: 検証スキルと Feature Map を作る
track: pstack
order: 2
as_of: 2026-10-29
applies_to: Claude Code 2.1.310 / pstack 0.15.36
estimated_minutes: 30
sources:
  - url: https://github.com/cursor/plugins/blob/main/pstack/skills/create-verification-skill/SKILL.md
    checked: 2026-10-29
  - url: https://github.com/cursor/plugins/tree/main/pstack/skills/create-verification-skill/references/feature-map-example
    checked: 2026-10-29
  - url: https://github.com/cursor/plugins/blob/main/pstack/skills/maintain-verification-skill/SKILL.md
    checked: 2026-10-29
  - url: https://github.com/cursor/plugins/blob/main/pstack/docs/guide/07-overnight.md
    checked: 2026-10-29
  - url: https://zenn.dev/sc30gsw/books/080faba713547b
    checked: 2026-10-29
announcements:
  - author: "@chenchengpro"
    date: 2026-10-22
    url: https://x.com/chenchengpro/status/2113243170788278767
    summary: （個人の投稿）pstack はスキル集ではなく方法論。検証スキルと feature map が先、並列化と自動マージは最後
    verified: false
history:
  - version: 0.15.36
    date: 2026-10-29
    advice: アプリを動かして確かめる手順を、プロジェクトの skill（Launch・Doctor・Drive・Evidence・Cleanup）と機能ごとの Feature Map として残し、渡す前に一度最後まで実行する
    status: current
---

## この章でできるようになること

- 検証スキルが何のためにあり、どんな節でできているかを説明できる
- sample-app に検証スキルと Feature Map を作り、一度最後まで動かせる
- Feature Map を、アプリの変更に合わせて保つ方法を知る

B1 で見たとおり、pstack は「検証スキルと Feature Map が先、並列化と自動化は最後」という順番を勧めています。A3 の再現テストは「この不具合が直ったか」を確かめる道具でした。検証スキルは、それをアプリ全体に広げ、次に来るエージェントがアプリを外から動かして証拠を取れるようにする道具です。

## 公式の要点

### なぜ要るのか

`create-verification-skill` の SKILL.md は、本気のプロジェクトには、本物のアプリを動かして振る舞いを証明する、スクリプトにした手段が要る、と書いています。アプリを起動し、利用者と同じように機能を動かし、証拠を残す手段です [V]。pstack の多くのプレイブックは、この手段がある前提で書かれています。ない場合、エージェントは「直しました」と報告できても、実物で確かめられません。

もう1つ大事なのは、読み手が人ではなくエージェントだという点です。その場で初めてアプリを見るエージェントが、作業の途中で読むことを前提に書きます [V]。

### 検証スキルの節

| 節 | 書くこと [V] |
|---|---|
| Launch | 確かめるためにアプリを起動する正確なコマンドと、準備ができたと分かる印。空のデータから使える状態まで進めること。プロセスが応答しただけでは準備完了にしない。止め方も書く |
| Doctor | 「このインスタンスは動かす価値があるか」を答える、読むだけのチェックを1つ |
| Drive | このリポジトリの実際のコマンドやセレクタ。例ではなく本物を書く |
| Evidence | 証拠として何を残し、どこに置くか。利用者の通り道を通る、操作と結果の状態の両方を残す、副作用（書かれたファイルなど）も確かめる |
| Cleanup | 自分が起動したものだけを止める。片付けても証拠は消さない |
| Helpers | 同梱するスクリプトは実行できる形にし、呼び方を本文に書く |

frontmatter には `name: verify-<app>` と、アプリ・触る面・いつ使うかを書いた `description` を必ず付けます。無いと skill として登録されません [V]。

### Feature Map

`features/README.md`（目次）と、利用者から見た機能ごとに1つのファイルを置きます。最初は主な3〜5個で十分です [V]。各ファイルは次の4つの見出しで書きます [V]。

| 見出し | 書くこと |
|---|---|
| `## Sub-features` | その機能に含まれる細かい機能 |
| `## How to get to it (user POV)` | 利用者がその機能にたどり着く道 |
| `## Driving it with <harness>` | 検証スキルの道具で動かす手順 |
| `## Gotchas` | 前提が足りずに通らなかったことと、その理由 |

前提が足りずに手順が通らないときは、手順を弱めて通すのではなく、失敗として報告し、理由を Gotchas に書きます [V]。

### 渡す前に一度通す

作った skill は、自分の手順どおりに一度最後まで実行してから渡します。起動 → Doctor → 機能を1つ動かす → 証拠を残す → 片付け、の順で、片付けたあとに証拠が名前を付けた場所に残っていることを確かめます。一度も実行していない skill は下書きです [V]。

### 保ち続ける

アプリが変わると、Feature Map は何も言わずに古くなります。テストや lint と違い、古くなっても CI が知らせないからです。`/maintain-verification-skill` は、検証スキルのフォルダだけを直し、アプリの退行は直さずに報告します [V]。pstack のガイドは、人が見ていない間に作業を回す前の条件の1つに「エージェントに検証スキルなどの道具がある」を挙げています（D02 の「ルーティンにする前に」）[V]。

## Claude Code で作る

```text
/pstack:create-verification-skill
```

SKILL.md は出力先を `.cursor/skills/verify-<app>/` と書いています [V]。Claude Code で実行したときに `.claude/skills/` に書くかどうかは確かめていません [U]。この章の課題は `sample-app/.claude/skills/verify-tasklog/` を見るので、`.cursor/` に作られたら Claude に移してもらいます。pstack を入れていなければ、上の節と見出しを Claude に渡して書いてもらっても構いません。

sample-app の tasklog は CLI なので、サーバーはありません。Launch は「依存を入れ、データを一時ファイルに分ける」こと、Drive は `node src/cli.js` の各コマンドです。`TASKLOG_FILE` を一時ファイルにすると、手元の `tasks.json` を汚さずに動かせます。

## ハンズオン

### 1. 検証スキルを作る

<!-- exercise id="b02-skill-name" check="file-contains" path="sample-app/.claude/skills/verify-tasklog/SKILL.md" pattern="^name: verify-tasklog" -->
`sample-app/.claude/skills/verify-tasklog/SKILL.md` を作り、frontmatter に `name: verify-tasklog` と、tasklog の CLI を動かして確かめるときに使う、と分かる `description` を書く。
<!-- /exercise -->

<!-- exercise id="b02-skill-sections" check="file-contains" path="sample-app/.claude/skills/verify-tasklog/SKILL.md" pattern="^## Cleanup" -->
同じファイルに `## Launch`・`## Doctor`・`## Drive`・`## Evidence`・`## Cleanup` の節を作り、tasklog の実際のコマンドで中身を書く。Cleanup には、証拠を消さないことを書く。
<!-- /exercise -->

### 2. Feature Map を作る

<!-- exercise id="b02-feature-map" check="file-exists" path="sample-app/.claude/skills/verify-tasklog/features/README.md" -->
`features/README.md` に、tasklog の機能（add・done・list・overdue・summary）の目次を書く。
<!-- /exercise -->

<!-- exercise id="b02-feature-overdue" check="file-contains" path="sample-app/.claude/skills/verify-tasklog/features/overdue.md" pattern="^## How to get to it" -->
`features/overdue.md` を4つの見出しで書く。A3 で直した「今日が期限のタスクは期限切れに入らない」を、確かめる結果に入れる。
<!-- /exercise -->

### 3. 一度通す

<!-- exercise id="b02-evidence" check="file-contains" path="notes/b02-verification-skill.md" pattern="^証拠の置き場所: .{5,}" -->
`notes/b02-verification-skill.md` の `証拠の置き場所:` の後ろに、検証スキルが証拠を残す場所を書く。
<!-- /exercise -->

<!-- exercise id="b02-run" check="manual" -->
新しいセッションで「verify-tasklog の skill で overdue を確かめて」と頼み、Launch から Cleanup まで通させる。片付けのあとも証拠の置き場所にファイルが残っていれば完了。`npm run done -- b02-run` で完了にする。
<!-- /exercise -->

## うまくいかないとき

| 症状 | 対処 |
|---|---|
| skill が `/` メニューに出ない | frontmatter の `name` と `description` があるか見る。置き場所は `.claude/skills/<名前>/SKILL.md`（A5・A12） |
| `.cursor/skills/` に作られた | Claude Code が読むのは `.claude/skills/`。フォルダごと移す |
| 動かすたびに手元の `tasks.json` が変わる | Launch で `TASKLOG_FILE` を一時ファイルに向ける |
| 片付けで証拠まで消えた | 証拠の置き場所を、一時フォルダとは別にする |

## 振り返り

- 検証スキルは、エージェントがアプリを外から動かし、証拠を残すための手順書です。読み手は次に来るエージェントです
- Feature Map は機能ごとに「どうたどり着き、何が見えれば正しいか」を書きます。手順を弱めて通さず、通らない理由を残します
- 次のトラック C で、この skill も含めた設定を、複数のエージェントとクラウドで共有できるようにします。D02 では、この skill の名前を Grok Bot への依頼文に書きます
