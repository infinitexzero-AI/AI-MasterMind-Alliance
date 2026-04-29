/**
 * Vanguard Swarm - Master Consolidation Matrix
 * Epoch 31: Sovereign OS Persistence Array
 * Combined Dashboard, Relay, and Vanguard Daemons.
 */

const path = require('path');
const AILCC_ROOT = '/Volumes/XDriveBeta/AILCC_PRIME';
const OS_ROOT = path.join(AILCC_ROOT, '01_Areas/Codebases/ailcc');

module.exports = {
  apps: [
    // --- CORE INFRASTRUCTURE ---
    {
      name: 'nexus-dashboard',
      cwd: path.join(AILCC_ROOT, 'nexus-dashboard'),
      script: 'npm',
      args: 'run dev -- --port 3008',
      env: {
        PORT: 3008,
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
        PORT: 3001,
        REDIS_BYPASS: 'true',
        AILCC_ROOT: AILCC_ROOT
      },
      autorestart: true,
      max_memory_restart: '400M'
    },
    // --- VANGUARD DAEMONS ---
    {
      name: 'vanguard_hn_poller',
      script: path.join(OS_ROOT, 'automations/integrations/hn_poller_daemon.py'),
      interpreter: 'python3',
      watch: false,
      autorestart: true,
      max_memory_restart: '100M'
    },
    {
      name: 'vanguard_zotero_sync',
      script: path.join(OS_ROOT, 'automations/integrations/zotero_poller_daemon.py'),
      interpreter: 'python3',
      watch: false,
      autorestart: true,
      max_memory_restart: '150M'
    },
    {
      name: 'vanguard_arxiv_crawler',
      script: path.join(OS_ROOT, 'automations/integrations/arxiv_recursive_daemon.py'),
      interpreter: 'python3',
      watch: false,
      autorestart: true,
      max_memory_restart: '100M'
    },
    {
      name: 'vanguard_vault_backup',
      script: path.join(OS_ROOT, 'automations/infrastructure/vault_backup_daemon.py'),
      interpreter: 'python3',
      watch: false,
      autorestart: false,
      cron_restart: '0 4 * * *',
      max_memory_restart: '500M'
    },
    // --- SYSTEM UTILITIES ---
    {
      name: 'memory-watchdog',
      script: path.join(AILCC_ROOT, 'scripts/memory_watchdog_hardened.sh'),
      interpreter: 'bash',
      autorestart: true
    }
  ]
};
