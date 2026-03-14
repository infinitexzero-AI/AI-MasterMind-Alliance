import os
import sys
import subprocess
import urllib.request
import json
import ssl

# Bypass macOS local certifi issues
ssl._create_default_https_context = ssl._create_unverified_context

# Locate the dashboard .env.local to steal the OpenAI API key securely
ENV_PATH = "/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/dashboard/.env.local"
OPENAI_API_KEY = None

if os.path.exists(ENV_PATH):
    with open(ENV_PATH, 'r') as f:
        for line in f:
            if line.startswith("OPENAI_API_KEY="):
                OPENAI_API_KEY = line.strip().split('=', 1)[1].strip('"\'')
                break

if not OPENAI_API_KEY:
    print("❌ OPENAI_API_KEY not found in dashboard/.env.local")
    sys.exit(1)

# Ensure files are staged
status = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True).stdout.strip()
if not status:
    print("⚠️ No staged or unstaged changes found.")
    sys.exit(0)

# Stage all changes natively 
subprocess.run(["git", "add", "-A"])

# Grab the raw code diff
diff = subprocess.run(["git", "diff", "--cached"], capture_output=True, text=True).stdout.strip()

if not diff:
    print("⚠️ No diff generated.")
    sys.exit(0)

# Protect against massive diffs breaking the prompt limits
MAX_DIFF_LENGTH = 15000
if len(diff) > MAX_DIFF_LENGTH:
    diff = diff[:MAX_DIFF_LENGTH] + "\n...[DIFF TRUNCATED]"

print("🧠 Synthesizing Intelligent Git Commit via AILCC Core...")

prompt = f"""You are an elite Staff Software Engineer writing a Git commit message.
Analyze the following git diff and write a concise, professional, and conventional commit message.
Use the format: type(scope): description. Include a brief bulleted list of the technical rationale.
Do NOT wrap the output in markdown code blocks. Just output the raw message string.

# RAW GIT DIFF:
{diff}
"""

req_data = {
    "model": "gpt-4o-mini",
    "messages": [
        {"role": "system", "content": "You are the AILCC Nexus Git Intelligence core."},
        {"role": "user", "content": prompt}
    ],
    "max_tokens": 300,
    "temperature": 0.3
}

req = urllib.request.Request(
    url="https://api.openai.com/v1/chat/completions",
    data=json.dumps(req_data).encode("utf-8"),
    headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {OPENAI_API_KEY}"
    }
)

try:
    response = urllib.request.urlopen(req)
    result = json.loads(response.read().decode("utf-8"))
    commit_msg = result["choices"][0]["message"]["content"].strip()
except Exception as e:
    print(f"❌ LLM API Error: {e}. Falling back to standard commit message.")
    commit_msg = f"Auto-Commit: Updates across {len(diff.splitlines())} modified lines."

print("\n--- GENERATED COMMIT MESSAGE ---")
print(commit_msg)
print("--------------------------------\n")

print("⚡ Applying commit...")
subprocess.run(["git", "commit", "-m", commit_msg])

print("🚀 Automatic Push Triggered...")
subprocess.run(["git", "push"])

print("✅ Git Intelligence Payload Deployed Successfully.")
