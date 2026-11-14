import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.COSMOS_STATIC_EXPORT === "1" ? "export" : undefined,
  trailingSlash: true,
  poweredByHeader: false,
  devIndicators: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
