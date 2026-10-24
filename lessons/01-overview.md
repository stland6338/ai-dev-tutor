---
id: 01-overview
title: 全体像をスライドで見る
track: intro
order: 1
as_of: 2026-10-25
applies_to: Claude Code 2.1.310 / Opus 5.5 / Grok Bot（2026-10 時点）
estimated_minutes: 10
deck: slides/01-overview.html
sources:
  - url: https://code.claude.com/docs/en/best-practices
    checked: 2026-10-24
  - url: https://code.claude.com/docs/en/goal
    checked: 2026-10-25
  - url: https://code.claude.com/docs/en/permission-modes
    checked: 2026-10-25
  - url: https://claude.dev/blog/claude-code-in-the-cloud/
    checked: 2026-10-24
  - url: https://code.claude.com/docs/en/desktop-scheduled-tasks
    checked: 2026-10-25
  - url: https://github.com/cursor/plugins/blob/main/pstack/README.md
    checked: 2026-10-24
history:
  - version: 2.1.139
    date: 2026-05-11
    advice: /goal で終了条件を決め、満たすまで Claude に作業を続けさせる
    status: current
    note: 詳しくは A3
  - version: 2.1.283
    advice: 起動時の権限モードの既定が auto mode になった
    status: current
    note: 詳しくは A6
---

## このスライドについて

この教材の章（A1〜A8 と D02）を全部取り入れると何ができるようになるかを、10枚のスライドにまとめました。各章を読む前の地図として、または読み終えたあとの振り返りとして使ってください。内容はすべて各章に書いたことで、根拠と確認の度合い（`[V]` など）は各章にあります。

- 操作: スライドを一度クリックしてから `←` `→`（または `Space`・`PageUp`・`PageDown`）、`1`〜`9`・`0` で番号へ移動。スライドの左端 1/4 をクリックすると前へ、それ以外をクリックすると次へ進みます
- 各スライドの下にある「関連する章」から、その章に移れます
- 明暗はこのサイトの切り替え（右上の ◐）に合わせて変わります

| # | スライド | 関連する章 |
|---|---|---|
| 1 | 表紙: この構成を全部取り入れると何ができるか | 00・A7 |
| 2 | 今とこれから: 毎回承認して見張る開発 → 目標を渡して任せる開発 | A3・A6・A7 |
| 3 | 全体の地図: A1〜A8 と D02 の役割 | 全章 |
| 4 | 任せられる: `/goal` と auto mode | A3・A6・D02 |
| 5 | 自分で確かめる: 検証の強制と証拠 | A3・A5・A7 |
| 6 | 安全に任せる: 権限モードと deny ルール | A6 |
| 7 | 並列とクラウド: worktree・cloud sessions・scheduled tasks | A7・A8 |
| 8 | Grok Bot ＋ pstack | D02 |
| 9 | 1日の流れの例（組み合わせの一例） | A2・A3・A7・A8・D02 |
| 10 | まとめ: 始めるための3ステップ | A3・A4・A6・A7・A8・D02 |

## 振り返り

- スライド9の1日の流れは、各章の仕組みを組み合わせた一例です。まずはスライド10の「1 確かめ方を渡す」から、自分のリポジトリで1つ試してください
- 次の A1 から、手元の Claude Code で順に手を動かします
