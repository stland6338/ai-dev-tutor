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

この教材の章（A1〜A9・B1・C1・C2・D02）を全部取り入れると何ができるようになるかを、20枚のスライドにまとめました。A9（MCP）・B1（pstack）・C1・C2（環境）は13〜16枚目です。A10〜A13 と F（プロンプト・context）はスライドに入れていないので、各章で読んでください。各スライドは「伝えたいこと1つを短い1文で言い、図を1つ添える」形にしています（高橋メソッドや Presentation Zen の「1枚に1つのメッセージ」を参考にしました）。各章を読む前の地図として、または読み終えたあとの振り返りとして使ってください。内容はすべて各章に書いたことで、根拠と確認の度合い（`[V]` など）は各章にあります。

- 操作: スライドを一度クリックしてから `←` `→`（または `Space`・`PageUp`・`PageDown`）、`1`〜`9`・`0` で1〜10枚目へ移動。スライドの左端 1/4 をクリックすると前へ、それ以外をクリックすると次へ進みます
- `N` で話者メモ（そのスライドの詳しい説明）を出し入れできます
- 各スライドの下にある「関連する章」から、その章に移れます
- 明暗はこのサイトの切り替え（右上の ◐）に合わせて変わります

| # | スライドの1文 | 関連する章 |
|---|---|---|
| 1 | 目標と確かめ方を渡せば、エージェントが開発を進める。 | 00 |
| 2 | Claude Code のコードは、約9割を Claude が書いている。 | A7 |
| 3 | 見張る開発から、任せる開発へ。 | A3・A6・A7 |
| 4 | 任せる構成は、3つの層でできている。 | 全章 |
| 5 | 時間ではなく、完了条件を渡す。 | A3・D02 |
| 6 | 条件を満たすまで、エージェントに続けさせる。 | A3 |
| 7 | いちばん効くのは、確かめる手段を渡すこと。 | A3・A4 |
| 8 | 注意に頼らず、仕組みで確かめさせる。 | A3・A5・A7 |
| 9 | auto mode は、危険な操作だけを止める。 | A6 |
| 10 | 止めたい操作は、仕組みを重ねて止める。 | A6 |
| 11 | 1つを信頼できてから、並べて任せる。 | A3・A6・A7 |
| 12 | 手元で並べ、クラウドに渡し、時刻で動かす。 | A7・A8 |
| 13 | 外部のツールは、必要なものだけ MCP でつなぐ。 | A9・A10 |
| 14 | pstack は、公式と同じ土台に流儀を足す。 | B1 |
| 15 | 共通の指示は、AGENTS.md に1つだけ。 | C1 |
| 16 | クラウドに届くのは、リポジトリに入れたものだけ。 | C2・A8 |
| 17 | Grok Bot と pstack でも、同じ考え方を回す。 | D02 |
| 18 | 人の時間は、承認からレビューと判断へ。 | A7 |
| 19 | 朝に渡し、昼に見て、夜は直させる。（組み合わせの一例） | A2・A3・A7・A8・D02 |
| 20 | まずは、確かめ方を渡すことから。 | 00・A1・A3・A6・A8 |

## 振り返り

- スライド19の1日の流れは、各章の仕組みを組み合わせた一例です。まずはスライド20の「1 確かめる」から、自分のリポジトリで1つ試してください
- 次の A1 から、手元の Claude Code で順に手を動かします
