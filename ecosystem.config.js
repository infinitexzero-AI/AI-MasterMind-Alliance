module.exports = {
  apps: [
    {
      name: 'nexus-dashboard',
      cwd: '/Users/infinite27/AILCC_PRIME/nexus-dashboard',
      script: '/usr/local/bin/npm',
      args: 'run dev -- --port 3007',
      env: {
        PATH: '/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin',
        PORT: 3007,
        NODE_ENV: 'development',
        AILCC_ROOT: '/Users/infinite27/AILCC_PRIME',
        NEXT_TELEMETRY_DISABLED: '1'
      },
      autorestart: true,
      watch: false,
      max_memory_restart: '800M'
    },
    {
      name: 'neural-relay',
      cwd: '/Users/infinite27/AILCC_PRIME/nexus-dashboard',
      script: 'server/relay.js',
      interpreter: '/usr/local/bin/node',
      env: {
        PATH: '/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin',
        PORT: 3001,
        REDIS_BYPASS: 'true',
        AILCC_ROOT: '/Users/infinite27/AILCC_PRIME'
      },
      autorestart: true,
      watch: false,
      max_memory_restart: '400M'
    },
    {
      name: 'cortex-core',
      cwd: '/Volumes/XDriveBeta/AILCC_PRIME/00_Projects/Orchestration_Hub/cortex-core',
      script: 'main.py',
      interpreter: '/usr/bin/python3',
      args: '-m uvicorn main:app --host 0.0.0.0 --port 5005',
      env: {
        PATH: '/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin',
        AILCC_ROOT: '/Users/infinite27/AILCC_PRIME'
      },
      autorestart: true,
      watch: false,
      max_memory_restart: '300M'
    },
    {
      name: 'vanguard-bridge',
      cwd: '/Volumes/XDriveBeta/AILCC_PRIME/scripts',
      script: 'vanguard_bridge.py',
      interpreter: '/usr/bin/python3',
      env: {
        PATH: '/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin',
        AILCC_ROOT: '/Users/infinite27/AILCC_PRIME'
      },
      autorestart: true,
      watch: false,
      max_memory_restart: '200M'
    },
    {
      name: 'openclaw-gateway',
      cwd: '/Users/infinite27/AILCC_PRIME/nexus-dashboard',
      script: './scripts/openclaw_gate.sh',
      interpreter: 'bash',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        PATH: '/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin',
        AILCC_ROOT: '/Users/infinite27/AILCC_PRIME',
        OPENCLAW_CONFIG_PATH: '/Users/infinite27/.openclaw/openclaw.json',
        OPENCLAW_UPDATE_CHECK: 'false'
      }
    }
  ]
};

