// const withBundleAnalyzer = require('@next/bundle-analyzer')({
//   enabled: process.env.ANALYZE === 'true',
// })

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
  experimental: {
    externalDir: true,
  },
  
  webpack: (config, { dev }) => {
    if (dev) {
      // Force polling to bypass native macOS fsevents on the external USB drive
      config.watchOptions = {
        poll: 3000, // Poll every 3 seconds (reduces I/O pressure on USB drive)
        aggregateTimeout: 500, // Delay before rebuilding
        ignored: ['**/node_modules/**', '**/.git/**', '**/.next/**'],
      };
    }
    return config;
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
