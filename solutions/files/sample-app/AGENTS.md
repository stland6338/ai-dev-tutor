# tasklog

依存パッケージなしの Node CLI。データは tasks.json（TASKLOG_FILE で変更可）。詳しくは README.md。

## Test
- `npm test`（1ファイルだけなら `node --test test/<file>`）

## 決まり
- src/tasks.js の関数は配列を書き換えず、新しい配列を返す
- 日付は "YYYY-MM-DD" の文字列で比べる

## Grok Bot
- 仕事ごとに別の clone と新しいブランチで作業する。main に直接 push しない
- PR を出す前に `npm test` を実行し、コマンドと結果を PR の説明に書く
- `npm run deploy` や `wrangler` は実行しない。デプロイは持ち主が行う
