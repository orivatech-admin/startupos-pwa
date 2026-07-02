import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  // Lets the dev server accept requests when opened from another device on
  // the LAN (e.g. testing PWA install on a phone) instead of just localhost.
  allowedDevOrigins: ["192.168.1.41"],
};

export default nextConfig;
