#!/bin/bash

# Antigravity Sovereign Health Check v1.2
# Enforces the Antigravity Storage Protocol v1 across all alliance hardware.
#
# MISSION: Maintain a weightless, optimized, and sovereign ecosystem globally.
# OPTIMIZATION: Uses taskpolicy and nice for zero-impact background performance.

PRIMARY_VOL="/Volumes/XDriveBeta/AILCC_PRIME"
SECONDARY_VOL="/Volumes/XDriveAlpha"
SCAN_ALL=false

# Handle Arguments
for arg in "$@"; do
    if [[ "$arg" == "--all" ]] || [[ "$arg" == "-a" ]]; then
        SCAN_ALL=true
    fi
done

function run_check() {
    local TARGET_DIR=$1
    local VOL_NAME=$2
    local IS_PRIMARY=$3

    echo ">>> SCANNING VOLUME: $VOL_NAME ($TARGET_DIR)"
    
    # 1. DISK SPACE MONITORING
    echo "[*] Monitoring Disk Space..."
    df -h "$TARGET_DIR" | awk 'NR==2 {print "    - Size:   " $2 "\n    - Used:   " $3 "\n    - Avail:  " $4 "\n    - Use%:   " $5}'

    # 2. THROTTLED ZERO-BYTE PRUNING
    echo "[*] Pruning Zero-Byte Files (Background Priority)..."
    # Use taskpolicy -c background and nice -n 19 to prevent CPU/IO lag
    taskpolicy -c background nice -n 19 find "$TARGET_DIR" -type f -size 0 \
        ! -path "*/.git/*" \
        ! -path "*/node_modules/*" \
        ! -name ".localized" \
        -delete -print | sed 's/^/    - Deleted: /'

    # 3. PARA AUDIT (Root Compliance)
    echo "[*] Auditing Root for PARA Violations..."
    if [ "$IS_PRIMARY" = true ]; then
        SCATTERED=$(ls -F "$TARGET_DIR" | grep -v "/" | grep -vE "package.json|tsconfig.json|README.md|ecosystem.config.js|ANTIGRAVITY_CORE_V1.md|LICENSE")
    else
        SCATTERED=$(ls -F "$TARGET_DIR" | grep -v "/" | grep -vE "package.json|ANTIGRAVITY_CORE_V1.md|LICENSE|.DS_Store")
    fi

    if [ ! -z "$SCATTERED" ]; then
        echo "    [!] FOUND SCATTERED FILES IN ROOT:"
        echo "$SCATTERED" | sed 's/^/    - /'
    else
        echo "    [+] Root status: WEIGHTLESS"
    fi

    # 4. EVACUATION CLUSTER DETECTION (Specific to Alpha/Secondary)
    if [ "$IS_PRIMARY" = false ]; then
        EVACS=$(ls "$TARGET_DIR" | grep "AILCC_Evacuation" | wc -l | xargs)
        if [ "$EVACS" -gt 0 ]; then
            echo "    [!] DETECTED $EVACS EVACUATION FOLDERS. Candidates for Consolidation."
        fi
    fi
    echo ""
}

echo "=============================================="
echo "   ANTIGRAVITY SOVEREIGN HEALTH CHECK v1.2    "
echo "=============================================="
date

# Execute Checks with Background Priority
run_check "$PRIMARY_VOL" "XDriveBeta" true

if [ "$SCAN_ALL" = true ] && [ -d "$SECONDARY_VOL" ]; then
    run_check "$SECONDARY_VOL" "XDriveAlpha" false
fi

echo "=============================================="
echo "Health Check Complete. Heartbeat."
