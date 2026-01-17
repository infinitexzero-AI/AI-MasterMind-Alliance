#!/usr/bin/env python3
import sys
import json
import struct
import subprocess
import os

# Native Messaging Protocol:
# Chrome sends: [4 bytes length][json message]
# Host sends: [4 bytes length][json message]
# https://developer.chrome.com/docs/extensions/develop/concepts/native-messaging

def read_message():
    raw_length = sys.stdin.buffer.read(4)
    if len(raw_length) == 0:
        return None
    message_length = struct.unpack('@I', raw_length)[0]
    message = sys.stdin.buffer.read(message_length).decode('utf-8')
    return json.loads(message)

def send_message(message_content):
    encoded_content = json.dumps(message_content).encode('utf-8')
    encoded_length = struct.pack('@I', len(encoded_content))
    sys.stdout.buffer.write(encoded_length)
    sys.stdout.buffer.write(encoded_content)
    sys.stdout.buffer.flush()

def get_system_stats():
    # Simple stats using standard tools to avoid dependencies
    try:
        mem = subprocess.check_output(['vm_stat']).decode('utf-8')
        disk = subprocess.check_output(['df', '-h', '/']).decode('utf-8')
        return {"memory_raw": mem[:200], "disk_raw": disk}
    except Exception as e:
        return {"error": str(e)}

def launch_docker():
    # Only if not running
    try:
        subprocess.Popen(['open', '-a', 'Docker'])
        return {"status": "Docker launch signal sent"}
    except Exception as e:
        return {"error": str(e)}

def execute_script(script_name):
    # Security: Ensure script name is simple and exists in scripts dir
    safe_name = os.path.basename(script_name)
    script_path = os.path.join(os.path.dirname(__file__), 'scripts', safe_name)
    
    if not os.path.exists(script_path):
        return {"error": f"Script not found: {safe_name}"}
        
    try:
        # Run AppleScript via osascript
        result = subprocess.check_output(['osascript', script_path]).decode('utf-8')
        return {"status": "Executed", "output": result.strip()}
    except Exception as e:
        return {"error": str(e)}

def handle_command(cmd, payload):
    if cmd == "PING":
        return {"response": "PONG - System Bridge Active"}
    elif cmd == "GET_SYSTEM_STATS":
        return {"response": get_system_stats()}
    elif cmd == "LAUNCH_DOCKER":
        return {"response": launch_docker()}
    elif cmd == "EXECUTE_SCRIPT":
        script_name = payload.get('script')
        return {"response": execute_script(script_name)}
    elif cmd == "ACTIVATE_AUTOMATION":
        # Launches the unified start_system.sh script
        script_path = "/Users/infinite27/AILCC_PRIME/start_system.sh"
        try:
            # Open in a new Terminal window so the user can see output/sudo prompts if needed
            subprocess.Popen(['open', '-a', 'Terminal', script_path])
            return {"status": "Automation Sequence Initiated"}
        except Exception as e:
            return {"error": str(e)}
    elif cmd == "READ_CONTEXT":
        # Reads key artifacts to provide grounding for the AI
        try:
            home = os.path.expanduser("~")
            # Brain ID path finding could be dynamic but hardcoded for safety in this version
            # Assuming the path provided in user metadata or finding the active task.md
            # For robustness, we will try the known active path from previous turns
            base_dir = os.path.join(home, ".gemini/antigravity/brain/3a387d3c-19f1-46a0-b82f-7bc4f27ff3c6")
            
            task_path = os.path.join(base_dir, "task.md")
            walkthrough_path = os.path.join(base_dir, "walkthrough.md")
            
            context_data = ""
            if os.path.exists(task_path):
                with open(task_path, 'r') as f:
                    context_data += f"=== TASK.MD ===\n{f.read()}\n\n"
            
            if os.path.exists(walkthrough_path):
                with open(walkthrough_path, 'r') as f:
                    context_data += f"=== WALKTHROUGH.MD ===\n{f.read()}\n\n"
            
            if not context_data:
                return {"error": "Context files not found."}

            return {"response": {"context": context_data[:50000]}} # Limit size for safety
        except Exception as e:
            return {"error": str(e)}
    else:
        return {"error": "Unknown command"}

def main():
    while True:
        try:
            message = read_message()
            if message is None:
                break # End of stream
            
            command = message.get('command')
            payload = message.get('payload', {})
            
            response = handle_command(command, payload)
            send_message(response)
            
        except Exception as e:
            # Fatal error, try to send one last message
            send_message({"error": f"Bridge crash: {str(e)}"})
            break

if __name__ == '__main__':
    main()
