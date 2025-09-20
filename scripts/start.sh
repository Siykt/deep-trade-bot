#!/bin/sh

set -e

# 基于 Prisma 迁移在启动时自动应用数据库变更
echo "正在应用数据库迁移..."
cd /app

# 对于 SQLite，确保数据库目录存在
mkdir -p /app/database

pnpm prisma migrate deploy
echo "数据库迁移完成"

# 启动应用
exec node dist/index.js
