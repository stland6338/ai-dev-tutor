---
id: c01-shared-repo
title: 1つのリポジトリを複数のエージェントで使う
track: env
order: 1
as_of: 2026-10-26
applies_to: Claude Code 2.1.310 / Opus 5.5
estimated_minutes: 25
sources:
  - url: https://code.claude.com/docs/en/memory
    checked: 2026-10-26
  - url: https://agents.md/
    checked: 2026-10-24
  - url: https://docs.x.ai/build/features/skills-plugins-marketplaces
    checked: 2026-10-24
  - url: https://docs.x.ai/build/features/mcp-servers
    checked: 2026-10-24
  - url: https://docs.x.ai/build/features/hooks
    checked: 2026-10-24
history:
  - version: 2.1.277
    advice: CLAUDE.md が無いリポジトリでは、Claude Code が AGENTS.md をそのまま読むようになった
    status: current
    note: CLAUDE.md があるときは AGENTS.md を読まない。CLAUDE.md から @AGENTS.md で読み込む
  - version: 2026-10 時点
    advice: AGENTS.md を共通の指示にし、CLAUDE.md には @AGENTS.md と Claude Code だけの指示を書く
    status: current
---

## この章でできるようになること

- Claude Code と Grok Build が、リポジトリのどのファイルを読むかを説明できる
- 共通の指示を AGENTS.md にまとめ、CLAUDE.md から読み込める
- エージェントごとの指示と、共通の指示を分けて書ける

最初に決めた「環境を整えてから Grok に進む」の1つ目です。同じリポジトリを Claude Code・Grok Build・クラウドのセッションで使っても、指示が食い違わないようにします。

## 公式の要点

### AGENTS.md とは

AGENTS.md は、コーディングエージェントに向けた指示を書くファイルの共通の形式です（agents.md）。ビルドとテストのコマンド、コードの書き方、PR の決まりなどを書きます。リポジトリの直下に置き、サブプロジェクトごとにも置けます [V]。

### 何がどのファイルを読むか

| ファイル | Claude Code | Grok Build |
|---|---|---|
| `AGENTS.md` | CLAUDE.md が無いときだけ読む（v2.1.277 以降）[V] | 読む [V] |
| `CLAUDE.md` | 読む [V] | 読む [V] |
| `.claude/rules/` | 読む [V] | 読む [V] |
| `.mcp.json` | 読む（A9）[V] | 読む [V] |
| `.claude/settings.json` の hooks | 読む [V] | 読む（`/hooks-trust` で信頼したあと）[V] |
| `.claude/skills/` | 読む [V] | 読む（Claude Code の skill がそのまま動く、と docs にある）[V] |

Claude Code の AGENTS.md の扱いには、注意する点が2つあります [V]（memory）。

- リポジトリかその上のフォルダに CLAUDE.md・`.claude/CLAUDE.md`・CLAUDE.local.md のどれかがあると、AGENTS.md は読まれません。個人用の CLAUDE.local.md を置いただけでも、AGENTS.md は読まれなくなります
- `AGENTS.local.md` や `.agents/` 配下のファイルは読みません

### おすすめの配置

CLAUDE.md を残したまま AGENTS.md を共通の指示にするには、CLAUDE.md から読み込みます [V]（memory）。

```markdown
@AGENTS.md

## Claude Code だけの決まり
- 複数ファイルにまたがる変更は plan mode で計画してから
```

| 置く場所 | 書くもの |
|---|---|
| `AGENTS.md` | どのエージェントにも同じこと（コマンド、コードの書き方、PR の決まり） |
| `CLAUDE.md` | `@AGENTS.md` と、Claude Code だけの指示（plan mode、Claude Code の hook の前提など） |
| `.mcp.json` | 共有する MCP サーバー（A9） |
| `.claude/skills/` | 共有する手順。Agent Skills は Claude Code 以外でも使える共通の形式になった（A5） |

同じことを AGENTS.md と CLAUDE.md の両方に書かないようにします。2か所に書くと、片方だけが直されて食い違います（A4 の「短く保つ」と同じ理由です）。

> Cursor や Codex などほかのエージェントも AGENTS.md を読むと言われていますが、この回では一次資料を確かめていません [U]。

## ハンズオン

A4 で作った `sample-app/CLAUDE.md` を、AGENTS.md と CLAUDE.md に分けます。

### 1. 共通の指示を AGENTS.md に移す

<!-- exercise id="c01-agents-md" check="file-contains" path="sample-app/AGENTS.md" pattern="npm test" -->
`sample-app/AGENTS.md` を作り、CLAUDE.md にあるコマンド（`npm test`）とコードの決まりを移す。Claude に「CLAUDE.md の中で、どのエージェントにも共通の部分を AGENTS.md に移して」と頼んでも構わない。
<!-- /exercise -->

### 2. CLAUDE.md から読み込む

<!-- exercise id="c01-import" check="file-contains" path="sample-app/CLAUDE.md" pattern="^@AGENTS\.md" -->
`sample-app/CLAUDE.md` の先頭を `@AGENTS.md` の行にし、その下には Claude Code だけの指示を残す。A4 の課題（40 行以内、`npm test` への言及、`@` の読み込み）も通ったままにすること。
<!-- /exercise -->

<!-- exercise id="c01-claude-only" check="file-contains" path="notes/c01-shared-repo.md" pattern="^CLAUDE.md だけに残すこと: .{10,}" -->
`notes/c01-shared-repo.md` の `CLAUDE.md だけに残すこと:` の後ろに、CLAUDE.md に残した指示と、それを AGENTS.md に入れなかった理由を書く。
<!-- /exercise -->

### 3. 読み込まれたことを確かめる

```bash
cd ~/ai-dev-tutor-workspace/sample-app
claude
```

```text
/memory
```

<!-- exercise id="c01-loaded" check="manual" -->
`/memory`（または `/context`）で、CLAUDE.md と、そこから読み込まれた AGENTS.md の両方が載っていることを確かめる。Grok Build を入れているなら `grok inspect` でも、AGENTS.md と CLAUDE.md が読まれていることを見る。終えたら `npm run done -- c01-loaded` で完了にする。
<!-- /exercise -->

## うまくいかないとき

| 症状 | 対処 |
|---|---|
| AGENTS.md の内容が効いていない | CLAUDE.md があると AGENTS.md は読まれない。CLAUDE.md に `@AGENTS.md` を書く [V] |
| 個人用の CLAUDE.local.md を足したら、AGENTS.md が効かなくなった | CLAUDE.local.md も CLAUDE.md と同じ扱いになる。両方を読ませたいときは、`/config` の Project instructions を CLAUDE.md と AGENTS.md の両方を読む設定に変える [V] |
| エージェントによって振る舞いが違う | 同じ指示を2か所に書いていないか、AGENTS.md と CLAUDE.md を見比べる |

## 振り返り

- 共通の指示を1か所にまとめると、Claude Code・Grok Build・クラウドのセッションが同じ前提で動きます
- 次の C2 では、どの作業を手元で、どれをクラウドで動かすかを決め、クラウドに届く設定と届かない設定を分けます
