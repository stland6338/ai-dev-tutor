---
id: f01-prompting
title: 公式のプロンプトの書き方
track: prompt
order: 1
as_of: 2026-10-26
applies_to: Claude Code 2.1.310 / Opus 5.5
estimated_minutes: 25
sources:
  - url: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
    checked: 2026-10-24
  - url: https://docs.x.ai/developers/model-capabilities/text/best-practices
    checked: 2026-10-24
history:
  - version: 2026-10 時点
    advice: 明確に書き、理由を添え、3〜5個の例を <example> で示し、XML タグで構造を分ける
    status: current
  - version: 2026-10 時点
    advice: 新しいモデルは「迷ったら X」に過剰に従う。昔の「手を抜くな」のような強い言い回しは外す
    status: current
    note: 長い資料は先に、質問は最後に置くと品質が上がる（公式は最大30%）
---

## この章でできるようになること

- 公式の指針に沿って、あいまいなプロンプトを書き直せる
- 理由を書く・例を示す・XML タグで分けることが、なぜ効くかを説明できる
- 書き直す前と後を同じ入力で比べて、効果を確かめられる

CLAUDE.md（A4）、skill（A5）、クラウドに渡すチケット（A8）は、どれもプロンプトです。この章の書き方は、そのすべてに使えます。

## 公式の要点

Anthropic の prompting best practices（Opus 5.5・Sonnet 5.5・Haiku 5.5・Fable 5.1 が対象）から、要点を選びました [V]。

| 指針 | 中身 |
|---|---|
| 明確・直接に書く | 「文脈を知らない同僚が読んで迷うなら、Claude も迷う」（同僚テスト） |
| 理由を書く | 決まりだけでなく理由を添える。例: 「読み上げソフトで読むので、三点リーダーは使わない」 |
| 例を示す | 関係があり、種類の違う例を3〜5個、`<example>`・`<examples>` で囲む |
| XML タグで分ける | `<instructions>`・`<context>`・`<input>` のように、指示と資料と入力を分ける |
| 役割を1文で | system prompt に、何者として振る舞うかを1文で書く |
| 長い資料は先、質問は最後 | 2万トークンを超える資料は先頭に置き、質問を最後に置く。品質が最大30%上がると公式は書いている |

新しいモデルで気をつける点 [V]:

- 「迷ったら X を使う」のような書き方は、新しいモデルでは効きすぎる
- 昔のモデル向けの「絶対に手を抜くな」「必ず全部やれ」のような強い言い回しは外す。探しすぎるなら effort を下げる（A1）

xAI の指針は、推論するモデルに向けて「タスク・制約・出力の形式を直接書く」ことと、ほかのモデル向けのプロンプトは比べる前に調整し直すことを勧めています [V]。

## ハンズオン

workspace の `sample-app/prompts/release-note.md` は、リリースノートを書かせるためのあいまいなプロンプトです。

```text
git log を見てリリースノートを書いて。いい感じにまとめて、絶対に長くしないで。迷ったら全部載せて。
```

「いい感じに」「絶対に」「迷ったら全部」は、どれも公式が避けるよう勧める書き方です。

### 1. 書き直す

あとで比べるために、書き直す前の版を写しておきます。

```bash
cd ~/ai-dev-tutor-workspace/sample-app
cp prompts/release-note.md /tmp/old-prompt.md
```

自分で書き直しても、Claude に「公式の prompting best practices に沿って書き直して」と頼んでも構いません。

<!-- exercise id="f01-xml" check="file-contains" path="sample-app/prompts/release-note.md" pattern="<instructions>" -->
指示を `<instructions>` タグで囲み、何を・どの範囲で・どの形で書くかを明確にする。
<!-- /exercise -->

<!-- exercise id="f01-example" check="file-contains" path="sample-app/prompts/release-note.md" pattern="<example" -->
コミットとリリースノートの対応の例を `<example>` で示す。載せない例（chore: など）も1つ入れる。
<!-- /exercise -->

<!-- exercise id="f01-why" check="file-contains" path="sample-app/prompts/release-note.md" pattern="(ので|ため)" -->
決まりに理由を添える（例: 「利用者の使い方が変わらないので、chore: は載せない」）。
<!-- /exercise -->

### 2. 比べる

写しておいた前の版と書き直した版を、同じ入力で比べます。

```bash
claude -p "$(cat /tmp/old-prompt.md)" --allowedTools "Bash(git log *)"
claude -p "$(cat prompts/release-note.md)" --allowedTools "Bash(git log *)"
```

<!-- exercise id="f01-compare" check="manual" -->
書き直す前と後の出力を比べ、載せる項目の選び方・1項目の長さ・ぶれ方がどう変わったかを見る。終えたら `npm run done -- f01-compare` で完了にする。
<!-- /exercise -->

## 振り返り

- A4 の CLAUDE.md と A5 の skill も、この書き方で見直せます。特に「なぜその決まりがあるか」を書くと、Claude は決まりの外の場面でも判断を合わせられます
- 次の F2 では、プロンプトの外側、つまり context 全体の設計を扱います
