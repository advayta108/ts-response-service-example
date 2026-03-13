import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  webpack(config, { isServer }) {
    // Vercel собирает Next на Node — модуля bun:sqlite нет; иначе runtime MODULE_NOT_FOUND
    if (isServer && process.env.VERCEL === "1") {
      config.resolve.alias = {
        ...config.resolve.alias,
        "bun:sqlite": path.join(__dirname, "src/db/bun-sqlite-stub.cjs"),
      };
    }
    return config;
  },
};

export default nextConfig;
