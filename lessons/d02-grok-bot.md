---
id: d02-grok-bot
title: Grok Bot の環境を整える（pstack 対応）
track: grok
order: 2
as_of: 2026-10-24
applies_to: Grok Bot（2026-10 時点） / pstack
estimated_minutes: 20
sources:
  - url: https://github.com/cursor/plugins/blob/main/pstack/README.md
    checked: 2026-10-24
  - url: https://github.com/cursor/plugins/blob/main/pstack/docs/guide/02-poteto-mode.md
    checked: 2026-10-24
  - url: https://github.com/cursor/plugins/pull/73
    checked: 2026-10-24
  - url: https://cursor.com/marketplace/cursor/pstack
    checked: 2026-10-24
announcements:
  - author: "@poteto"
    date: 2026-10-23
    url: https://x.com/poteto/status/2113426421075050909
    summary: Grok Bot チームは驚異的なペースで出荷している、フィードバックを送ってほしい
    verified: false
  - author: "@chenchengpro"
    date: 2026-10-22
    url: https://x.com/chenchengpro/status/2113243170788278767
    summary: pstack はスキル集ではなく方法論。検証スキルと feature map が先、並列化と自動マージは最後
    verified: false
  - author: "@RayBuckton"
    date: 2026-10-24
    url: https://x.com/RayBuckton/status/2113955294661218806
    summary: Grok Bot に pstack を入れるのがよい
    verified: false
---

## この章でやること

Grok Bot を、スキル・ルーティン・コネクタ・メモリ・サブエージェントで整え、poteto 氏の pstack で自律開発の質を上げる手順をまとめます。情報は 2026 年 10 月 24 日時点のものです。

## 全体像

Grok Bot は1台の共有 Linux マシン（box）を持ち、スキルで手順を覚え、ルーティンで定期実行し、コネクタで外部サービスに触れ、メモリで好みを保持します。コード作業は pstack の `/poteto-mode` に乗せると、検証まで含めた流れになります。

| 要素 | 役割 | 最初にやること |
|---|---|---|
| スキル | 繰り返す手順の保存 | pstack を入れ、自分用スキルを1つ作る |
| ルーティン | 定期・イベント駆動の実行 | 毎朝の点検や通知を1つ登録 |
| コネクタ | Gmail・X・GitHub などへの接続 | 使うサービスだけ接続・認証 |
| メモリ | 好み・方針の保持 | コーディング方針や口調を伝える |
| サブエージェント | 調査・実装の並列化 | `poteto-agent` や executor に任せる |

## セットアップ手順

1. **pstack を入れる**: チャットで「pstack をインストールして」と頼む。Cursor では `/add-plugin pstack`。
2. **モデルと予算を決める**: `/setup-pstack` で推論予算と役割ごとのモデルを選ぶ。設定は新しいチャットから効く。
3. **検証スキルを作る**: `/create-verification-skill` で、エージェントがアプリを自分で動かして確かめられるようにする。
4. **コネクタをつなぐ**: `add-connector` スキルで GitHub・Gmail・X などを必要な分だけ接続する。
5. **方針をメモリとスキルに残す**: 共通のコーディング方針はスキルにする（例: `coding-guidelines`）。`/automate-me` で自分の作業スタイルを mode スキルにできる。
6. **ルーティンを登録する**: 「毎朝9時に〜を確認して」と頼むと `routines` スキルで定期実行になる。
7. **実タスクで回す**: `/poteto-mode` + 目標 + 合否判定できる完了条件、の形で依頼する。

## 構成要素ごとの整え方

### スキル

同じ指示を2回書いたらスキルにする、が目安です。作成・修正は `skill-authoring`、作業後の学びの反映は `/reflect`、同じ失敗の再発防止は `/correct` を使います。

### ルーティン

ダイジェスト、監視、「〜になったら教えて」はルーティンにします。報告先と止め方を最初に決めておくと運用が楽です。

### コネクタ

外部への送信・投稿・購入などは毎回ユーザーの承認が必要です。読み取り中心で始め、書き込みは明示的に頼む運用が安全です。

### メモリと box

box のファイル・インストール済みツール・ブラウザのログインは全エージェントで共有されます。デスクトップ（画面）はエージェントごとに別です。

### サブエージェント

重い調査や並列作業は `/swarm` や `/arena` で分けます。並列で同じファイルを触る場合は worktree かクラウドエージェントに分離します。

## pstack と poteto 氏の最新情報

poteto（Lauren Tan 氏）は Meta・Netflix・Cursor で働き、React Compiler に携わる React コアチームのメンバーです。pstack は本人が日常で使うスキル群を Cursor プラグインとして公開したもので、2026 年 5 月 24 日（日本時間）に cursor/plugins へマージされました（PR #73）。README の標語は「go fast するなら、まず go deep」です。

1. `/poteto-mode` は23のプレイブック（調査、バグ修正、性能、hillclimb など）から1つを選び、手順を todo にして実行する。
2. 既定では実装系は Grok、難しい変更・文章・判断は Opus 5.5 に振り分ける。`/setup-pstack` で変えられる。
3. Claude Code でも `/plugin install pstack@cursor-plugins` で入り、コマンドは `/pstack:poteto-mode` になる。
4. TLA+ による形式検証スキル（`/create-formal-verification-skill`、`/statechart`）が X 上で注目されている。
5. poteto 氏は X 上で Grok Bot チームの出荷ペースに触れ、フィードバックを募っている（2026-10-23）。

## よく使う pstack スキル

| したいこと | スキル |
|---|---|
| 厳密に作業を進める | `/poteto-mode` |
| 使い方・どのスキルか迷う | `/poteto-help` |
| モデルと予算の設定 | `/setup-pstack` |
| コードの仕組みを知る | `/how`・`/why`・`/teach` |
| 差分を多モデルで叩く | `/interrogate` |
| 変更の影響範囲を確認 | `/blast-radius` |
| 文章の AI 臭さを抜く | `/unslop`（日本語は `yomiyasu` も） |
| ボタン付きページから Bot を起動 | `/make-bot-ui` |

## つまずきやすい点

| 症状 | 対処 |
|---|---|
| モデル設定が効かない | `/setup-pstack` の設定は新しいチャットから適用 |
| 数ターンで mode が外れる | タスクごとに `/poteto-mode` を付け直す |
| コストが高い | 予算を下げる、役割を `inherit-parent` にする、パネルを減らす |
| 夜間実行が何も終えない | 時間ではなく合否判定できる完了条件を渡す |
| ビルド成功だけで完了報告 | 実コマンド・実データでの確認を求める（prove-it-works） |
