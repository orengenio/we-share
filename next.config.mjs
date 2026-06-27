/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"],
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "avatars.githubusercontent.com" }],
  },
};

export default nextConfig;
