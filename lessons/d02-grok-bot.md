---
id: d02-grok-bot
title: Grok Bot の環境を整える
track: grok
order: 2
as_of: 2026-10-29
revised: 2026-10-29（4原則の対応表と最新の更新を足し、承認と安全の節を公式 changelog で確かめ直した。同日、コーディングを任せる形・ルーティンにする前の条件・マージの条件を pstack の公式ガイドに沿って足した）
applies_to: Grok Bot（2026-10 時点）
estimated_minutes: 25
sources:
  - url: https://x.ai/changelog/bot
    checked: 2026-10-29
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
  - url: https://github.com/cursor/plugins/blob/main/pstack/docs/guide/07-overnight.md
    checked: 2026-10-29
  - url: https://github.com/cursor/plugins/blob/main/pstack/skills/poteto-mode/playbooks/orchestrate.md
    checked: 2026-10-29
  - url: https://zenn.dev/sc30gsw/books/080faba713547b
    checked: 2026-10-29
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
| Bot | 名前付きのエージェント。会話と覚えたことは Bot ごとに分かれる | [V]（overview） |
| クラウドのコンピュータ | アカウントに1台。全 Bot がファイル・ブラウザのセッション・アプリのログインを共有する。画面は Bot ごとに別 | [V]（overview） |
| スキル | 一度通した手順を保存し、くり返し使う | [V]（skills-routines-and-automations） |
| ルーティン | スキルなどを時刻やイベントで動かす | [V]（同上） |
| Connect apps | アプリと、パッケージ化されたスキルを探して入れる | [V]（同上） |
| メモリ | 好み・役割・過去の作業の要約を Bot が覚える | [V]（overview） |

デバイスを閉じても、裏で動いているターンやルーティンは止まりません [V]。

## 4原則の対応表

Claude Code の章（A3〜A8）で使った仕組みを、Grok Bot ではどう実現するかの対応です。Grok Bot には hooks や `/goal` はありません。依頼文の書き方と、スキル・ルーティンで同じ効果を出します。

| 原則 | Claude Code | Grok Bot での実現 |
|---|---|---|
| 完了条件を渡す | `/goal`（A3） | 依頼文に、合否が出る完了条件を書く（下のセットアップ手順 7） |
| 確かめる | Stop hook・テスト（A3・A6） | 「実行したコマンドと出力を見せて」のように、確かめた証拠を返させる。確かめ方は検証スキルと Feature Map（B2）としてリポジトリに残し、依頼文でその名前を指定する |
| 定時に回す | scheduled tasks（A8） | ルーティン。自分のタイムゾーンの時刻で動き、間隔は5分以上 [V] |
| 並べる | worktree・並列セッション（A7） | pstack の `/swarm`（同じ仕事を手分け）と `/arena`（複数案を作って良い所を合わせる）。B1 を参照 |
| 方針を残す | `CLAUDE.md`（A4） | スキル（手順）とメモリ（好み・役割） [V] |

コードを変えるときは、Bot のコンピューターで GitHub CLI（`gh`）を使い、ブランチと PR で返してもらいます。main への push とデプロイは、自分が内容を見て承認してから頼みます。Cursor のクラウドエージェントに任せる方法もありますが、プランによっては使えません。

## コーディングを任せる形

| 形 | やり方 | 根拠 |
|---|---|---|
| Bot が自分で作業する | 共有のクラウドのコンピュータで clone し、`gh` でブランチと PR を返す | Bot のコンピュータにはターミナルがある [V]（overview） |
| Bot をまとめ役にする | Bot が Cursor の Cloud Agents を起動し、自分はその監督と結果の確認だけをする。コードを読む・コマンドを実行する細かいやり取りで、Bot の context を埋めずに済む | Grok Bot の docs には記載なし（2026-10-29 時点）。poteto 氏の講演を要約した書籍（kaito 氏、5章）と、Cursor フォーラムの報告による [U] |

まとめ役の形は、Cloud Agents がリポジトリごとに分かれた VM で動くので、Bot どうしで clone を取り合う問題（下の「承認と安全」）も起きにくくなります [U]。使えるかどうかは、自分のプランで Bot に「Cloud Agent を起動して」と頼んで確かめます。

## ルーティンにする前に

pstack の公式ガイド（07-overnight）は、人が見ていない間に作業を回す前に、次の4つがそろっているかを確かめるよう書いています [V]。

1. その仕事を一度自分でやったか、エージェントがやるのを見て、良い結果がどういうものか分かっている
2. エージェントに、自分が使うのと同じ道具（検証スキル・プロファイラ・ログ）がある
3. どの段も、確かめた証拠を出し、基準に届かなければ止められる
4. いくつかの記録を読み、くり返した失敗を道具・スキル・チェックに変えた

そろうまでは、自分が見ている間だけ動かします。任せるときの依頼には、確かめられる終了条件・隔離した worktree かクラウドのエージェント・朝に読み返す決定ログの3つを入れます [V]。

## マージの条件

pstack の Orchestrate のプレイブックは、PR ごとに書いた本人ではない検証役を、別のモデル系統で付け、その検証役が最新のコミットで合格を出したときだけマージする、としています [V]。Grok Bot と Claude Code を両方使うなら、Grok が書いた PR は Claude に、Claude が書いた PR は Grok に確かめさせる、という組み合わせにできます。この教材では、合格のあとにマージするのは自分、という決まりは変えません。

## セットアップ手順

1. **プランを確かめる**: Grok Bot は The X Subscription の Premium・Super・Ultra に含まれます。Plus と Free には含まれません。Grok・Cursor と週ごとの利用枠を共有します [V]（plans）
2. **（任意）ほかの AI の記憶を移す**: Settings の Import Memory で、ほかの AI アシスタントに覚えさせた好みや背景を、メインの Bot に取り込めます。Grok Bot 0.75.2 以降が必要です [V]（changelog v0.77.0）
3. **最初の Bot に仕事を1つ渡す**: デスクトップアプリを入れてサインインすると、「Grok Bot」という名前の Bot が最初から用意されています。最初のメッセージで、その Bot に役目を1つ渡します [V]（get-started）
4. **必要なアプリだけをつなぐ**: サイドバーの Connect apps から、使うアプリだけを入れます。外部に送る前には、Bot が下書きの承認を求めます [V]（overview）
5. **スキルを作る**: 一度やってみせた手順を、チャットで「今の手順を『週次の点検』というスキルとして保存して」と頼むか、Teach a task で手順を1回通して、Bot が作ったスキルの下書きを見直します。Teach a task は、Bot との1対1の会話で、コンピュータの画面を開いた状態で使い、記録できるのは最長10分です。判断の決まりと、承認が要る境目を下書きに足します [V]
6. **ルーティンにする**: 「平日の朝8時に『週次の点検』のスキルを実行して」のように、受け持つ Bot に頼みます。詳細タブから Test・Edit・Pause ができます。削除は取り消せません [V]
7. **合否が出る完了条件で頼む**: 「〜まで」と時間で区切るのではなく、「テストが通り、結果のスクリーンショットをページに載せたら完了」のように、確かめられる条件で頼みます（A3 と同じ考え方）

ルーティンの制限 [V]:

- 1つの Bot が持てるルーティンは50件まで
- 実行の間隔は5分以上
- 実行の記録は、ルーティンごとに直近の20件だけが残る

## 承認と安全

- **外への送信**: メールや Slack を Bot に任せると、下書きのカードが出て、Send を押したときに送られます。自分の言葉で「送って」と頼んだ送信は、Auto-review（自動の安全確認）が通せばそのまま送られます。ルーティンなど、自分が頼んでいないターンからの送信は下書きのまま待ちます [V]（changelog v0.75.5）。下書きカードの Disable drafts を押すと、その Bot は下書きなしで送るようになるので、押す前によく考えます [V]
- **承認カード**: 取り消せない操作の前には承認カードが出ます。開いている時間は30分です（v0.77.0 で10分から延長） [V]。断ると、Bot は次に自分がメッセージを送るまで同じ操作をくり返しません [V]
- **パスワードとカード**: チャットに貼らず、Settings → Vault に保存するか、1Password をつなぎます（次の節） [V]
- **アプリの接続**: 使うアプリだけをつなぎます。最初は読むだけの仕事から任せ、送信や書き込みは慣れてから広げます
- **デプロイと push**: 内容を見て、自分が承認してから頼みます。頼むときの文にも「push とデプロイは私が承認してから」と書いておきます
- **共有のコンピュータ**: アカウントに1台で、全 Bot がファイル・ブラウザのセッション・アプリのログインを共有します [V]。1つの Bot に入れたログインは他の Bot からも使えるので、入れるログインを絞ります
- **同じ clone を同時に触らない**: 複数の Bot が同じフォルダの同じブランチで作業すると、片方の未 push のコミットと、もう片方の push が食い違います。この教材を作る途中でも、実際に起きました。作業ごとに別の clone か別のブランチを使うよう、依頼文に書きます
- **今の情報で判断させる**: 大事な判断は、覚えたことではなく今の情報源を確かめるよう Bot に頼みます [V]（overview の勧め）

## 最新の更新（2026-10）

公式 changelog（x.ai/changelog/bot）で 2026 年 10 月 29 日に確かめた内容です。最新版は v0.77.0（2026-10-26）でした。

| 日付 | 更新 | 内容 |
|---|---|---|
| 2026-10-22（v0.75.2） | Pages | Bot がレポートやダッシュボードを「ページ」として作り、頼むたびに更新します。新しいページは共有するまで自分だけが見られます [V] |
| 2026-10-23（v0.75.5） | Vault | Settings → Vault にログイン・カード・連絡先を保存すると、Bot がサインインや購入のフォームに入れます。チャットに貼る必要はありません [V] |
| 2026-10-26（v0.77.0） | 1Password | 共有の保管庫なしでつながります。ログインのたびに 1Password で承認すると 1Password が入力し、Bot はパスワードを見ません。Grok Bot 0.68.0 以降が必要です [V]。1Password アプリ側は 8.12.42 以降が必要です（アプリ内のお知らせ） |
| 2026-10-26（v0.77.0） | Import Memory | Settings から、ほかの AI アシスタントの好みと背景をメインの Bot に取り込めます [V] |
| 2026-10-26（v0.77.0） | Vault の Payments タブ | Bot が最初に使う支払い方法を選べます。購入は毎回承認が要ります [V] |
| 2026-10-26（v0.77.0） | Pages の削除 | ページの持ち主は Library からページを削除できます。共有した相手からも消えます [V] |
| 2026-10-26（v0.77.0） | 質問カード | Bot が複数の質問を1枚のカードで順に聞けます。選択肢に合わないときは自分の答えを書けます [V] |
| 2026-10-26（v0.77.0） | 権限の設定 | Settings に Permissions の節ができ、Auto-review のルールを Always Ask と Allow without Asking に分けて追加できます [V] |

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
