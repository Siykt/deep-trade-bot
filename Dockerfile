FROM --platform=$BUILDPLATFORM node:20-alpine AS builder

WORKDIR /app

RUN npm install pnpm -g

COPY ./docs /app/docs
COPY ./prisma /app/prisma
COPY ./package.json /app/package.json
COPY ./pnpm-lock.yaml /app/pnpm-lock.yaml
COPY ./tsup.config.ts /app/tsup.config.ts
COPY ./tsconfig.json /app/tsconfig.json

# 最后获取源码，避免缓存失效
COPY ./src /app/src

RUN pnpm install
RUN pnpm build

FROM --platform=$BUILDPLATFORM node:20-alpine3.17 AS app

LABEL org.opencontainers.image.source=https://github.com/siykt/kiss-lust

WORKDIR /app

# 复制构建产物
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/pnpm-lock.yaml /app/pnpm-lock.yaml
COPY --from=builder /app/prisma /app/prisma
COPY --from=builder /app/docs /app/docs
COPY --from=builder /app/src/services/comfy-ui/workflows /app/dist/workflows
COPY ./scripts/start.sh /app/start.sh

# 复制构建产物
COPY --from=builder /app/dist /app/dist

RUN npm install pnpm -g
RUN pnpm install --production
RUN pnpm prisma generate

ENV DATABASE_URL=file:/app/database/database.db
ENV NODE_ENV=production

# 创建数据库目录
RUN mkdir -p /app/database

# 设置启动脚本执行权限
RUN chmod +x /app/start.sh

CMD ["/app/start.sh"]
