import type { NextConfig } from "next";

const basePath = process.env.BASE_PATH || '';

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  allowedDevOrigins: ["127.0.0.1"],
  turbopack: { root: process.cwd() },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
