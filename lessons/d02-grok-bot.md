---
id: d02-grok-bot
title: Grok Bot の環境を整える
track: grok
order: 2
as_of: 2026-10-26
revised: 2026-10-26（Grok Bot の公式 docs で手順を確かめ直し、pstack の節を B1 に移した）
applies_to: Grok Bot（2026-10 時点）
estimated_minutes: 25
sources:
  - url: https://docs.x.ai/grok-bot/overview
    checked: 2026-10-26
  - url: https://docs.x.ai/grok-bot/skills-routines-and-automations
    checked: 2026-10-26
  - url: https://docs.x.ai/grok-bot/get-started
    checked: 2026-10-24
  - url: https://cursor.com/help/grok-bot/plans
    checked: 2026-10-26
  - url: https://cursor.com/help/grok-bot/pages
    checked: 2026-10-25
announcements:
  - author: "@poteto"
    date: 2026-10-23
    url: https://x.com/poteto/status/2113426421075050909
    summary: Grok Bot チームは驚異的なペースで出荷している、フィードバックを送ってほしい
    verified: false
  - author: "@RayBuckton"
    date: 2026-10-24
    url: https://x.com/RayBuckton/status/2113955294661218806
    summary: （個人の投稿）Grok Bot に pstack を入れるのがよい
    verified: false
history:
  - version: beta
    date: 2026-08-11
    advice: Grok Bot がベータで公開された。名前付きの Bot が、アカウントごとに1台のクラウドのコンピュータで動く
    status: current
    note: 公開日は報道による [U]
  - version: 2026-10
    date: 2026-10-18
    advice: Grok Bot は The X Subscription の Premium・Super・Ultra に含まれる。Grok・Cursor と週ごとの利用枠を共有する
    status: current
  - version: 2026-10
    date: 2026-10-21
    advice: Pages（Bot が作って更新し続けるレポートやダッシュボード）の段階的な提供が始まった
    status: current
---

## この章でやること

Grok Bot に仕事を任せられるように、Bot・スキル・ルーティン・アプリの接続を整えます。手順の根拠は Grok Bot の公式 docs（docs.x.ai/grok-bot）と Cursor のヘルプで、2026 年 10 月 26 日に確かめました。frontmatter の X 投稿のうち @poteto 以外は個人の投稿で、手順の根拠には使っていません。

pstack の入れ方と使い方は B1 にまとめました。この章の最後に、Grok Bot で pstack を使うときに分かっていることと、分かっていないことを書いています。

## 全体像

| 要素 | 役割 | 根拠 |
|---|---|---|
| Bot | 名前付きのエージェント。会話・覚えたこと・好みは Bot ごとに分かれる | [V]（overview） |
| クラウドのコンピュータ | アカウントに1台。全 Bot がファイル・ブラウザのセッション・アプリのログインを共有する。画面は Bot ごとに別 | [V]（overview） |
| スキル | 一度通した手順を保存し、くり返し使う | [V]（skills-routines-and-automations） |
| ルーティン | スキルなどを時刻やイベントで動かす | [V]（同上） |
| Connect apps | アプリと、パッケージ化されたスキルを探して入れる | [V]（同上） |
| メモリ | 好み・役割・過去の作業の要約を Bot が覚える | [V]（overview） |

デバイスを閉じても、裏で動いているターンやルーティンは止まりません [V]。

## セットアップ手順

1. **プランを確かめる**: Grok Bot は The X Subscription の Premium・Super・Ultra に含まれます。Plus と Free には含まれません。Grok・Cursor と週ごとの利用枠を共有します [V]（plans）
2. **Bot を作って仕事を1つ渡す**: アプリにサインインし、Bot を作って役目を1つ決めます [V]（get-started）
3. **必要なアプリだけをつなぐ**: サイドバーの Connect apps から、使うアプリだけを入れます。外部への送信は、承認した下書きだけが送られます [V]（overview）
4. **スキルを作る**: 一度やってみせた手順を、チャットで「今の手順を『週次の点検』というスキルとして保存して」と頼むか、Teach a task で手順を1回通して、Bot が作ったスキルの下書きを見直します。判断の決まりと、承認が要る境目を下書きに足します [V]
5. **ルーティンにする**: 「平日の朝8時に『週次の点検』のスキルを実行して」のように、受け持つ Bot に頼みます。詳細タブから Test・Edit・Pause ができます。削除は取り消せません [V]
6. **合否が出る完了条件で頼む**: 「〜まで」と時間で区切るのではなく、「テストが通り、結果のスクリーンショットをページに載せたら完了」のように、確かめられる条件で頼みます（A3 と同じ考え方）

ルーティンの制限 [V]:

- 1つの Bot が持てるルーティンは50件まで
- 実行の間隔は5分以上
- 実行の記録は、ルーティンごとに直近の20件だけが残る

## 承認と安全

- 送信・投稿のような外に出る操作は、承認した下書きだけが送られます。承認が要るときは Bot が戻ってきて知らせます [V]（overview）
- 共有のコンピュータは全 Bot で使うので、1つの Bot に入れたログインは他の Bot からも使えます [V]。Bot を増やす前に、どのログインを入れているかを見直します
- 大事な判断は、覚えたことではなく今の情報源を確かめるよう Bot に頼みます [V]（overview の勧め）

## Pages・Vault・1Password（2026-10 の更新）

- **Pages**（2026-10-21〜、段階的に提供）: Bot がレポートやダッシュボードを「ページ」として作り、頼むたびに更新します。新しいページは共有するまで自分だけが見られます。Enterprise のチームではまだ使えません [V]（pages）
- **Vault**（2026-10-22）: Settings → Vault にカード・ログイン・連絡先を保存すると、Bot がチャットに貼らせずにフォームへ入れられます（アプリ内のお知らせ。公開ヘルプは未確認 [U]）
- **1Password**（2026-10-22〜、段階的に提供）: Connect apps から 1Password をつなぐと、ログインのたびに 1Password アプリで承認し、1Password が入力します。Bot はパスワードを見ません。1Password アプリ 8.12.42 以降が必要です（アプリ内のお知らせ。公開ヘルプは未確認 [U]）

## Grok Bot で pstack を使う

- pstack は Cursor のプラグインです（入れ方は B1）。Grok Bot の docs は、外部のスキルを Connect apps の「パッケージ化されたスキル」として入れると書いていますが、pstack をその形で入れられるかは書いていません [U]
- 「Grok Bot に pstack を入れるとよい」という投稿はありますが、個人の投稿です
- 入れられた場合も、考え方は B1 と同じです。検証の手段を先に用意し、合否が出る完了条件で頼みます

## ハンズオン

Grok Bot はクラウドで動くので、手元のファイルで判定できる課題は notes のワークシートだけです。アプリでの操作は manual の課題にしています。

<!-- exercise id="d02-condition" check="file-contains" path="notes/d02-grok-bot.md" pattern="^完了条件: .{10,}" -->
`notes/d02-grok-bot.md` の `完了条件:` の後ろに、Grok Bot に頼みたい仕事を1つ選び、合否が出る形の完了条件を書く（時間で区切らない）。
<!-- /exercise -->

<!-- exercise id="d02-approval" check="file-contains" path="notes/d02-grok-bot.md" pattern="^承認が要る操作: .{5,}" -->
同じファイルの `承認が要る操作:` の後ろに、その仕事の中で、Bot に承認を求めさせたい操作を1つ書く。
<!-- /exercise -->

<!-- exercise id="d02-skill" check="manual" -->
Teach a task（またはチャットでの依頼）でスキルを1つ作り、下書きに判断の決まりと承認の境目を足す。終えたら `npm run done -- d02-skill` で完了にする。
<!-- /exercise -->

<!-- exercise id="d02-routine" check="manual" -->
作ったスキルをルーティンにし、詳細タブで Test を1回実行してから Pause する。終えたら `npm run done -- d02-routine` で完了にする。
<!-- /exercise -->

## つまずきやすい点

| 症状 | 対処 |
|---|---|
| スキルが `/` メニューに出ない | Connect apps で接続数を選び、Private skills で有効にする [V] |
| ルーティンが短い間隔で作れない | 間隔は5分以上 [V] |
| 夜間に動かしても何も終わらない | 時間ではなく、合否が出る完了条件を渡す |
| ログインが他の Bot にも見えている | 共有のコンピュータは全 Bot で共有される [V]。入れるログインを絞る |
