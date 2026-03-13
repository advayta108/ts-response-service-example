FROM oven/bun:1
WORKDIR /app
# Явная цель ./ — иначе COPY package.json bun.lock* ломает слой (package.json не в /app)
COPY package.json ./
COPY bun.lock ./
RUN bun install --frozen-lockfile || bun install
COPY . .
RUN bun run build
EXPOSE 3000
ENV NODE_ENV=production
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
