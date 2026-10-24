#!/bin/sh
# docs/diagrams/*.drawio を assets/diagrams/*.svg に書き出す（draw.io デスクトップ版の CLI を使う）
#   sh scripts/diagrams.sh
# - draw.io の CLI は Electron なので、Claude Code の sandbox の中では起動できない（外で実行する）
# - ページ番号は 1 から数える
# - --theme light: 既定の auto だと閲覧側の暗い表示に合わせて色が反転するので、明るい表示に固定する
# - 書き出した SVG は、ラベルごとに代替の PNG を埋め込むので重い（数百 KB）。
#   ブラウザは foreignObject の文字を表示し代替を使わないので、代替の <image> を取り除く
set -e
cd "$(dirname "$0")/.."
DRAWIO=${DRAWIO:-drawio}
out=assets/diagrams
mkdir -p "$out"

export_page() { # <drawio> <page> <name>
  "$DRAWIO" -x -f svg --theme light -p "$2" --border 16 -o "$out/$3.svg" "docs/diagrams/$1" >/dev/null 2>&1
  node -e '
    const fs = require("fs"); const p = process.argv[1];
    const s = fs.readFileSync(p, "utf8").replace(/<image\b[^>]*xlink:href="data:image\/png;base64,[^"]*"[^>]*\/>/g, "");
    fs.writeFileSync(p, s);
  ' "$out/$3.svg"
  echo "$out/$3.svg ($(wc -c < "$out/$3.svg" | tr -d " ") bytes)"
}

export_page roadmap.drawio 1 roadmap
export_page how-it-works.drawio 1 how-it-works
export_page official-practices.drawio 1 a02-workflow
export_page official-practices.drawio 2 a03-verify-ladder
export_page official-practices.drawio 3 a06-guard
