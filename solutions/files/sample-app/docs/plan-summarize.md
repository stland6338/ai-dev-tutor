## 計画: summarize の 0 件対応

- 原因: tasks が空のとき 0 / 0 を計算して NaN% になる
- 修正: 件数が 0 なら割合を 0 にする（src/tasks.js の summarize）

## 確かめ方

- `node --test test/summarize.test.js` が通る
- `npm test` 全体も通る
