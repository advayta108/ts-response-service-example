import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Нативный модуль; локальный Node + SQLite
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
