module.exports = {
  apps: [
    {
      name: 'canmeds-daemon',
      script: 'core/medical/canmeds_daemon.py',
      interpreter: 'python3',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '150M',
      exp_backoff_restart_delay: 100,
      env: {
        PYTHONUNBUFFERED: "1"
      },
      error_file: './logs/canmeds-daemon-error.log',
      out_file: './logs/canmeds-daemon-out.log',
      merge_logs: true,
      time: true
    },
    {
      name: 'hn-poller',
      script: 'automations/integrations/hn_poller.py',
      interpreter: 'python3',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '150M',
      exp_backoff_restart_delay: 100,
      env: {
        PYTHONUNBUFFERED: "1"
      },
      error_file: './logs/hn-poller-error.log',
      out_file: './logs/hn-poller-out.log',
      merge_logs: true,
      time: true
    },
    {
      name: 'zotero-poller',
      script: 'automations/integrations/zotero_poller_daemon.py',
      interpreter: 'python3',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '200M',  // Zotero might need slightly more RAM overhead
      exp_backoff_restart_delay: 100,
      env: {
        PYTHONUNBUFFERED: "1"
      },
      error_file: './logs/zotero-poller-error.log',
      out_file: './logs/zotero-poller-out.log',
      merge_logs: true,
      time: true
    },
    {
      name: 'singularity-engine',
      script: 'core/singularity_engine_daemon.py',
      interpreter: 'python3',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',  // Heavy Inference Load / Git Extraction
      exp_backoff_restart_delay: 100,
      env: {
        PYTHONUNBUFFERED: "1"
      },
      error_file: './logs/singularity-error.log',
      out_file: './logs/singularity-out.log',
      merge_logs: true,
      time: true
    }
  ]
};
