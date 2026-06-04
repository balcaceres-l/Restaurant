import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-auth", "kysely", "drizzle-orm"],
  output: "standalone",
};

export default nextConfig;
