---
id: b01-pstack
title: pstack を公式推奨と比べて使う
track: pstack
order: 1
as_of: 2026-10-26
revised: 2026-10-29（pstack 0.15.36 の原則と README で確かめ直し、比較表の「人への確認」を「ほぼ同じ」に直した。「始める順」の行と B2 への案内を足した）
applies_to: Claude Code 2.1.310 / pstack 0.15.36
estimated_minutes: 30
sources:
  - url: https://github.com/cursor/plugins/blob/main/pstack/README.md
    checked: 2026-10-29
  - url: https://github.com/cursor/plugins/blob/main/pstack/skills/principle-never-block-on-the-human/SKILL.md
    checked: 2026-10-29
  - url: https://zenn.dev/sc30gsw/books/080faba713547b
    checked: 2026-10-29
  - url: https://github.com/cursor/plugins/tree/main/pstack/skills
    checked: 2026-10-26
  - url: https://github.com/cursor/plugins/blob/main/pstack/skills/setup-pstack/SKILL.md
    checked: 2026-10-26
  - url: https://github.com/cursor/plugins/blob/main/pstack/docs/guide/02-poteto-mode.md
    checked: 2026-10-24
  - url: https://github.com/cursor/plugins/pull/73
    checked: 2026-10-24
  - url: https://code.claude.com/docs/en/plugins/install
    checked: 2026-10-26
  - url: https://code.claude.com/docs/en/best-practices
    checked: 2026-10-24
announcements:
  - author: "@chenchengpro"
    date: 2026-10-22
    url: https://x.com/chenchengpro/status/2113243170788278767
    summary: （個人の投稿）pstack はスキル集ではなく方法論。検証スキルと feature map が先、並列化と自動マージは最後
    verified: false
history:
  - version: "PR #73"
    date: 2026-05-24
    advice: pstack が cursor/plugins にマージされ、Cursor と Claude Code で使えるようになった
    status: current
  - version: 0.15.32
    date: 2026-10-26
    advice: 既定のモデルの振り分けは、実装が Grok、難しい変更・文章・判断が Opus 5.5。/setup-pstack（Claude Code では /pstack:setup-pstack）で変えられる
    status: current
    note: 手元の版が古いと、ない skill がある（0.15.25 には /statechart などが無い）
---

## この章でできるようになること

- pstack が公式推奨のどこと同じで、どこが違うかを説明できる
- Claude Code に pstack を入れ、更新を止めずに使える
- 同じ課題を pstack と公式の流れで回して、違いを自分の目で確かめられる

## pstack とは

pstack は poteto（Lauren Tan 氏）が日常で使っているスキル群を、Cursor のプラグインとして公開したものです [V]。poteto 氏は Meta・Netflix・Cursor で働き、README（0.15.25）では React Compiler に携わる React コアチームのメンバーと紹介されています。2026 年 5 月 24 日（日本時間）に cursor/plugins へマージされました（PR #73）[V]。README の標語は「速く進みたいなら、まず深く（go deep first）」です。

中心は `/poteto-mode` です。依頼を読んで23のプレイブック（調査、バグ修正、性能改善、hillclimb など）から1つを選び、その手順を todo にして進めます [V]。原則（principle）の skill も多数入っていて、手順の途中で必要なものが読まれます。

## 公式推奨との比較

A1〜A9 で学んだ公式の推奨と比べると、次のようになります。

| 観点 | pstack | 公式推奨 | 判断 |
|---|---|---|---|
| 確かめる | prove-it-works（実物で確かめる） | 確かめる手段を渡すのが最も効く（A3） | 同じ |
| context | guard-the-context-window（大量の読み込みは subagent に） | context は最も限られた資源（A2・A5） | 同じ |
| 決まりを仕組みに | encode-lessons-in-structure（同じ指示を2回書いたら仕組みに） | 必ず守らせたいことは hook に（A4・A6） | 同じ |
| 書く量 | 少なく、質の高いコードを書く | 公式の「過剰な設計を避ける」指示 | 同じ |
| 計画 | 「計画は信じない。最良の仕様はコード」。ただし Cursor の plan mode とはよく合い、計画を作るなら `/poteto-mode` でも扱える（既定ではない）[V] | diff を1文で言えないなら計画する（A2） | 違う |
| 人への確認 | never-block-on-the-human。取り消せる作業（コードを書く・メモを直す・タスクを分ける）は聞かずに進めて、結果を見せる。force-push・本番データの削除・外部への送信は確認する [V] | 取り消せない操作の前では止まる（A6） | ほぼ同じ |
| 始める順 | 検証スキルと Feature Map が先。並列化と自動化は最後（B2） | 確かめる手段を先に渡す（A3） | 同じ |
| 道具 | Cursor 向け。Claude Code では名前を読み替えて動く | Claude Code の機能だけで完結する | 違う |
| モデル | 役割でモデルを分ける（実装は Grok、判断は Opus 5.5） | Anthropic のモデルだけが前提 | 違う |

確かめ方・context の守り方・決まりを仕組みにすること・人に確かめる境目は、公式とほぼ同じです。人への確認で違うのは、取り消せる作業を確かめずに進めてよいとする点だけです。はっきり違うのは「計画しない」で、これは poteto 氏の流儀です。A2・A3・A6 の土台を固めてから、選んで取り入れるのがよいと考えます。

> 以前の版のこの表では「人への確認」を「違う」としていました。原則の SKILL.md を読み直すと、取り消せない操作は確認すると書かれていたので直しました（2026-10-29）。

## Claude Code に入れる

Cursor では `/add-plugin pstack` で入ります。Claude Code では、先にマーケットプレイスを足してから入れます [V]（README）。

```text
/plugin marketplace add cursor/plugins
/plugin install pstack@cursor-plugins
```

- コマンドには plugin 名が付き、`/poteto-mode` は `/pstack:poteto-mode` になります [V]
- Anthropic の公式マーケットプレイスは既定で自動更新されますが、cursor-plugins のような第三者のマーケットプレイスは既定で自動更新されません [V]（plugins/install）。`/plugin` の Marketplaces タブで cursor-plugins を選び、Enable auto-update をオンにします。手で更新するときは `claude plugin update pstack@cursor-plugins` です
- 入れたあとは `/pstack:setup-pstack` で推論の予算と役割ごとのモデルを選びます。設定は新しいチャットから効きます

## よく使うスキル

0.15.32 の skills/ にあることを確かめた名前だけを載せています（2026-10-29 に 0.15.36 でも確かめ直した）[V]。表の名前は Cursor での呼び方で、Claude Code では先頭に `pstack:` が付きます（例: `/pstack:how`）。

| したいこと | スキル |
|---|---|
| 厳密に作業を進める | `/poteto-mode` |
| 使い方・どのスキルか迷う | `/poteto-help` |
| モデルと予算の設定 | `/setup-pstack` |
| 自分でアプリを動かして確かめさせる | `/create-verification-skill`・`/maintain-verification-skill`（B2） |
| 自分の作業の流儀を mode にする | `/automate-me` |
| コードの仕組みを知る | `/how`・`/why`・`/teach` |
| 差分を複数のモデルで問い詰める | `/interrogate` |
| 変更の影響範囲を確かめる | `/blast-radius` |
| 重い調査や並列作業を分ける | `/swarm`・`/arena` |
| 同じ失敗をくり返さない | `/correct`・`/reflect` |
| 形式検証（TLA+）の skill を作る | `/create-formal-verification-skill`・`/statechart` |
| 文章の AI らしさを抜く | `/unslop`（日本語は yomiyasu も） |

## ハンズオン

<!-- exercise id="b01-version" check="file-contains" path="notes/b01-pstack.md" pattern="^pstack のバージョン: 0\.15\.\d+" -->
pstack を入れ、シェルで `claude plugin list` を実行して、表示された pstack のバージョンを `notes/b01-pstack.md` の `pstack のバージョン:` の後ろに書く。0.15.36 より古ければ、上の手順で更新する。
<!-- /exercise -->

<!-- exercise id="b01-autoupdate" check="manual" -->
`/plugin` の Marketplaces タブで cursor-plugins の自動更新をオンにする。終えたら `npm run done -- b01-autoupdate` で完了にする。
<!-- /exercise -->

<!-- exercise id="b01-run" check="manual" -->
sample-app の新しい依頼（例: 「tasklog に `--due` の書式チェックを足す」）を `/pstack:poteto-mode` で回し、A2 の Explore → Plan → Implement → Commit で進めたときと比べる。どのプレイブックが選ばれ、計画を立てたか、何で確かめたかを見る。終えたら `npm run done -- b01-run` で完了にする。
<!-- /exercise -->

<!-- exercise id="b01-diff" check="file-contains" path="notes/b01-pstack.md" pattern="^公式と違う点: .{10,}" -->
`notes/b01-pstack.md` の `公式と違う点:` の後ろに、b01-run で見た公式の流れとの違いを1つ、自分の言葉で書く。取り入れるかどうかも添える。
<!-- /exercise -->

## つまずきやすい点

| 症状 | 対処 |
|---|---|
| ない skill がある | 手元の pstack が古い。`claude plugin update pstack@cursor-plugins` で更新する |
| モデルの設定が効かない | `/pstack:setup-pstack` の設定は新しいチャットから効く |
| 数ターンで mode が外れる | タスクごとに `/pstack:poteto-mode` を付け直す |
| 費用が高い | 予算を下げる、役割を `inherit-parent` にする、パネルを減らす（setup-pstack の SKILL.md） |
| 夜間に走らせても何も終わらない | 時間ではなく、合否が出る完了条件を渡す |

## 振り返り

- pstack の「確かめる」「context を守る」「仕組みにする」は、A3・A2・A6 と同じ考えです。取り消せる作業を確かめずに進めるやり方は、取り消せない操作の前で止まる守り（A6）があってこそ安全に使えます
- 次の B2 では、pstack が最初に作るよう勧める検証スキルと Feature Map を、sample-app に作ります
- そのあとのトラック C では、pstack も公式の流れも同じように動く環境（複数のエージェント・手元とクラウド）を整えます。そのあと D02 で、同じ考え方を Grok Bot で回します
