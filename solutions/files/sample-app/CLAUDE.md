@AGENTS.md

## Claude Code だけの決まり
- 終える前の `npm test` は Stop hook（.claude/hooks/require-tests.sh）が確かめる。差し戻されたら直してから終える
- 複数ファイルにまたがる変更は plan mode で計画してから
