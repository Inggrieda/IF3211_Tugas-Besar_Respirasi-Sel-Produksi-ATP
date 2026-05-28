import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir:
    process.env.VERCEL || process.env.NODE_ENV !== "development"
      ? ".next"
      : ".next-dev",
};

export default nextConfig;
