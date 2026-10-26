---
id: d09-duet
title: Claude Duet の観察メモ
track: grok
order: 9
as_of: 2026-10-26
applies_to: Claude Code 2.1.310
estimated_minutes: 5
sources:
  - url: https://claude.com/resources/articles/claude-duet
    checked: 2026-10-24
history:
  - version: research preview
    date: 2026-10-21
    advice: Claude Duet が発表された。専門職・小規模事業者向けの、先回りして動くエージェントのアプリ
    status: experimental
    note: waitlist、米国の Pro / Max のみ（2026-10-24 時点）
---

## この章について

最初に「今後出る Claude Duet で開発できる準備を整える」という目標を立てました。発表を確かめた結果、Claude Duet はコーディングの道具ではなかったので、この教材では観察メモの1章にとどめます。課題はありません。

## 分かっていること（2026-10-24 確認）

| 項目 | 中身 |
|---|---|
| 何か | 専門職や小規模事業者に向けた、先回りして動くエージェントのアプリ（research preview）[V] |
| できること | 朝のまとめ、つないだアプリの見張り、専用の VM とブラウザでの裏の作業 [V] |
| 承認 | メッセージの送信・支払い・署名・削除の前には承認を求める [V] |
| 提供 | waitlist。米国の Pro / Max のプランだけ。iOS・Android・claude.ai [V] |
| モデル | Opus 5.5 で動くと報道されている [U] |
| Claude Code との関係 | Claude Code の安全の仕組みと auto mode の分類モデルを使っている。Web アプリの試作はできるが、Claude Code の一部ではない [V] |

## この教材での扱い

- 開発環境を整える対象からは外します。コードを書いてリポジトリに入れる作業は、Claude Code（A・C）と Grok Bot（D02）で行います
- 観察する点は2つです。auto mode の分類モデル（A6）がコーディング以外でどう使われるか、送信や支払いの前に承認を求める設計が、Grok Bot（D02）の承認とどう違うか
- 日本で使えるようになったり、コーディングに関わる機能が出たりしたら、この章を見直します（A13 の追い方で）
