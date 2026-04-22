/**
 * Sovereign OS - Unified Cluster Orchestration
 * Consolidates Nexus Dashboard, Vanguard Pollers, and Infrastructure Monitors.
 */

const path = require('path');
const AILCC_ROOT = '/Volumes/XDriveBeta/AILCC_PRIME';
const VANGUARD_ROOT = '/Volumes/XDriveBeta/AILCC_PRIME/01_Areas/Codebases/ailcc';

module.exports = {
  apps: [
    // --- NEXUS CONTROL PLANE ---
    {
      name: 'nexus-dashboard',
      cwd: path.join(AILCC_ROOT, 'nexus-dashboard'),
      script: './start_dashboard.sh',
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
      cwd: path.join(AILCC_ROOT, 'nexus-dashboard'),
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

    // --- INFRASTRUCTURE & BRIDGES ---
    {
      name: 'vanguard-bridge',
      cwd: path.join(AILCC_ROOT, 'scripts'),
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
      cwd: path.join(AILCC_ROOT, 'nexus-dashboard'),
      script: './scripts/openclaw_gate.sh',
      interpreter: 'bash',
      autorestart: true,
      env: {
        AILCC_ROOT: AILCC_ROOT,
        OPENCLAW_CONFIG_PATH: '/Volumes/XDriveBeta/AILCC_PRIME/.openclaw/openclaw.json',
        OPENCLAW_UPDATE_CHECK: 'false'
      },
      max_memory_restart: '500M'
    },
    {
      name: 'process-health-monitor',
      cwd: path.join(AILCC_ROOT, 'scripts'),
      script: 'process_health_monitor.sh',
      interpreter: 'bash',
      autorestart: false,           // One-shot script — don't restart on exit
      cron_restart: '*/15 * * * *', // Cron handles periodic execution
      env: {
        AILCC_ROOT: AILCC_ROOT
      }
    },
    {
      name: 'sovereign-git-sync',
      cwd: AILCC_ROOT,
      script: 'bash',
      args: 'scripts/git_sync_safe.sh',
      interpreter: 'none',
      autorestart: false,
      cron_restart: '0 */4 * * *',  // Every 4 hours
      env: {
        PATH: `/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${process.env.PATH}`,
        AILCC_ROOT: AILCC_ROOT
      }
    },

    // --- VANGUARD AUTOMATION SWARM ---
    {
      name: 'vanguard_hn_poller',
      script: path.join(VANGUARD_ROOT, 'automations/integrations/hn_poller_daemon.py'),
      interpreter: 'python3',
      autorestart: true,
      max_memory_restart: '100M'
    },
    {
      name: 'vanguard_zotero_sync',
      script: path.join(VANGUARD_ROOT, 'automations/integrations/zotero_poller_daemon.py'),
      interpreter: 'python3',
      autorestart: true,
      max_memory_restart: '150M'
    },
    {
      name: 'vanguard_arxiv_crawler',
      script: path.join(VANGUARD_ROOT, 'automations/integrations/arxiv_recursive_daemon.py'),
      interpreter: 'python3',
      autorestart: true,
      max_memory_restart: '100M'
    },
    {
      name: 'vanguard_vault_backup',
      script: path.join(VANGUARD_ROOT, 'automations/infrastructure/vault_backup_daemon.py'),
      interpreter: 'python3',
      autorestart: false,
      cron_restart: '0 4 * * *', // 4 AM Daily
      max_memory_restart: '500M'
    },
    {
      name: 'team-sync-daemon',
      cwd: path.join(AILCC_ROOT, 'scripts'),
      script: 'team_sync_daemon.py',
      interpreter: 'python3',
      env: {
        PATH: `/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${process.env.PATH}`,
        AILCC_ROOT: AILCC_ROOT,
        RELAY_URL: 'http://localhost:3001/api/system/tasks',
        PYTHONPATH: '/Volumes/XDriveBeta/AILCC_PRIME/01_Areas/Codebases/ailcc/automations/integrations'
      },
      autorestart: true,
      max_memory_restart: '200M'
    }
  ]
};

