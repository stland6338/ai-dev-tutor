---
id: 00-intro
title: この教材の使い方
track: intro
order: 0
as_of: 2026-10-24
applies_to: Claude Code 2.1.310
estimated_minutes: 10
sources:
  - url: https://code.claude.com/docs/en/best-practices
    checked: 2026-10-24
---

## この教材は何か

Anthropic と xAI が今推奨している、AI エージェントとの開発のやり方を、手を動かして身につける教材です。vimtutor のように、読みながら手元のファイルを直していき、`npm run check` で合否を確かめます。

| トラック | 内容 |
|---|---|
| A Claude Code 単体 | 公式「Claude Code 101」の順に、基本から並列・クラウドまで |
| B pstack | 公式推奨と比べて、どこが同じでどこが違うか |
| C 環境 | 1つのリポジトリを複数のエージェントで使う準備、ローカルとクラウドの使い分け |
| D Grok | Grok Build と Grok Bot |
| E・F | LLM アプリの作り方、プロンプトとコンテキストの設計 |

## 「いつの時点の推奨か」を必ず見る

AI 開発ツールの推奨は数か月で変わります。たとえば 2025 年 3 月には「think harder と書くと深く考える」が推奨でしたが、今は `ultrathink` 以外の言葉は効かず、effort の設定が主な調整手段です。

そこで各章には次の3つを付けています。

- 本文の上の帯: 何年何月何日に、どのバージョンで確かめた推奨か（`as_of` と `applies_to`）
- 本文の横: 公式の告知。X の投稿や公式ブログで、その章の内容に触れたもの。原文を直接確かめられなかったものには「未確認」の札が付きます
- 章末: 推奨の年表。バージョンごとに何が推奨され、今も有効か（継続・置換・実験）

`npm run check` は、手元の `claude --version` が教材のバージョンより新しいと「推奨が変わっている可能性があります」と知らせます。そのときは帯にある公式ページを開いて、差分を確かめてください。

## 進め方

1. workspace を作る

   Claude Code が教材の CLAUDE.md を読まないように、workspace は教材フォルダの外に作ります。

   ```bash
   npm start
   ```

   既定の場所は `~/ai-dev-tutor-workspace` です。変えたいときは `TUTOR_WORKSPACE=~/somewhere npm start` のように指定し、`npm run check` にも同じ変数を付けます。

2. ビューアを開く（任意）

   ```bash
   npm run serve
   ```

   http://localhost:3250 を開きます。このファイルをエディタで直接読んでも構いません。

3. 各章の課題を workspace で行い、判定する

   ```bash
   npm run check
   npm run check -- --lesson a03   # 1章だけ
   ```

4. 機械で判定できない課題（manual）は、終えたら自分で完了にする

   ```bash
   npm run done -- a01-powerup
   ```

課題は自分で書いても、Claude Code に頼んでも構いません。**Claude Code に頼むこと自体が演習**です。ただし頼んだ場合も、結果を自分の目で確かめてから次へ進んでください。

## 最初の課題

<!-- exercise id="00-ready" check="file-contains" path="notes/00-intro.md" pattern="^準備OK: \[x\]" -->
workspace の `notes/00-intro.md` を開き、`準備OK: [ ]` を `準備OK: [x]` に書き換える。
<!-- /exercise -->

<!-- exercise id="00-path" check="file-contains" path="notes/00-intro.md" pattern="^workspace の場所: \S+" -->
同じファイルの `workspace の場所:` の後ろに、workspace の絶対パスを書く。
<!-- /exercise -->

書けたら `npm run check -- --lesson 00` を実行し、2つとも ✓ になることを確かめます。
