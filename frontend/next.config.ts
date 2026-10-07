import type { NextConfig } from "next";
import path from "node:path";

const apiUrl = (process.env.NEXT_PUBLIC_API_URL || process.env.VITE_DJANGO_BASE_URL || "http://localhost:8000").replace(/\/$/, "");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  pageExtensions: ["ts", "tsx"],
  turbopack: { root: path.resolve(process.cwd()) },
  outputFileTracingRoot: path.resolve(process.cwd()),
  async rewrites() {
    return [{ source: "/catalog-media/:path*", destination: `${apiUrl}/media/products/:path*` }];
  },
  env: {
    // Preserve the two public Vite settings during the incremental migration.
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || process.env.VITE_DJANGO_BASE_URL || "http://localhost:8000",
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || "",
  },
};

export default nextConfig;
