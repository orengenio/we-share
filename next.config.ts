import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // Required for Coolify/Docker deployment
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"],
  },
  images: {
    domains: ["avatars.githubusercontent.com"],
  },
};

export default nextConfig;
