#!/usr/bin/env python3
"""
error_monitor_daemon.py — Autonomous Log Interception & SRE
=============================================================================
Tails AILCC system logs (/tmp/relay.log, etc.) for fatal exceptions. 
When a crash or stack trace is detected, it funnels the crash context 
to the `neural_synapse` so the Orchestrator can spawn a debugging agent.
"""

import os
import json
import logging
import time
import re
from datetime import datetime
import subprocess

logging.basicConfig(level=logging.INFO, format="%(asctime)s [SRE Daemon] %(message)s")
logger = logging.getLogger(__name__)

# Fallback to local redis if config not set
import redis
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = os.getenv("REDIS_PORT", "6379")
redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)

class LogMonitor:
    def __init__(self, log_paths):
        self.log_paths = log_paths
        # Common fatal patterns across Node and Python
        self.fatal_patterns = [
            re.compile(r"Traceback \(most recent call last\):", re.IGNORECASE),
            re.compile(r"UnhandledPromiseRejectionWarning:", re.IGNORECASE),
            re.compile(r"Fatal error:", re.IGNORECASE),
            re.compile(r"ERROR - Exception in", re.IGNORECASE)
        ]

    def follow(self, file_path):
        """Generator that yields new lines in a file (similar to `tail -f`)"""
        try:
            with open(file_path, 'r') as f:
                # Seek to the end of the file so we only get *new* errors
                f.seek(0, 2)
                while True:
                    line = f.readline()
                    if not line:
                        time.sleep(0.5)
                        continue
                    yield line
        except FileNotFoundError:
            logger.warning(f"Log file not found (yet): {file_path}")
            while not os.path.exists(file_path):
                time.sleep(2)
            yield from self.follow(file_path)

    def monitor(self):
        logger.info(f"SRE Shield active. Monitoring: {self.log_paths}")
        
        # We use a simple subprocess `tail -f` multiplexer for ease of use across multiple files
        cmd = ["tail", "-F"] + self.log_paths
        try:
            process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            
            error_buffer = []
            capturing_trace = False
            last_source = "System"

            while True:
                line = process.stdout.readline()
                if not line:
                    time.sleep(0.1)
                    continue

                line_stripped = line.strip()

                # If it's a tail file header, e.g., ==> /tmp/relay.log <==
                if line_stripped.startswith("==>") and line_stripped.endswith("<=="):
                    last_source = line_stripped.replace("==>", "").replace("<==", "").strip()
                    continue

                is_fatal = any(pat.search(line_stripped) for pat in self.fatal_patterns)
                
                if is_fatal:
                    capturing_trace = True
                    error_buffer = [line_stripped]
                    logger.warning(f"Intercepted FATAL Exception in {last_source}. Capturing stack trace...")
                    continue
                
                if capturing_trace:
                    # If line is indented or looks like part of a stack trace, grab it
                    if line.startswith(" ") or line.startswith("\t") or "Error:" in line or "  at " in line or 'File "' in line:
                        error_buffer.append(line_stripped)
                    else:
                        # End of stack trace block
                        self.dispatch_error(last_source, "\n".join(error_buffer))
                        capturing_trace = False
                        error_buffer = []

        except KeyboardInterrupt:
            logger.info("SRE Monitor terminating.")
            process.terminate()

    def dispatch_error(self, source, stack_trace):
        """Sends the intercepted trace to the Orchestrator via Redis PubSub."""
        payload = {
            "signal_id": f"sre_alert_{int(time.time())}",
            "source": "SRE_MONITOR",
            "type": "SYSTEM_ERROR",
            "severity": "CRITICAL",
            "message": f"Crash detected in {source}",
            "timestamp": datetime.now().isoformat(),
            "metadata": {
                "trace": stack_trace,
                "log_file": source
            }
        }
        try:
            redis_client.publish('neural_synapse', json.dumps(payload))
            logger.info(f"Dispatched crash triage request to Orchestrator.")
        except Exception as e:
            logger.error(f"Failed to publish SRE Alert: {e}")

if __name__ == "__main__":
    logs_to_watch = [
        "/tmp/relay.log",
        "/tmp/orchestrator.log",
        "/tmp/dashboard.log",
        os.path.join(os.getcwd(), 'system.log')
    ]
    monitor = LogMonitor(logs_to_watch)
    monitor.monitor()
