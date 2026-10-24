# 章ファイルの形式

`lessons/<id>.md` に1章1ファイルで置く。id は「トラックの記号＋2桁＋内容」（`00-intro`、`a03-verify`、`d01-grok-build`）。トラックの記号は 0（はじめに）・a（Claude Code）・b（pstack）・c（環境）・d（Grok）・e（LLM アプリ）・f（プロンプト）で、ファイル名の順がそのまま学ぶ順になる。ビューア（index.html）と判定（scripts/check.mjs）は、どちらも `lib/lesson.js` でこの形式を読む。

## frontmatter

YAML の一部だけを使う。使えるのは「`key: 値`」「`key:` の下に `- 値` の列」「`- k: v` で始まり、続く行を字下げした地図の列」の3つ。`{}` や `[]` のインライン表記は使えない。

```yaml
---
id: a03-verify                # 章の ID。ファイル名の先頭と合わせる
title: 確かめ方を渡す
track: claude-code            # intro | claude-code | pstack | env | grok | llm-app | prompt
order: 3                      # トラック内の順
as_of: 2026-10-24             # 内容を確かめた日
applies_to: Claude Code 2.1.310 / Opus 5.5   # このバージョンの時点の推奨である、という印
official_ref: Claude Code 101 · Module 3     # 公式講座の対応箇所（無ければ省略）
estimated_minutes: 25
sources:
  - url: https://code.claude.com/docs/en/best-practices
    checked: 2026-10-24
announcements:                # 本文の横に出す「公式の告知」。本文は引用しない
  - author: "@bcherny"
    date: 2026-01-03
    url: https://x.com/bcherny/status/2007179832300581177
    summary: 1行の要約
    verified: false           # 原文を直接確かめていなければ false（「未確認」の札が付く）
history:                      # 推奨の変遷。章末に年表として出す
  - version: 0.2.44
    date: 2025-03-15
    advice: think / think harder / ultrathink で思考量を指定
    status: superseded        # current | superseded | experimental
    note: ultrathink 以外は効かない。effort が主な調整手段
---
```

announcements と sources の X の投稿 URL は、本文下の「Xの関連投稿」欄にも出る。本文には引用せず要約と URL だけを書く。閲覧者がボタンで開いたときに出る X 公式の埋め込みだけは例外（開くまで X には通信しない）。

## 確認の度合いの印

本文の主張には必要に応じて次の印を付ける。

| 印 | 意味 |
|---|---|
| `[V]` | 公式ページで確認した |
| `[R]` | 実際に動かして確認した |
| `[U]` | 未確認・推測。確かめられたら外す |

## exercise ブロック（vimtutor 形式の課題）

```markdown
<!-- exercise id="a03-stop-hook" check="json-has" path="sample-app/.claude/settings.json" key="hooks.Stop" -->
**課題**: Stop hook を設定する。
<!-- /exercise -->
```

- `id` は全章で一意にする。`<章の id の先頭3文字>-<内容>` の形にする
- `path` と `cwd` は workspace（既定は `~/ai-dev-tutor-workspace`、環境変数 `TUTOR_WORKSPACE` で変更可）から見た相対パス
- 属性の値に `"` は使えない
- `command` の `run` はシェルで実行される。外から受け取った章（Grok Bot が書いた章など）は、取り込む前に `run` の中身を読んで確かめる

| check | 使う属性 | 合格の条件 |
|---|---|---|
| `file-exists` | `path` | ファイルかフォルダがある |
| `file-contains` | `path`, `pattern` | `pattern`（正規表現、複数行モード）に合う箇所がある |
| `json-has` | `path`, `key` | JSON の `key`（`.` 区切り）に、空でない値がある |
| `command` | `run`, `cwd`（省略時は workspace の直下。sample-app で実行したいなら `cwd="sample-app"` を必ず書く） | シェルで実行して終了コード 0 |
| `manual` | — | `npm run done <id>` で完了にした |

- 判定は「その課題が本当に働いているか」をできるだけ見る。hook のスクリプトなら、文字列の有無ではなく実行ビットと、入力を渡したときの終了コードを確かめる（`a06-block-script` を参照）
- 新しい workspace ではどの課題も不合格になるように作る
- 各課題の模範解答を `solutions/` に置く。workspace に重ねると全課題が合格になるように作る（`npm run self-test` で確かめる）
  - `solutions/files/` 以下は workspace と同じ配置にする
  - `solutions/steps.sh` は、ファイルを重ねたあとに workspace で実行する手順（git commit など）
