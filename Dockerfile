FROM oven/bun:1
WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile 2>/dev/null || bun install
COPY . .
ENV DATABASE_URL=/data/app.db
RUN bun run build
EXPOSE 3000
ENV NODE_ENV=production
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
