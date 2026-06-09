const AILCC_ROOT = process.env.AILCC_ROOT || '/Volumes/XDriveBeta/AILCC_PRIME';

module.exports = {
  apps: [
    {
      name: 'nexus-dashboard',
      cwd: `${AILCC_ROOT}/nexus-dashboard`,
      script: 'npm',
      args: 'run dev -- --port 3007',
      env: {
        PATH: `/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${process.env.PATH}`,
        PORT: 3007,
        NODE_ENV: 'development',
        AILCC_ROOT: AILCC_ROOT,
        NEXT_TELEMETRY_DISABLED: '1'
      },
      autorestart: true,
      max_memory_restart: '800M'
    },
    {
      name: 'neural-relay',
      cwd: `${AILCC_ROOT}/nexus-dashboard`,
      script: 'server/relay.js',
      interpreter: 'node',
      env: {
        PATH: `/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${process.env.PATH}`,
        PORT: 3001,
        REDIS_BYPASS: 'true',
        AILCC_ROOT: AILCC_ROOT
      },
      autorestart: true,
      max_memory_restart: '400M'
    },
    {
      name: 'cortex-core',
      cwd: '/Volumes/XDriveBeta/AILCC_PRIME/00_Projects/Orchestration_Hub/cortex-core',
      script: 'main.py',
      interpreter: 'python3',
      args: '-m uvicorn main:app --host 0.0.0.0 --port 5005',
      env: {
        AILCC_ROOT: AILCC_ROOT
      },
      autorestart: true,
      max_memory_restart: '300M'
    },
    {
      name: 'vanguard-bridge',
      cwd: '/Volumes/XDriveBeta/AILCC_PRIME/scripts',
      script: 'vanguard_bridge.py',
      interpreter: 'python3',
      env: {
        AILCC_ROOT: AILCC_ROOT
      },
      autorestart: true,
      max_memory_restart: '200M'
    },
    {
      name: 'openclaw-gateway',
      cwd: `${AILCC_ROOT}/nexus-dashboard`,
      script: './scripts/openclaw_gate.sh',
      interpreter: 'bash',
      autorestart: true,
      env: {
        AILCC_ROOT: AILCC_ROOT,
        OPENCLAW_CONFIG_PATH: '/Volumes/XDriveBeta/AILCC_PRIME/.openclaw/openclaw.json',
        OPENCLAW_UPDATE_CHECK: 'false'
      },
      max_memory_restart: '500M'
    }
  ]
};
