import type { NextConfig } from "next";

const statischerExport = process.env.COSMOS_STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  output: statischerExport ? "export" : undefined,
  // `*.server.ts` sind Server-Routen (z. B. die Plugin-API). Der statische Export
  // kennt keine Server-Routen, deshalb gibt es sie dort nicht; die Spielwelt
  // nutzt dann die eingebauten Spiele.
  pageExtensions: statischerExport ? ["tsx", "ts", "jsx", "js"] : ["server.ts", "tsx", "ts", "jsx", "js"],
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
