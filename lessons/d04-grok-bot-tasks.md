---
id: d04-grok-bot-tasks
title: Grok Bot に開発タスクを頼む
track: grok
order: 4
as_of: 2026-10-26
applies_to: "Grok Bot beta（2026-10 時点）"
estimated_minutes: 20
sources:
  - url: https://docs.x.ai/grok-bot/overview
    checked: 2026-10-26
  - url: https://docs.x.ai/grok-bot/tag-on-x
    checked: 2026-10-26
  - url: https://docs.x.ai/grok-bot/files-and-results
    checked: 2026-10-26
  - url: https://docs.x.ai/grok-bot/team-bots
    checked: 2026-10-26
  - url: https://docs.x.ai/grok-bot/chat-and-collaboration
    checked: 2026-10-26
  - url: https://cursor.com/docs/cloud-agent
    checked: 2026-10-26
  - url: https://x.ai/news/grok-bot-and-x
    checked: 2026-10-26
announcements:
  - author: "@cursor_ai"
    date: 2026-10-12
    url: https://x.com/cursor_ai/status/2109783879490191502
    summary: Cursor が The X Subscription に入り、Premium・Super・Ultra に Grok Bot が含まれる（転載サイトで読んだ）
    verified: false
history:
  - version: beta
    date: 2026-08-11
    advice: アプリ（デスクトップ・モバイル）で Bot に頼み、承認が要るときに Bot が戻ってくる
    status: current
  - version: 2026-10
    date: 2026-10-26
    advice: X で @bot をタグ付けしても頼める。日本のアカウントは対象。EU・英国・豪州などは対象外
    status: current
    note: @bot の提供開始日は公式資料に記載なし
---

## この章でできるようになること

Grok Bot に開発タスクを、合否が出る形で頼めるようになります。アプリ・X の @bot・Slack のどこから頼めるかと、Cloud Agent の結果を受け取って確かめる手順を押さえます。

## Claude Code との違い

| 観点 | Claude Code | Grok Bot |
|---|---|---|
| 頼む場所 | 端末のセッション | デスクトップ・モバイルのアプリ、X の @bot、Team Bot なら Slack [V] |
| 頼んだ後 | 端末で見守る | 端末を閉じても続く。承認が要るときに Bot が戻ってくる [V]（overview） |
| 結果 | 手元の差分 | Cloud Agent の最終報告に出てきた画像・動画などのファイルを Bot が自分のコンピュータに写し、返信に添える [V]（files-and-results） |
| Cloud Agent の起動場所 | — | Cursor の Web・デスクトップ・Slack の @cursor・GitHub の `@cursor` コメントなどからも起動できる [V]（cloud-agent） |

## 手順

### 1. 合否が出る依頼文を書く

公式の「最初の依頼」の例は、何をするか・どこで作業するか・どの情報を使うか・終わった状態が何か、を1つの依頼に入れています [V]（overview）。開発タスクでも同じ形にします。Cloud Agent の保存済みの環境を使わせたいときに、環境の名前を依頼文に書くとよいかは、公式 docs には記載がありません（2026-10-26 時点）[U]。

<!-- exercise id="d04-request" check="file-contains" path="notes/d04-grok-bot-tasks.md" pattern="^依頼文: .{20,}" -->
**課題**: `notes/d04-grok-bot-tasks.md` の `依頼文:` の後ろに、sample-app への開発タスクの依頼文を1行で書く（何を・どのリポジトリで・何を見て）。
<!-- /exercise -->

<!-- exercise id="d04-done-when" check="file-contains" path="notes/d04-grok-bot-tasks.md" pattern="^完了条件: .*npm test" -->
**課題**: 同じファイルの `完了条件:` の後ろに、`npm test` を含む、合否が出る完了条件を書く。
<!-- /exercise -->

### 2. どこから頼むか

- **アプリ**: 文字・音声入力・音声チャットで Bot に頼めます [V]（overview）
- **X の @bot**: 投稿や返信で @bot をタグ付けすると、メインの Bot がその投稿をタスクとして受け取り、@bot が短い返信で受け付けを知らせます。作業と結果はアプリの会話に残り、X に出るのは受け付けの返信だけです [V]（tag-on-x）
  - 必要なもの: X アカウントを接続した Grok アカウント、同じアカウントでの Grok Bot、自分の Bot が1つ以上 [V]
  - 地域: オーストラリア・英国・EU・アイスランド・リヒテンシュタイン・ノルウェーのアカウントは対象外です。判定は X に登録された国で、今いる場所や VPN は関係しません。日本のアカウントは除外の一覧に入っていません [V]。「South Asia」のように広い地域しか登録されていない場合や、国が登録されていない場合も使えません [V]
  - 動画・GIF を含む投稿、@grok も付いた投稿、自分で @bot を付けていない返信は受け付けられません [V]
  - タグ付けした依頼は自動で始まり、Grok Bot の利用枠を使います [V]。公開の投稿なので、非公開のリポジトリ名や内容は書かないようにします [U]
- **Slack**: Team Bot は自分の Slack アプリを持てます。DM か @メンションで頼み、Slack アカウントを Cursor にリンクした人にだけ答えます [V]（team-bots）。Cloud Agent は Slack の @cursor からも直接起動できます [V]（cloud-agent）。個人の Bot に Slack から頼めるかは、公式資料に記載なし（2026-10-26 時点）

<!-- exercise id="d04-x-region" check="manual" -->
X の設定で、自分のアカウントに登録された国を確かめる。国が日本など対象の国になっていれば完了。`npm run done -- d04-x-region` で完了にする。
<!-- /exercise -->

### 3. 結果を受け取って確かめる

- Cloud Agent が終わると、Bot は最終報告で挙げられたファイルを返信に添えます。デスクトップアプリでは会話の Cloud Agent のカードにも同じファイルが出ます [V]（files-and-results）
- Cloud Agent は別のブランチで作業して push します [V]。PR を開けます [V]（cloud-agent）
- 報告をそのまま信じず、手元でブランチを取ってきて、完了条件のコマンドを自分で実行します（A3 と同じ考え方）。Bot の作業中の表示には「AGENTS.md を読んだ」「テストを実行した」のような段階が出ますが [V]（x.ai/news/designing-grok-bot）、それは合否の代わりにはなりません

<!-- exercise id="d04-verify" check="file-contains" path="notes/d04-grok-bot-tasks.md" pattern="^確認手順: .*git (fetch|checkout|switch).*npm test" -->
**課題**: 同じファイルの `確認手順:` の後ろに、受け取ったブランチを手元で確かめる手順を1行で書く（`git fetch` などでブランチを取り、`npm test` を実行する）。
<!-- /exercise -->

## うまくいかないとき

| 症状 | 対処 |
|---|---|
| @bot が返事をしない | 地域、@grok との併記、動画・GIF、自分で @bot を付けたか、利用枠を確かめる [V]（tag-on-x） |
| @bot が「Sign up for Grok Bot」と返す | X アカウントが Grok アカウントにつながっていない。grok.com の Settings → Account で接続する [V] |
| @bot が「Grok Bot isn't set up yet」と返す | 自分の Bot が無い。アプリで Bot を作る [V] |
| Team Bot が Slack で答えない | Slack アカウントを Cursor にリンクしたか確かめる [V]（team-bots） |

## 確認の記録

なし（Cloud Agent の起動と PR の作成は実行していない。執筆者のプランでは Cursor Cloud Agent を起動できないため）
