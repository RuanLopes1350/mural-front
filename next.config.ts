import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mural.web.fslab.dev',
      },
      {
        protocol: 'https',
        hostname: 's3.fslab.dev',
      },
    ],
  },
};

export default nextConfig;
