#!/bin/sh

# 检查数据库是否存在
if [ ! -f "/app/database/database.db" ]; then
  echo "数据库不存在，正在初始化..."
  cd /app
  pnpm prisma db push
  echo "数据库初始化完成"
else
  echo "数据库已存在，跳过初始化"
fi

# 启动应用
exec node dist/index.js
