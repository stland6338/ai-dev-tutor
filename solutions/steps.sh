#!/bin/sh
# self-test 用: solutions/files を重ねたあと、workspace で実行する手順
set -e
cd sample-app
# A12: 置き場所を間違えた skill を消す（正しい場所の SKILL.md は solutions/files にある）
rm -f .claude/skills/summary-report.md
git add -A
git -c user.name=ai-dev-tutor -c user.email=tutor@example.invalid -c commit.gpgsign=false -c core.hooksPath=/dev/null \
  commit -q -m "fix: summarize shows 0% for empty lists and overdue excludes today"
# claude -w add-search と同じ配置の worktree を作る
git worktree add -q .claude/worktrees/add-search -b worktree-add-search
