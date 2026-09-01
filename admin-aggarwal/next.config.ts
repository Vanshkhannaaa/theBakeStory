import type { NextConfig } from "next";
import { FIREBASE_IMAGE_HOSTNAMES } from "./src/lib/image-config";

const nextConfig: NextConfig = {
  devIndicators: false,
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: FIREBASE_IMAGE_HOSTNAMES.map((hostname) => ({
      protocol: "https",
      hostname,
      pathname: "/**",
    })),
  },
};

export default nextConfig;
