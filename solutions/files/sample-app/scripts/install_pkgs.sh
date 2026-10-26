#!/bin/bash
# SessionStart hook から呼ぶ。クラウドのセッションのときだけ依存を入れる
if [ "$CLAUDE_CODE_REMOTE" != "true" ]; then
  exit 0
fi
cd "$CLAUDE_PROJECT_DIR" || exit 1
npm install
