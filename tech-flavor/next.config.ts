import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-auth", "kysely", "drizzle-orm","@better-auth/kysely-adapter"],
  output: "standalone",
  
};

export default nextConfig;
