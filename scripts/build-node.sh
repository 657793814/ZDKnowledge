#!/bin/bash
# 知识动力 - Tauri 桌面打包 (Node 模式)
# 用法: bash scripts/build-node.sh
# 产物: src-tauri/target/release/bundle/dmg/知识动力.dmg

set -e

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && nvm use default --silent 2>/dev/null || true
echo "Node: $(node --version)"

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

echo ""
echo "== 知识动力 -- Node 模式桌面打包 =="

# ── [1/3] 构建前端 ──
echo ""
echo "[1/3] 构建前端..."
cd web && npm run build && cd ..
echo "  OK: web/dist ($(du -sh web/dist | awk '{print $1}'))"

# ── [2/3] 打包后端 ──
echo ""
echo "[2/3] 编译后端..."
BACKEND_DIR="src-tauri/backend"
rm -rf "$BACKEND_DIR"
mkdir -p "$BACKEND_DIR"

cd node-server
npx esbuild src/index.ts \
  --bundle --platform=node --target=node18 \
  --outfile="$PROJECT_DIR/$BACKEND_DIR/server.js" \
  --external:prisma --external:@prisma/client \
  --external:bcryptjs --external:better-sqlite3 \
  --external:sql.js --external:encoding 2>&1
cd "$PROJECT_DIR"
echo "  OK: server.js ($(wc -c < "$BACKEND_DIR/server.js" | awk '{printf "%.1f MB", $1/1048576}'))"

# 复制 prisma schema
cp -r node-server/prisma "$BACKEND_DIR/"

# 只装运行时最小依赖，不复制 package.json（避免 devDeps 污染）
cd "$BACKEND_DIR"
npm init -y --silent 2>/dev/null
npm install --save --ignore-scripts \
  "@prisma/client@5.22.0" \
  "bcryptjs@^3.0.3" \
  "better-sqlite3@^11" \
  2>&1 | tail -2

# 安装 prisma CLI 仅用于 generate，用完就删
npm install --save-dev "prisma@5.22.0" 2>&1 | tail -1
npx prisma generate 2>&1 | tail -2
npm uninstall prisma 2>&1 | tail -1

# 清理 @prisma/client：只留 SQLite WASM 引擎
echo "  清理 Prisma WASM 引擎（只留 SQLite）..."
find node_modules/@prisma/client/runtime -type f \
  \( -name "*mysql*" -o -name "*postgresql*" -o -name "*cockroachdb*" -o -name "*sqlserver*" \) \
  -delete 2>/dev/null || true

# 清理所有包的测试/文档/TS 源码
echo "  清理无用文件..."
find node_modules -type f \( \
  -name "*.ts" -o -name "*.tsx" -o -name "*.map" -o \
  -name "CHANGELOG*" -o -name "LICENSE*" -o -name "README*" -o \
  -name "AUTHORS*" -o -name "CONTRIBUTING*" -o -name "SECURITY*" -o \
  -name "CODE_OF_CONDUCT*" -o -name "Makefile*" -o -name "*.markdown" \
\) -delete 2>/dev/null || true

find node_modules -type d \( \
  -name "test" -o -name "tests" -o -name "testing" -o -name "__tests__" -o \
  -name "__snapshots__" -o -name "docs" -o -name "doc" -o -name "man" -o \
  -name "benchmark" -o -name "benchmarks" -o -name "example" -o -name "examples" \
\) -exec rm -rf {} + 2>/dev/null || true

cd "$PROJECT_DIR"

echo "  OK: 资源就绪"
du -sh "$BACKEND_DIR" | awk '{print "  总计: "$0}'
du -sh "$BACKEND_DIR/node_modules" | awk '{print "  node_modules: "$0}'
echo "  - server.js: $(wc -c < "$BACKEND_DIR/server.js" | awk '{printf "%.1f MB", $1/1048576}')"

# ── [3/3] Tauri 打包 ──
echo ""
echo "[3/3] cargo tauri build (dmg)..."
cd src-tauri
BACKEND=node npx @tauri-apps/cli@latest build --bundles dmg 2>&1
cd "$PROJECT_DIR"

# 完成
DMG=$(ls -t src-tauri/target/release/bundle/dmg/*.dmg 2>/dev/null | grep -v "^rw\." | head -1)
[ -z "$DMG" ] && DMG=$(ls -t src-tauri/target/release/bundle/dmg/*.dmg 2>/dev/null | head -1)
echo ""
echo "OK! 打包完成"
if [ -n "$DMG" ]; then
  echo "  产物: $DMG"
  ls -lh "$DMG"
fi
