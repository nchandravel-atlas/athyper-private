/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { allowedOrigins: ["neon.local"] }
  }
};

module.exports = nextConfig;
