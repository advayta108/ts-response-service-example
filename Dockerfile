FROM oven/bun:1
WORKDIR /app
COPY package.json bun.lock*
RUN bun install --frozen-lockfile 2>/dev/null || bun install
COPY . .
# Сборка в Node-стиле: bun:sqlite → stub; рантайм API только с Postgres (compose)
RUN bun run build
EXPOSE 3000
ENV NODE_ENV=production
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
