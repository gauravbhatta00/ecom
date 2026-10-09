import type { NextConfig } from "next";
import path from "node:path";

const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: { root: path.resolve(process.cwd()) },
  outputFileTracingRoot: path.resolve(process.cwd()),
  async rewrites() {
    return [{ source: "/catalog-media/:path*", destination: `${apiUrl}/media/products/:path*` }];
  },
};

export default nextConfig;
