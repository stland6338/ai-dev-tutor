# tasklog

タスクを `tasks.json` に記録する小さな CLI。ai-dev-tutor の演習で使う。依存パッケージは無い（Node 20 以上）。

```bash
node src/cli.js add "牛乳を買う" --due 2026-10-25
node src/cli.js list
npm test
```

既知の問題は ISSUE.md と、失敗しているテストを見ること。
