#!/bin/bash
# Step 2: verify_paths.sh
# Audits all scripts in AILCC_PRIME for hardcoded legacy paths.

ROOT="/Users/infinite27/AILCC_PRIME"
LEGACY_PATHS=("/Users/infinite27/Documents" "/Users/infinite27/Antigravity" "/Users/infinite27/AIMmA")

printf "\n\033[1;36m🔍 AUDITING SYSTEM PATHS...\033[0m\n"

for path in "${LEGACY_PATHS[@]}"; do
    printf "\nChecking for legacy path: \033[1;33m$path\033[0m\n"
    # Find files excluding node_modules and .git
    grep -r "$path" "$ROOT" --exclude-dir={node_modules,.git} | grep -v "verify_paths.sh"
done

printf "\n\033[1;32m✅ Path Audit Complete.\033[0m\n"
