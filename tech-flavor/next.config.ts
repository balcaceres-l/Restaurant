import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-auth", "kysely", "drizzle-orm"],
};

export default nextConfig;
