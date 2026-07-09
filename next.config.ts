import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "192.168.4.71"],
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
};

export default nextConfig;
