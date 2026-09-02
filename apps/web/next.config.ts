import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  // Produces a minimal, self-contained server bundle (.next/standalone) for the Docker image.
  output: "standalone",
};

export default nextConfig;
