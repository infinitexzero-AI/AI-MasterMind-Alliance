module.exports = {
  apps: [
    {
      name: 'nexus-dashboard',
      script: 'npm',
      args: 'run dev',
      cwd: '/Volumes/XDriveBeta/AILCC_PRIME/nexus-dashboard',
      env: {
        PORT: 3007,
        NODE_ENV: 'development',
      },
      max_restarts: 5,
      min_uptime: '10s',
      kill_timeout: 5000,
    },
    {
      name: 'neural-relay',
      script: 'server/relay_stabilized.js',
      cwd: '/Volumes/XDriveBeta/AILCC_PRIME/nexus-dashboard',
      env: {
        PORT: 5005,
      },
      max_restarts: 10,
      min_uptime: '10s',
    }
  ]
};
