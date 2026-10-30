# 期限切れ（overdue）

## Sub-features

- 期限が今日より前で、未完了のタスクだけを出す
- 今日が期限のタスクは出さない
- 完了したタスクは出さない

## How to get to it (user POV)

タスクを `add <title> --due YYYY-MM-DD` で足したあと、`overdue` を実行する。

## Driving it with node src/cli.js

SKILL.md の Launch を済ませてから:

```sh
YESTERDAY=$(node -e 'const d=new Date();d.setDate(d.getDate()-1);console.log(d.toISOString().slice(0,10))')
TODAY=$(node -e 'console.log(new Date().toISOString().slice(0,10))')
node src/cli.js add "昨日まで" --due "$YESTERDAY"
node src/cli.js add "今日まで" --due "$TODAY"
node src/cli.js add "済んだもの" --due "$YESTERDAY"
node src/cli.js done 3
node src/cli.js overdue | tee -a "$EVIDENCE/transcript.txt"
```

正しい結果: 「昨日まで」の1行だけが出る。

## Gotchas

- 今日の日付は UTC（`toISOString`）で決まる。日本時間の朝9時前は、前の日として扱われる
