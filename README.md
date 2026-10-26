# ai-dev-tutor

Anthropic と xAI が推奨している AI エージェントとの開発のやり方を、vimtutor のように「読みながら手元を直して」学ぶ教材です。各章に「いつ・どのバージョンの時点の推奨か」と、公式の告知、推奨の年表が付いています。

[![学習の全体地図](assets/diagrams/roadmap.svg)](assets/diagrams/roadmap.svg)

## はじめ方

```bash
npm start          # ~/ai-dev-tutor-workspace に演習用の workspace を作る
npm run serve      # http://localhost:3250 でビューアを開く（任意）
npm run check      # 課題を判定し、進捗を progress.json に書く
npm run done -- <課題ID>   # 手動の課題を完了にする
```

最初の章は [lessons/00-intro.md](lessons/00-intro.md) です。

読むだけなら公開版でも読めます: https://ai-dev-tutor.stland6338.workers.dev （進捗は手元の `npm run check` でしか出ません）

## 収録状況（2026-10-26）

| トラック | 状態 |
|---|---|
| 0 はじめに（00 使い方・01 全体像のスライド） | 済 |
| A Claude Code 単体（A1〜A9） | 済 |
| B pstack（B1 公式推奨との比較） | 済 |
| C 環境（C1 複数エージェント・C2 ローカルとクラウド） | 済 |
| D Grok（Grok Build・Grok Bot） | D02 Grok Bot の環境は済。D01 Grok Build は予定。続きの D03〜 は [docs/prompts/grok-bot-lessons.md](docs/prompts/grok-bot-lessons.md) で Grok Bot に書かせる |
| E LLM アプリ / F プロンプト | 予定 |

## 開発

```bash
npm test
npm run self-test
```

章の書き方は [docs/lesson-format.md](docs/lesson-format.md)、調査の一次資料は [docs/research-2026-10-24.md](docs/research-2026-10-24.md) にあります。
