---
name: verify-tasklog
description: tasklog の CLI（node src/cli.js）を利用者と同じコマンドで動かし、出力とデータファイルを証拠として残す。tasklog の振る舞いを変えたあと、直ったと言う前に使う
---

tasklog はサーバーのない CLI。データは `TASKLOG_FILE` の JSON に書かれる。

## Launch

```sh
export VERIFY_TMP="$(mktemp -d)"
export TASKLOG_FILE="$VERIFY_TMP/tasks.json"
export EVIDENCE="$PWD/.verify/evidence/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$EVIDENCE"
```

準備完了の印: `node src/cli.js list` が何も出さずに終了コード 0 で終わる（空のデータから使える状態）。止めるものはない。

## Doctor

```sh
node --version && node src/cli.js | grep -q "使い方:" && echo "TASKLOG_FILE=$TASKLOG_FILE"
```

Node 20 以上、使い方の行が出る、`TASKLOG_FILE` が一時フォルダを指している、の3つがそろわなければ動かさない。手元の `tasks.json` を指していたら止める。

## Drive

機能ごとの手順は `features/` にある。基本の形:

```sh
node src/cli.js add "牛乳を買う" --due 2026-10-25 | tee -a "$EVIDENCE/transcript.txt"
node src/cli.js list | tee -a "$EVIDENCE/transcript.txt"
```

## Evidence

- 実行したコマンドと出力を `$EVIDENCE/transcript.txt` に残す
- 操作のあとのデータを `cp "$TASKLOG_FILE" "$EVIDENCE/tasks.after.json"` で残す（副作用の確認）
- 関数を直接呼ばず、利用者と同じ `node src/cli.js` の通り道で確かめる

## Cleanup

```sh
rm -rf "$VERIFY_TMP"
ls "$EVIDENCE"
```

消すのは Launch で作った `$VERIFY_TMP` だけ。`$EVIDENCE` は消さない。片付けのあとに `ls` で証拠が残っていることを確かめる。`.verify/` は .gitignore に入れる。
