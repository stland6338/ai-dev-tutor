#!/bin/sh
# PreToolUse(Bash): git push を止め、理由を Claude に返す
# 簡易な例。コマンド文字列に "git push" を含むかだけを見るので、git -C . push のような書き方はすり抜ける
cmd=$(node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.parse(s).tool_input?.command ?? ""))')
case "$cmd" in
  *"git push"*)
    echo "この教材では push しません。push は人が確認してから行います" >&2
    exit 2 ;;
esac
exit 0
