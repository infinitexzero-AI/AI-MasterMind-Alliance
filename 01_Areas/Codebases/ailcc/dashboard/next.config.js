// const withBundleAnalyzer = require('@next/bundle-analyzer')({
//   enabled: process.env.ANALYZE === 'true',
// })

const path = require('path');
// const withPWA = require('@ducanh2912/next-pwa').default({
//   dest: 'public',
//   cacheOnFrontEndNav: true,
//   aggressiveFrontEndNavCaching: true,
//   reloadOnOnline: true,
//   swcMinify: true,
//   disable: process.env.NODE_ENV === 'development',
//   workboxOptions: {
//     disableDevLogs: true,
//   },
// });

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    externalDir: true,
  },
  output: 'standalone',
  async redirects() {
    return [
      { source: '/command', destination: '/central-command', permanent: true },
      { source: '/status', destination: '/system', permanent: true },
      { source: '/antigravity-physics', destination: '/antigravity', permanent: true },
      { source: '/synergy', destination: '/agents', permanent: true },
      { source: '/tactics', destination: '/central-command', permanent: true },
      { source: '/telemetry', destination: '/observability', permanent: true },
      { source: '/storage', destination: '/system', permanent: true },
      { source: '/archive', destination: '/memory', permanent: true },
      { source: '/intelligence', destination: '/nexus', permanent: true },
    ];
  },
};

// withPWA and withBundleAnalyzer are temporarily disabled due to corrupted upstream dependencies
module.exports = nextConfig;
