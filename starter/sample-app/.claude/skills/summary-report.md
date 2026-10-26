---
name: summary-report
description: tasklog の summary と overdue の結果を、朝会で読み上げられる3行のレポートにまとめる
---

1. `node src/cli.js summary` と `node src/cli.js overdue` を実行する
2. 完了率、期限切れの件数、いちばん古い期限切れのタスクを、それぞれ1行で書く
3. 期限切れが無ければ「期限切れはありません」と書く
