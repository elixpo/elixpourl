/** @type {import('next').NextConfig} */

const nextConfig = {
  experimental: {},
};

// Setup Cloudflare bindings for local dev (next dev)
if (process.env.NODE_ENV === 'development') {
  const { setupDevPlatform } = require('@cloudflare/next-on-pages/next-dev');
  setupDevPlatform();
}

module.exports = nextConfig;
