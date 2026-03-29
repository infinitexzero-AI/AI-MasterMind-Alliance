import os
import subprocess
import time
import json
import psutil
import redis
from datetime import datetime
from unified_event_bus import UnifiedEventBus

# Configuration
THRESHOLD_RAM_CRITICAL = 512   # MB (increased to provide more buffer)
THRESHOLD_RAM_WARNING = 1024  # MB
THRESHOLD_SWAP_PERCENT = 85   # %
THRESHOLD_HELPERS_MAX = 10    # Number of helper processes

class SystemSentinel:
    def __init__(self):
        self.bus = UnifiedEventBus()
        self.redis = redis.Redis(host='127.0.0.1', port=6379, db=0)
        self.base_path = "/Users/infinite27/AILCC_PRIME"
        self.log_path = os.path.join(self.base_path, "06_System/Logs/sentinel.log")
        os.makedirs(os.path.dirname(self.log_path), exist_ok=True)

    def log(self, message):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"[{timestamp}] [SENTINEL] {message}"
        print(log_entry)
        with open(self.log_path, "a") as f:
            f.write(log_entry + "\n")

    def get_free_ram(self):
        # Using vm_stat for accurate macOS free memory
        try:
            output = subprocess.check_output(['vm_stat']).decode('utf-8')
            for line in output.split('\n'):
                if 'Pages free' in line:
                    free_pages = int(line.split(':')[1].strip().replace('.', ''))
                    return (free_pages * 4096) / (1024 * 1024)
        except Exception as e:
            self.log(f"Error getting RAM: {e}")
            return 0

    def get_swap_info(self):
        try:
            output = subprocess.check_output(['sysctl', 'vm.swapusage']).decode('utf-8')
            # Handle variations like: vm.swapusage: total = 3072.00M  used = 2465.75M  free = 606.25M
            line = output.replace('vm.swapusage:', '').replace('=', '').strip()
            parts = line.split()
            # Expecting: ['total', '3072.00M', 'used', '2465.75M', 'free', '606.25M']
            total = float(parts[1].replace('M', '').replace('G', '000'))
            used = float(parts[3].replace('M', '').replace('G', '000'))
            percent = (used / total) * 100 if total > 0 else 0
            return used, total, percent
        except Exception as e:
            self.log(f"Error getting Swap (Output: {output.strip()}): {e}")
            return 0, 0, 0

    def get_helper_processes(self):
        helpers = []
        for proc in psutil.process_iter(['pid', 'name', 'create_time', 'memory_percent']):
            try:
                if "Antigravity Helper" in proc.info['name']:
                    helpers.append(proc.info)
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
        return helpers

    def mitigate_helpers(self, helpers):
        self.log(f"🛡️ Mitigating {len(helpers)} helper processes...")
        count = 0
        for proc in helpers:
            try:
                p = psutil.Process(proc['pid'])
                p.terminate()
                count += 1
            except Exception as e:
                self.log(f"Failed to kill PID {proc['pid']}: {e}")
        
        self.bus.emit(
            event_type="SENTINEL_ACTION",
            source="Sentinel",
            message=f"Terminated {count} ghost helper processes.",
            payload={"action": "PROCESS_KILL", "count": count},
            priority=2
        )

    def hard_mitigation(self):
        """Aggressive purge for sub-128MB RAM states"""
        self.log("☢️ CRITICAL PRESSURE: Engaging Hard Mitigation (Sub-128MB RAM)")
        
        # 1. Kill all non-essential Node processes (not the relay)
        protected_pids = [os.getpid(), 5529] # Self and Relay
        for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
            try:
                if proc.info['pid'] in protected_pids:
                    continue
                
                name = proc.info['name'].lower()
                cmdline = " ".join(proc.info['cmdline'] or []).lower()
                
                # Targets: Zombified helpers, bloated browser instances, or non-relay node scripts
                if "helper" in name or "chrome" in name or "node" in name or "electron" in name:
                    if "relay.js" not in cmdline and "sentinel" not in cmdline:
                        self.log(f"💀 Hard Purge: Killing {proc.info['name']} (PID {proc.info['pid']})")
                        proc.terminate()
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue

        # 2. Run system purge
        subprocess.run(["sudo", "purge"], stderr=subprocess.DEVNULL)
        
        self.bus.emit(
            event_type="SENTINEL_ALERT",
            source="Sentinel",
            message="Hard Mitigation engaged. System resetting non-essential kernels.",
            priority=1
        )

    def run_safe_cleanup(self):
        self.log("🧹 Running Safe Cleanup scripts...")
        cleanup_script = os.path.join(self.base_path, "06_System/Execution/performance_boost.sh")
        if os.path.exists(cleanup_script):
            subprocess.run(["bash", cleanup_script])
        
        # Purge caches
        subprocess.run(["sudo", "purge"], stderr=subprocess.DEVNULL)

    def monitor(self):
        self.log("🚀 Sentinel V4 Online - Monitoring Hardware State")
        
        while True:
            # Check dynamic configuration
            auto_pilot_raw = self.redis.get('ailcc:sentinel:auto_pilot')
            auto_pilot = auto_pilot_raw.decode('utf-8') == 'true' if auto_pilot_raw else True
            
            free_ram = self.get_free_ram()
            swap_used, swap_total, swap_pct = self.get_swap_info()
            helpers = self.get_helper_processes()
            
            # 1. RAM Check
            if free_ram < 128: # Hard floor
                self.log(f"☢️ EMERGENCY: RAM at {free_ram:.2f}MB")
                if auto_pilot:
                    self.hard_mitigation()
            elif free_ram < THRESHOLD_RAM_CRITICAL:
                self.log(f"🚨 CRITICAL RAM: {free_ram:.2f}MB")
                if auto_pilot:
                    self.run_safe_cleanup()
                else:
                    self.bus.emit("SENTINEL_ALERT", "Sentinel", f"Critical RAM: {free_ram:.0f}MB. Action needed.", priority=1)
            
            # 2. Swap Check
            if swap_pct > THRESHOLD_SWAP_PERCENT:
                self.log(f"⚠️ HIGH SWAP: {swap_pct:.1f}%")
                self.bus.emit("SENTINEL_ALERT", "Sentinel", f"Swap at {swap_pct:.1f}%. Restart recommended.", priority=2)

            # 3. Helper Check
            if len(helpers) > THRESHOLD_HELPERS_MAX:
                self.log(f"⚠️ EXCESS HELPERS: {len(helpers)}")
                if auto_pilot:
                    self.mitigate_helpers(helpers[THRESHOLD_HELPERS_MAX:])
                else:
                     self.bus.emit("SENTINEL_ALERT", "Sentinel", f"{len(helpers)} helpers running. Leak suspected.", priority=2)

            # Heartbeat for Dashboard
            self.bus.emit(
                event_type="SENTINEL_HEARTBEAT",
                source="Sentinel",
                message="Monitoring active.",
                payload={
                    "ram_free": free_ram,
                    "swap_pct": swap_pct,
                    "helpers": len(helpers),
                    "auto_pilot": auto_pilot
                },
                priority=4
            )

            time.sleep(10) # Faster polling during critical instability

if __name__ == "__main__":
    sentinel = SystemSentinel()
    sentinel.monitor()
