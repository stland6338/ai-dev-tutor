---
name: release-note
description: 直近のコミットから CHANGELOG.md に項目を追記する。リリース前に人が明示的に呼ぶ
disable-model-invocation: true
---

`git log` で前回のタグ（無ければ最初のコミット）以降のコミットを読み、
CHANGELOG.md の先頭に「## $ARGUMENTS」の見出しで、利用者向けの変更だけを箇条書きで追記する。
fix: と feat: 以外のコミットは載せない。
