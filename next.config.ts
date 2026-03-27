import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow reading from the mock-data directory at runtime
  serverExternalPackages: ["nunjucks"],
};

export default nextConfig;
