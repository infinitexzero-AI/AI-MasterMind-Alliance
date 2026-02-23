import os
import json
import redis
import sys
from pathlib import Path

# Connect to the Redis container (mapped to localhost:6379 natively)
REDIS_HOST = "localhost"
REDIS_PORT = 6379

print("🔱 Initiating AILCC State-to-Redis Migration Pipeline...")

try:
    r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)
    r.ping()
    print(f"✅ Fast-connected to Redis at {REDIS_HOST}:{REDIS_PORT}")
except redis.ConnectionError:
    print(f"❌ Could not connect to Redis at {REDIS_HOST}:{REDIS_PORT}. Is the container running?")
    sys.exit(1)

# Define the local state files that need to be pushed to Redis
STATE_FILES = {
    "system_mode_memory": "/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/dashboard/src/lib/mode6/mode6_memory.json",
    "system_mode_archive": "/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/dashboard/src/lib/mode6/mode6_archive.json",
    "system_mode_semantic": "/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/dashboard/src/lib/mode6/mode6_semantic.json"
}

def migrate_file_to_redis(redis_key, file_path):
    path = Path(file_path)
    if not path.exists():
        print(f"⚠️ Warning: Target state file not found: {file_path}")
        return False

    try:
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        # Serialize back to a string for Redis storage
        payload = json.dumps(data)
        r.set(redis_key, payload)
        
        print(f"✅ Successfully migrated state '{redis_key}' to Redis. ({len(payload)} bytes)")
        return True
    except json.JSONDecodeError:
        print(f"❌ Error decoding JSON in {file_path}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error reading {file_path}: {e}")
        return False

success_count = 0
for redis_key, file_path in STATE_FILES.items():
    if migrate_file_to_redis(redis_key, file_path):
        success_count += 1

print(f"\n📊 Migration Report: {success_count}/{len(STATE_FILES)} state files successfully persisted to Redis.")
print("🔱 Migration Complete.")
