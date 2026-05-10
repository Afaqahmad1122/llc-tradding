import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "icc-trading-car-images.s3.ap-south-1.amazonaws.com",
        pathname: "/cars/**",
      },
    ],
  },
  async redirects() {
    return [{ source: "/login", destination: "/", permanent: true }];
  },
};

export default nextConfig;
