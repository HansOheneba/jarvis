import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure data files are traced if ever loaded via fs in production
  outputFileTracingIncludes: {
    "/api/chat": ["./data/**/*"],
    "/api/rag": ["./data/**/*"],
  },
};

export default nextConfig;
