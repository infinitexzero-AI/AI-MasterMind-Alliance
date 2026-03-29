/**
 * Vanguard Swarm - Master Consolidation Matrix
 * Epoch 31: Sovereign OS Persistence Array
 * Defines the absolute PM2 background startup sequence for the explicit Swarm architecture.
 * Execution: `pm2 start ecosystem.config.js`
 */

const path = require('path');
const OS_ROOT = '/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc';

module.exports = {
  apps: [
    {
      name: 'vanguard_hn_poller',
      script: path.join(OS_ROOT, 'automations/integrations/hn_poller_daemon.py'),
      interpreter: 'python3',
      watch: false,
      autorestart: true,
      max_memory_restart: '100M',
      env: { NODE_ENV: 'production' }
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
      name: 'vanguard_taguette_bridge',
      script: path.join(OS_ROOT, 'automations/integrations/taguette_ingester.py'),
      interpreter: 'python3',
      watch: false,
      autorestart: true,
      max_memory_restart: '100M'
    },
    {
      name: 'vanguard_latex_typesetter',
      script: path.join(OS_ROOT, 'automations/infrastructure/latex_compiler_daemon.py'),
      interpreter: 'python3',
      watch: false,
      autorestart: true,
      max_memory_restart: '200M'
    },
    {
      name: 'vanguard_ics_scheduler',
      script: path.join(OS_ROOT, 'automations/integrations/moodle_ics_daemon.py'),
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
      autorestart: false, // Prevents infinite looping
      cron_restart: '0 4 * * *', // Trigger strictly at 04:00 AM locally
      max_memory_restart: '500M'
    }
  ]
};
