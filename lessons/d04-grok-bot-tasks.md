---
id: d04-grok-bot-tasks
title: Grok Bot に開発タスクを頼む
track: grok
order: 4
as_of: 2026-10-29
revised: 2026-10-29（結果の受け取りを Cursor のクラウドエージェントから gh の PR に書き直した）
applies_to: "Grok Bot（2026-10 時点）/ GitHub CLI 2.103.0"
estimated_minutes: 20
sources:
  - url: https://docs.x.ai/grok-bot/overview
    checked: 2026-10-26
  - url: https://docs.x.ai/grok-bot/tag-on-x
    checked: 2026-10-26
  - url: https://docs.x.ai/grok-bot/team-bots
    checked: 2026-10-26
  - url: https://cli.github.com/manual/gh_pr_checkout
    checked: 2026-10-29
announcements:
  - author: "@cursor_ai"
    date: 2026-10-12
    url: https://x.com/cursor_ai/status/2109783879490191502
    summary: Cursor が The X Subscription に入り、Premium・Super・Ultra に Grok Bot が含まれる（転載サイトで読んだ）
    verified: false
history:
  - version: beta
    date: 2026-10-26
    advice: 開発タスクは Cursor Cloud Agent に任せ、結果のブランチを手元で確かめる
    status: superseded
    note: 執筆者のプランでは Cloud Agent を起動できなかった
  - version: 2026-10
    date: 2026-10-29
    advice: 合否が出る依頼文で頼み、Bot が gh で出した PR を手元で取ってきて完了条件のコマンドを自分で実行する
    status: current
---

## この章でできるようになること

Grok Bot に開発タスクを、合否が出る形で頼み、返ってきた PR を自分で確かめられるようになります。リポジトリの準備は [D3](#/d03-grok-bot-repo)、承認と安全、4原則の対応は [D2](#/d02-grok-bot) を参照します。

## Claude Code との違い

| 観点 | Claude Code | Grok Bot |
|---|---|---|
| 頼む場所 | 端末のセッション | デスクトップ・モバイルのアプリ、X の @bot、Team Bot なら Slack [V] |
| 頼んだ後 | 端末で見守る | 端末を閉じても続く。承認が要るときに Bot が戻ってくる [V]（overview） |
| 完了の強制 | `/goal`・Stop hook（A3） | 無い。依頼文に完了条件と「証拠を見せて」を書く（D2 の4原則の対応表） |
| 結果 | 手元の差分 | Bot が `gh` で出した PR |

## 手順

### 1. 合否が出る依頼文を書く

公式の「最初の依頼」の例は、何をするか・どこで作業するか・どの情報を使うか・終わった状態が何か、を1つの依頼に入れています [V]（overview）。開発タスクではこれに「どこで止まるか」を足します。

```text
<owner>/<repo> の ISSUE.md にある不具合を直して。
- 作業: ~/work/tasklog-fix に clone し、最新の main から grok/fix-overdue のブランチを切る
- 完了条件: 不具合を再現するテストを先に足し、`npm test` が終了コード 0 で通る
- 証拠: 実行したコマンドと出力の最後の20行を返信に貼る
- 止まる場所: `gh pr create --draft` で PR を出し、URL を返したら止まる。main への push とデプロイはしない
```

<!-- exercise id="d04-request" check="file-contains" path="notes/d04-grok-bot-tasks.md" pattern="^依頼文: .{20,}" -->
**課題**: `notes/d04-grok-bot-tasks.md` の `依頼文:` の後ろに、sample-app への開発タスクの依頼文を1行で書く（何を・どのリポジトリとブランチで・どこで止まるか）。
<!-- /exercise -->

<!-- exercise id="d04-done-when" check="file-contains" path="notes/d04-grok-bot-tasks.md" pattern="^完了条件: .*npm test" -->
**課題**: 同じファイルの `完了条件:` の後ろに、`npm test` を含む、合否が出る完了条件を書く。
<!-- /exercise -->

### 2. どこから頼むか

- **アプリ**: 文字・音声入力・音声チャットで頼めます [V]（overview）
- **X の @bot**: 投稿や返信で @bot をタグ付けすると、メインの Bot がその投稿をタスクとして受け取り、短い返信で受け付けを知らせます。作業と結果はアプリの会話に残ります [V]（tag-on-x）
  - 必要なもの: X アカウントを接続した Grok アカウント、同じアカウントでの Grok Bot、自分の Bot が1つ以上 [V]
  - 地域: オーストラリア・英国・EU・アイスランド・リヒテンシュタイン・ノルウェーのアカウントは対象外です。判定は X に登録された国です [V]
  - 動画・GIF を含む投稿、@grok も付いた投稿、自分で @bot を付けていない返信は受け付けられません [V]
  - 公開の投稿なので、非公開のリポジトリ名や内容は書きません。開発の依頼はアプリから出すのが無難です
- **Slack**: Team Bot は自分の Slack アプリを持て、Slack アカウントを Cursor にリンクした人にだけ答えます [V]（team-bots）

<!-- exercise id="d04-x-region" check="manual" -->
X の設定で、自分のアカウントに登録された国を確かめる。対象の国になっていれば完了。`npm run done -- d04-x-region` で完了にする。
<!-- /exercise -->

### 3. 返ってきた PR を自分で確かめる

Bot の報告をそのまま信じず、完了条件のコマンドを自分で実行します（A3 と同じ考え方）。

```bash
cd sample-app
gh pr checkout <PR の番号>   # PR のブランチを取ってきて切り替える
npm test
```

`gh pr checkout` は PR の番号・URL・ブランチ名を受け取ります [V]（gh_pr_checkout）。通ったら、PR の差分に頼んだ範囲の外のファイルが入っていないかも見ます。そのうえで、マージとデプロイを Bot に頼むか自分で行います。

<!-- exercise id="d04-verify" check="file-contains" path="notes/d04-grok-bot-tasks.md" pattern="^確認手順: .*(gh pr checkout|git (fetch|checkout|switch)).*npm test" -->
**課題**: 同じファイルの `確認手順:` の後ろに、受け取った PR を手元で確かめる手順を1行で書く（`gh pr checkout` などでブランチを取り、`npm test` を実行する）。
<!-- /exercise -->

## うまくいかないとき

| 症状 | 対処 |
|---|---|
| 「直しました」とだけ返ってくる | 依頼文に「実行したコマンドと出力を貼って」を足す |
| PR が出ずに main に入っている | D3 の AGENTS.md の `## Grok Bot` と、依頼文の「止まる場所」を確かめる |
| @bot が返事をしない | 地域、@grok との併記、動画・GIF、自分で @bot を付けたかを確かめる [V]（tag-on-x） |
| Team Bot が Slack で答えない | Slack アカウントを Cursor にリンクしたか確かめる [V]（team-bots） |

## 確認の記録

- 2026-10-29: Bot に別ブランチで D02 の変更を作らせ、PR（stland6338/ai-dev-tutor#2）を出してから、持ち主の承認後にマージとデプロイをした [R]
