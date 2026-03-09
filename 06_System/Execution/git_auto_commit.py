import subprocess
import sys
import os

def run(cmd):
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return result.stdout.strip()

def auto_commit():
    status = run("git status -s")
    if not status:
        print("No changes to commit.")
        return

    # Get changed directories
    lines = status.split("\n")
    dirs = set()
    for line in lines:
        path = line[3:]
        parts = path.split("/")
        if len(parts) > 1:
            dirs.add(parts[0])
        else:
            dirs.add("root")

    for d in dirs:
        print(f"Commiting changes for: {d}")
        if d == "root":
            run("git add ./*.md ./*.json ./*.sh .gitignore 2>/dev/null")
            msg = "Chore: Update root configuration and docs"
        else:
            run(f"git add {d}/")
            msg = f"Feature/Chore: Intelligence update in {d}"
        
        # In a real scenario, this would call an LLM for message generation
        run(f'git commit -m "{msg}"')

if __name__ == "__main__":
    auto_commit()
