# tasklog

依存パッケージなしの Node CLI。データは tasks.json（TASKLOG_FILE で変更可）。

## コマンド
- テスト: `npm test`（1ファイルだけなら `node --test test/<file>`）

## 決まり
- src/tasks.js の関数は配列を書き換えず、新しい配列を返す
- 日付は "YYYY-MM-DD" の文字列で比べる

@README.md
