/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@neon/auth",
    "@neon/ui",
    "@neon/theme",
    "@athyper/ui",
    "@athyper/theme",
    "@athyper/auth",
    "@athyper/api-client",
    "@athyper/workbench-admin",
    "@athyper/workbench-partner",
    "@athyper/workbench-user"
  ],
  experimental: {
    serverActions: { allowedOrigins: ["neon.athyper.local", "localhost:3000"] }
  }
};

export default nextConfig;
