# Issue #2: 今日が期限のタスクが「期限切れ」に出る

## 起きていること

```bash
node src/cli.js add "日報を書く" --due $(date +%Y-%m-%d)
node src/cli.js overdue
```

今日が期限のタスクが `overdue` に表示される。

## 期待

`overdue` に出すのは、期限が今日より前で、まだ完了していないタスクだけ。今日が期限のものは出さない。

## メモ

- 再現するテストはまだ無い
