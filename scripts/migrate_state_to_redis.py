import json
import redis
import os
import sys

# Configuration
REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
STATE_FILES = [
    '01_Areas/Codebases/ailcc/dashboard/.alliance_memory.json',
    '01_Areas/Codebases/ailcc/dashboard/public/data/swarm_state.json',
    '01_Areas/Codebases/ailcc/dashboard/public/data/task_queue.json',
    '01_Areas/Codebases/ailcc/dashboard/public/data/live_status.json'
]

def migrate():
    try:
        r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)
        
        for state_file in STATE_FILES:
            if not os.path.exists(state_file):
                print(f"File {state_file} not found. Skipping.")
                continue

            print(f"Processing {state_file}...")
            try:
                with open(state_file, 'r') as f:
                    data = json.load(f)
                
                if isinstance(data, dict):
                    print(f"Migrating {len(data)} keys from {state_file} to Redis...")
                    for key, value in data.items():
                        if isinstance(value, (dict, list)):
                            r.set(key, json.dumps(value))
                        else:
                            r.set(key, str(value))
                else:
                    print(f"File {state_file} does not contain a dictionary. Migrating as raw string.")
                    key = os.path.basename(state_file).replace('.json', '')
                    r.set(key, json.dumps(data))
                
                print(f"Successfully migrated {state_file}")
            except Exception as e:
                print(f"Error processing {state_file}: {e}. This file might be corrupted.")

        print("Migration process finished.")

    except Exception as e:
        print(f"Error during migration: {e}")
        sys.exit(1)

if __name__ == "__main__":
    migrate()
