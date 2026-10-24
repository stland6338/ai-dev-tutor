# クラウドに渡すチケット

## 背景
tasklog の list は全件を表示する。完了・未完了で絞りたい。

## やること
- `node src/cli.js list --done` で完了したものだけ、`--todo` で未完了だけを表示する
- 両方付けたらエラーにする

## 確かめ方
- `npm test` が全部通る（絞り込みのテストを足すこと）
- `TASKLOG_FILE=/tmp/t.json node src/cli.js add a && TASKLOG_FILE=/tmp/t.json node src/cli.js list --todo` で a が出る
