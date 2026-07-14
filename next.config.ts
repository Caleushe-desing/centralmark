import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Imagen Docker de producción (output standalone)
  output: "standalone",
  allowedDevOrigins: [
    "127.0.0.1",
    "192.168.4.71",
    "localhost",
    "*.trycloudflare.com",
    "*.loca.lt",
  ],
  serverExternalPackages: ["better-sqlite3", "sharp", "@prisma/adapter-better-sqlite3"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.mizo.cl",
        pathname: "/markmall/**",
      },
      {
        protocol: "https",
        hostname: "mizo.cl",
        pathname: "/markmall/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/generated/ad-images/:filename",
        destination: "/api/generated/ad-images/:filename",
      },
    ];
  },
};

export default nextConfig;
