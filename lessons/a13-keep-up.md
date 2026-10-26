---
id: a13-keep-up
title: 推奨の変化を追う
track: claude-code
order: 13
as_of: 2026-10-26
applies_to: Claude Code 2.1.310 / Opus 5.5
estimated_minutes: 20
sources:
  - url: https://code.claude.com/docs/en/setup
    checked: 2026-10-26
  - url: https://code.claude.com/docs/en/whats-new
    checked: 2026-10-24
  - url: https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md
    checked: 2026-10-24
history:
  - version: 2026-10 時点
    advice: 更新チャンネルを選ぶ。latest は新しい版をすぐに、stable は約1週間遅れで大きな不具合のある版を飛ばして受け取る
    status: current
  - version: 2026-10 時点
    advice: 変化は whats-new の週報・changelog・claude.dev のブログで追う
    status: current
---

## この章でできるようになること

- Claude Code の更新の仕組みと、更新チャンネルの違いを説明できる
- 推奨の変化を、公式の情報源から追える
- この教材の「いつの時点の推奨か」（`as_of`・`applies_to`・年表）と、自分の環境を照らし合わせられる

00 で「AI 開発ツールの推奨は数か月で変わる」と書きました。この章は、その変化を自分で追うための章です。

## 公式の要点

### 更新の仕組み

公式のインストーラーで入れた Claude Code は、裏で自動的に更新されます。起動時と動いている間に更新を確かめ、次に起動したときに新しい版になります [V]（setup）。

| したいこと | やり方 |
|---|---|
| すぐに更新する | `claude update` |
| 更新の状態を見る | `claude doctor` の Auto-updates の行と、最後の更新の結果 |
| 更新チャンネルを選ぶ | `/config` の Auto-update channel、または settings.json の `"autoUpdatesChannel"` |
| これより古い版にしない | `"minimumVersion": "2.1.300"` のように下限を決める |
| 自動更新を止める | settings.json の `env` に `"DISABLE_AUTOUPDATER": "1"`（`claude update` は使える） |

| チャンネル | 中身 |
|---|---|
| `latest`（既定） | 新しい機能をすぐに受け取る |
| `stable` | だいたい1週間前の版を使い、大きな不具合のある版を飛ばす |

新しく出たモデルが、stable の版より新しい Claude Code を必要とすることがあります。そのモデルをすぐ使いたいなら latest にします [V]。Homebrew・WinGet で入れた場合は自動更新されないので、自分で更新します（`brew upgrade claude-code` など）[V]。

### 変化を追う情報源

| 情報源 | 中身 |
|---|---|
| whats-new（code.claude.com/docs/en/whats-new） | 週ごとの主な変更のまとめ |
| CHANGELOG（GitHub の anthropics/claude-code） | 版ごとの細かい変更 |
| claude.dev のブログ | 使い方の考え方の記事（Spending your effort、code review など） |
| X の @ClaudeDevs・@claudeai | 告知（この教材では要約と URL だけを載せる） |

### この教材と照らす

この教材の各章には、確かめた日（`as_of`）・その時点の版（`applies_to`）・推奨の年表（`history`）が付いています。

- `npm run check` は、手元の Claude Code の版を `applies_to` と比べ、新しければ「推奨が変わっている可能性があります」、古ければ「教材より古いです」と知らせます
- 新しい版で推奨が変わっていたら、その章の帯にある公式ページを開き、年表のどの行が「置換」になったかを確かめます
- 教材を直すときは、章の `as_of` と `revised`（直した日と理由）を書き換え、年表に新しい行を足します（docs/lesson-format.md）

## ハンズオン

### 1. 自分の更新の状態を確かめる

```bash
claude --version
claude doctor
```

<!-- exercise id="a13-channel" check="file-contains" path="notes/a13-keep-up.md" pattern="^選んだ更新チャンネル: (latest|stable)" -->
`notes/a13-keep-up.md` の `選んだ更新チャンネル:` の後ろに、`latest` か `stable` のどちらを使うかを書き、理由を添える。設定を変えたなら `/config` で確かめる。
<!-- /exercise -->

<!-- exercise id="a13-update" check="manual" -->
`claude update` を実行し、`claude doctor` の Auto-updates の行で、自動更新が有効かどうかを確かめる。終えたら `npm run done -- a13-update` で完了にする。
<!-- /exercise -->

### 2. 教材のバージョンと照らす

教材のフォルダで判定を実行します。

```bash
npm run check
```

<!-- exercise id="a13-version-gap" check="file-contains" path="notes/a13-keep-up.md" pattern="^教材とのバージョンの差: .*2\.\d+\.\d+" -->
同じファイルの `教材とのバージョンの差:` の後ろに、`npm run check` の最後の「バージョンの確認」に出た内容（手元の版と教材の版）を書く。何も出なければ、`claude --version` の結果と、教材の帯の版を並べて書く。
<!-- /exercise -->

### 3. 最近の変化を1つ読む

<!-- exercise id="a13-whats-new" check="file-contains" path="notes/a13-keep-up.md" pattern="^whats-new で見た変更: .{10,}" -->
whats-new か CHANGELOG を開き、この教材の内容に関係しそうな変更を1つ選んで、`whats-new で見た変更:` の後ろに書く。どの章の推奨に関わるかも添える。
<!-- /exercise -->

## 振り返り

- 推奨は変わり続けます。この教材も、`as_of` と年表で「いつの時点の推奨か」を残しているので、新しい版と照らして直せます
- これでトラック A は終わりです。下のまとめで振り返ってください

## トラック A のまとめ

| 章 | 公式が一番言いたいこと |
|---|---|
| A2 | 読ませて、計画して、作って、コミットする。context は限られた資源 |
| A3 | 確かめ方を渡す。強制したいなら hook |
| A4 | CLAUDE.md は短く。条件付きは rules、たまに要るものは skills |
| A5 | subagent は必要なときだけ |
| A6 | 守りは注意ではなく仕組みで |
| A7 | 1つを信頼できてから並べる |
| A8 | クラウドには自己完結したチケットを渡す |
| A9 | MCP サーバーは必要なものだけ、信頼できるものだけをつなぐ |
| A10 | 読む内容も攻撃の入り口になる。承認の前に確かめ、信頼できないものは隔離する |
| A11 | セッションに名前を付け、試すときは分岐する |
| A12 | 効かない設定は、まず読み込まれたかを確かめる |
| A13 | 推奨は変わる。公式の情報源と教材の時点を照らす |

次のトラック B ではここまでの公式の流儀と pstack を比べます。
