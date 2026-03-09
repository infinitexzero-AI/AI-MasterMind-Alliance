import os

# Nexus Pulse Aggregator
# Combines all files in the Claude Identity package into a single sync file.

SOURCE_DIR = "/Users/infinite27/AILCC_PRIME/06_System/Context_Packages/Claude_Identity_V1"
OUTPUT_FILE = "/Users/infinite27/AILCC_PRIME/06_System/Context_Packages/Claude_Identity_V1/CLAUDE_NEXUS_SYNC_FULL.md"

def aggregate():
    if not os.path.exists(SOURCE_DIR):
        print(f"❌ Source directory missing: {SOURCE_DIR}")
        return

    files = [
        "CLAUDE_PROJECT_IDENTITY.md",
        "AIMmA_SYSTEM_DOC.md",
        "SYSTEM_ARCHITECTURE.md",
        "CORTEX_SYSTEM_MAP.md",
        "task.md",
        "walkthrough.md",
        "STRATEGIC_HANDSHAKE.md",
        "IOS_TELEMETRY_BRIDGE.md",
        "IOS_MORNING_BRIEFING_PROTOCOL.md",
        "AI_MASTERMIND_ALLIANCE_MASTER_DEFINITION.md",
        "/Users/infinite27/AILCC_PRIME/AI-MasterMind-Alliance/02_Resources/Academics/HLTH-1011/HLTH1011_Focus_Group_Report_FINAL.md"
    ]

    print(f"🚀 Aggregating {len(files)} files into {OUTPUT_FILE}...")

    with open(OUTPUT_FILE, 'w') as out:
        out.write("# NEXUS PULSE: AI Mastermind Alliance\n\n")
        out.write(f"**Sync Date**: {os.popen('date').read().strip()}\n\n")
        out.write("**System Latency**: High-Fidelity\n\n")
        out.write("---\n\n")

        for filename in files:
            filepath = os.path.join(SOURCE_DIR, filename)
            if os.path.exists(filepath):
                print(f"  + Adding {filename}")
                with open(filepath, 'r') as f:
                    lines = f.readlines()
                    out.write(f"## FILE: {filename}\n\n")
                    
                    for line in lines:
                        # 1. Down-level H1 to H2 to avoid MD025
                        if line.startswith("# "):
                            line = "## " + line[2:]
                        elif line.startswith("## "):
                            line = "### " + line[3:]
                        
                        # 2. Standardize list bullets to dash to avoid MD004
                        if line.strip().startswith("* "):
                            line = line.replace("* ", "- ", 1)
                        
                        out.write(line)
                    
                    out.write("\n\n---\n\n")
            else:
                print(f"  ⚠️ Skipping {filename} (not found)")

    # 3. Post-process for spacing (MD012, MD032)
    with open(OUTPUT_FILE, 'r') as f:
        content = f.read()
    
    import re
    # Remove triple+ newlines
    content = re.sub(r'\n{3,}', '\n\n', content)
    # Ensure blank line before and after lists (MD032)
    content = re.sub(r'([^\n])\n( {0,}- )', r'\1\n\n\2', content)
    content = re.sub(r'( {0,}- [^\n]+)\n([^\n-])', r'\1\n\n\2', content)
    
    # Ensure blank line before and after headings (MD022)
    content = re.sub(r'([^\n])\n(#{1,6})', r'\1\n\n\2', content)
    content = re.sub(r'(#{1,6} [^\n]+)\n([^\n])', r'\1\n\n\2', content)
    
    with open(OUTPUT_FILE, 'w') as f:
        f.write(content.strip() + "\n")

    print("✅ Nexus Pulse Aggregation Complete with Lint Correction.")

if __name__ == "__main__":
    aggregate()
