#!/bin/sh
# Stop hook: テストが落ちていたら、Claude を一度だけ差し戻す
# hook による続行中（stop_hook_active が true）は止めない。止め続けると、満たせない条件で回り続けるため
active=$(node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.parse(s).stop_hook_active===true))')
[ "$active" = "true" ] && exit 0
cd "$CLAUDE_PROJECT_DIR" || exit 0
if ! out=$(npm test --silent 2>&1); then
  echo "npm test が失敗しています。直してから終えてください:" >&2
  printf '%s\n' "$out" | tail -20 >&2
  exit 2
fi
