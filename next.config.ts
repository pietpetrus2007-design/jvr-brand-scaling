import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_LAUNCH_DATE: process.env.LAUNCH_DATE,
  },
};

export default nextConfig;
