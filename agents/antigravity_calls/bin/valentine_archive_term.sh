#!/bin/zsh
# valentine_archive_term.sh
# Antigravity / Valentine System Triage — Term Archive Automation
# Version: 0.1.0 (2026-05-26)
# Author: Antigravity (Grok-assisted)
#
# Purpose: Safely archive an academic term (or other logical bucket) from hot/warm
#          storage (OneDrive Academic _ARCHIVE_Past_Terms or similar) to cold
#          (Google Drive via rclone preferred) with full audit trail.
#
# Spec source: docs/05_Templates/valentine_cloud_storage_triage_strategy.md
#              (section 4.A + risks + 6-day checklist)
#
# Alignment targets:
#   - Daily storage snapshot blocks (pre/post manifests for delta visibility)
#   - _SYSTEM/_MANIFESTS/ dated logs (machine + human readable)
#   - Vanguard sprint pack/academic blocks (small-batch, dry-run first)
#   - Valentine router dispatch + valentine-core daily-sprint hooks (future)
#
# Safety contract (non-negotiable):
#   - --dry-run is the default and strongly encouraged for first runs.
#   - Never recursive deep scans on File Provider mounts during automation.
#   - Always generate manifest + provenance before any move.
#   - rclone (when present) with --checksum, --dry-run, --max-depth where possible.
#   - Small batches only during move window. Human spot-check after each.
#   - Fallback to safe zsh mv only for same-volume or explicitly local paths.
#
# Usage:
#   valentine_archive_term.sh --term "2025_Fall" \
#       --source "/path/to/OneDrive/Academic/_ARCHIVE_Past_Terms/2025_Fall" \
#       --dest "gdrive:AILCC_ARCHIVE/Academic/2025_Fall" \
#       [--dry-run] [--execute] [--manifest-dir /path] [--obsidian-daily /path/to/note.md]
#
#   valentine_archive_term.sh --help
#
# Recommended daily block sequence (see storage_daily_snapshot.sh):
#   1. storage_daily_snapshot.sh --pre-archive
#   2. valentine_archive_term.sh ... --dry-run   (review output + manifest)
#   3. valentine_archive_term.sh ... --execute   (small term only)
#   4. storage_daily_snapshot.sh --post-archive  (delta in _MANIFESTS/)
#
# Exit codes:
#   0 = success (or clean dry-run)
#   1 = usage / arg error
#   2 = safety / preflight failure (rclone missing when required, path issues)
#   3 = manifest write failure
#   4 = move/verify failure (after manifest)

set -euo pipefail

# --- Configuration & Defaults -------------------------------------------------
SCRIPT_VERSION="0.1.0"
SCRIPT_NAME="valentine_archive_term.sh"
DATE_ISO=$(date +%F)
DATE_FULL=$(date -Iseconds 2>/dev/null || date +"%Y-%m-%dT%H:%M:%S%z")

# Try to find the AILCC workspace root (git preferred)
WORKSPACE_ROOT=""
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    WORKSPACE_ROOT=$(git rev-parse --show-toplevel)
elif [[ -d "/Volumes/XDriveBeta/AILCC_PRIME" ]]; then
    WORKSPACE_ROOT="/Volumes/XDriveBeta/AILCC_PRIME"
elif [[ -d "$HOME/AILCC_PRIME" ]]; then
    WORKSPACE_ROOT="$HOME/AILCC_PRIME"
fi

# Default OneDrive Academic root (can be overridden via --source)
DEFAULT_ONEDRIVE_ACADEMIC="$HOME/Library/CloudStorage/OneDrive-MountAllisonUniversity"

# Default manifest location (created if missing)
DEFAULT_MANIFEST_DIR="${DEFAULT_ONEDRIVE_ACADEMIC}/_SYSTEM/_MANIFESTS"

# rclone remote name for Google (as configured in strategy)
RCLONE_REMOTE="gdrive"

# --- Helpers ------------------------------------------------------------------
print_usage() {
    cat <<EOF
$SCRIPT_NAME v$SCRIPT_VERSION — Valentine Term Archive (Antigravity)

USAGE:
  $SCRIPT_NAME --term <TERM> --source <PATH> --dest <RCLONE_OR_PATH> [OPTIONS]

REQUIRED:
  --term, -t      Logical term/bucket identifier (e.g. "2025_Fall", "MATH-1151")
  --source, -s    Source directory (usually under Academic _ARCHIVE_Past_Terms)
  --dest, -d      Destination (rclone remote:path or local path)

OPTIONS:
  --dry-run       (default) Show exactly what would happen; no changes
  --execute       Actually perform the archive (after review)
  --manifest-dir  Override manifest output directory
  --obsidian-daily <PATH>  Append one-line provenance note to this daily note
  --no-provenance  Skip xattr / tag provenance on archived items
  --help, -h      This help
  --version       Print version and exit

EXAMPLES:
  # Safe preview (recommended first run)
  $SCRIPT_NAME --term "2025_Fall" \\
      --source "\$HOME/Library/CloudStorage/OneDrive-MountAllisonUniversity/_ARCHIVE_Past_Terms/2025_Fall" \\
      --dest "gdrive:AILCC_ARCHIVE/Academic/2025_Fall" --dry-run

  # Real move (small batch only, after dry-run review + snapshot)
  $SCRIPT_NAME --term "2025_Fall" ... --execute

SAFETY NOTES (per Valentine strategy):
  - Always run with --dry-run first.
  - Use storage_daily_snapshot.sh before/after for deltas.
  - Never run against live _ACTIVE_2026_Summer without extra confirmation.
  - rclone preferred for cross-cloud moves (checksum verify).
  - Keep XDriveBeta or external as physical buffer during June 1 move window.

See: docs/05_Templates/valentine_cloud_storage_triage_strategy.md (sections 4 & 5)
     docs/05_Tasks/Vanguard_Swarm_Tactical_Sprint_Plan_May26-June1_2026.md
EOF
}

die() {
    echo "ERROR: $*" >&2
    exit 1
}

log() {
    echo "[$(date +%H:%M:%S)] $*"
}

# --- Argument Parsing ---------------------------------------------------------
DRY_RUN=true
EXECUTE=false
TERM=""
SOURCE=""
DEST=""
MANIFEST_DIR=""
OBSIDIAN_DAILY=""
NO_PROVENANCE=false

while [[ $# -gt 0 ]]; do
    case "$1" in
        -t|--term)          TERM="$2"; shift 2 ;;
        -s|--source)        SOURCE="$2"; shift 2 ;;
        -d|--dest)          DEST="$2"; shift 2 ;;
        --dry-run)          DRY_RUN=true; EXECUTE=false; shift ;;
        --execute)          EXECUTE=true; DRY_RUN=false; shift ;;
        --manifest-dir)     MANIFEST_DIR="$2"; shift 2 ;;
        --obsidian-daily)   OBSIDIAN_DAILY="$2"; shift 2 ;;
        --no-provenance)    NO_PROVENANCE=true; shift ;;
        -h|--help)          print_usage; exit 0 ;;
        --version)          echo "$SCRIPT_NAME v$SCRIPT_VERSION"; exit 0 ;;
        *) die "Unknown argument: $1 (use --help)" ;;
    esac
done

[[ -n "$TERM" && -n "$SOURCE" && -n "$DEST" ]] || die "--term, --source, and --dest are required"

# Normalize paths
SOURCE="${SOURCE/#\~/$HOME}"
DEST="${DEST/#\~/$HOME}"

# Resolve manifest dir
if [[ -z "$MANIFEST_DIR" ]]; then
    if [[ -d "$DEFAULT_ONEDRIVE_ACADEMIC/_SYSTEM/_MANIFESTS" ]]; then
        MANIFEST_DIR="$DEFAULT_ONEDRIVE_ACADEMIC/_SYSTEM/_MANIFESTS"
    else
        MANIFEST_DIR="${WORKSPACE_ROOT:-$HOME}/_VALENTINE_MANIFESTS"
    fi
fi
mkdir -p "$MANIFEST_DIR" 2>/dev/null || true

MANIFEST_FILE="$MANIFEST_DIR/archive_${DATE_ISO}_${TERM}.log"
SUMMARY_FILE="$MANIFEST_DIR/archive_${DATE_ISO}_${TERM}.summary.md"

# --- Preflight ----------------------------------------------------------------
log "=== Valentine Archive Term v$SCRIPT_VERSION ==="
log "Term:        $TERM"
log "Source:      $SOURCE"
log "Dest:        $DEST"
log "Dry-run:     $DRY_RUN"
log "Manifests:   $MANIFEST_FILE"
log "Workspace:   ${WORKSPACE_ROOT:-unknown}"

if [[ ! -d "$SOURCE" ]]; then
    die "Source directory does not exist: $SOURCE"
fi

# rclone detection
RCLONE_CMD=""
if command -v rclone >/dev/null 2>&1; then
    RCLONE_CMD=$(command -v rclone)
    log "rclone:      $RCLONE_CMD (preferred for cross-cloud)"
else
    log "rclone:      NOT FOUND — will use zsh fallback (same-volume only recommended)"
fi

# Warn if trying to archive from active hot tier without confirmation
if [[ "$SOURCE" == *"_ACTIVE_2026_Summer"* ]]; then
    echo "WARNING: Source appears to be inside _ACTIVE_2026_Summer (hot tier)."
    echo "         This is unusual. Re-confirm you intend to cold-archive active work."
fi

# --- Manifest Generation (always happens, even in dry-run) --------------------
generate_manifest() {
    local outfile="$1"
    local mode="$2"   # "DRY-RUN" or "EXECUTED"

    {
        echo "# Valentine Archive Manifest"
        echo "term: $TERM"
        echo "date: $DATE_FULL"
        echo "script: $SCRIPT_NAME v$SCRIPT_VERSION"
        echo "host: $(hostname -s 2>/dev/null || echo unknown)"
        echo "user: $USER"
        if [[ -n "$WORKSPACE_ROOT" && -d "$WORKSPACE_ROOT/.git" ]]; then
            echo "git_commit: $(git -C "$WORKSPACE_ROOT" rev-parse --short HEAD 2>/dev/null || echo 'n/a')"
            echo "git_branch: $(git -C "$WORKSPACE_ROOT" rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'n/a')"
        fi
        echo "mode: $mode"
        echo "source: $SOURCE"
        echo "dest: $DEST"
        echo ""
        echo "## Source Tree (shallow — safety constraint)"
        # Shallow only — never deep find on cloud mounts
        (cd "$SOURCE" && find . -maxdepth 2 -print 2>/dev/null | sort) || echo "(find limited for safety)"
        echo ""
        echo "## Top-level Size Summary (trusted du -sh)"
        du -sh "$SOURCE"/* 2>/dev/null | sort -h || echo "(du unavailable or restricted)"
        echo ""
        echo "## Provenance"
        echo "valentine:archived=$DATE_FULL;term=$TERM;script=$SCRIPT_NAME;mode=$mode"
        echo ""
        echo "## Planned / Executed Operations"
    } > "$outfile"

    log "Manifest written: $outfile"
}

generate_manifest "$MANIFEST_FILE" "$([[ $DRY_RUN == true ]] && echo DRY-RUN || echo EXECUTED)"

# --- Core Archive Logic -------------------------------------------------------
perform_archive() {
    local src="$1"
    local dst="$2"
    local is_dry="$3"

    if [[ "$dst" == gdrive:* || "$dst" == rclone:* || -n "$RCLONE_CMD" ]]; then
        # rclone path
        if [[ -z "$RCLONE_CMD" ]]; then
            die "rclone required for Google destinations but not found in PATH. Install per strategy or use local dest."
        fi

        local rclone_args=(--checksum --progress --stats-one-line -v)
        if [[ "$is_dry" == "true" ]]; then
            rclone_args+=(--dry-run)
        fi

        log "Using rclone: $RCLONE_CMD move \"$src\" \"$dst\" ${rclone_args[*]}"
        "$RCLONE_CMD" move "$src" "$dst" "${rclone_args[@]}" || {
            log "rclone move reported issues (see output above)"
            return 4
        }

        if [[ "$is_dry" != "true" ]]; then
            # Best-effort verify (list on remote)
            "$RCLONE_CMD" ls "$dst" --max-depth 1 2>/dev/null | head -20 || true
        fi
    else
        # Local / same-volume fallback (use with extreme caution across providers)
        log "WARNING: Using zsh fallback mv (no checksum verify across cloud providers)"
        if [[ "$is_dry" == "true" ]]; then
            log "(dry) would mv -v \"$src\"/* \"$dst/\""
        else
            mkdir -p "$dst"
            mv -v "$src"/* "$dst/" || return 4
        fi
    fi
}

# Record provenance on source items (best effort, non-fatal)
apply_provenance() {
    local path="$1"
    if $NO_PROVENANCE; then return 0; fi
    if command -v xattr >/dev/null 2>&1; then
        xattr -w "valentine:archived" "$DATE_FULL" "$path" 2>/dev/null || true
        xattr -w "valentine:term" "$TERM" "$path" 2>/dev/null || true
    fi
}

# --- Execute or Dry-Run -------------------------------------------------------
if $DRY_RUN; then
    log "=== DRY RUN MODE (no changes will be made) ==="
    generate_manifest "$MANIFEST_FILE" "DRY-RUN"
    echo ""
    echo "Planned operations (review this + manifest before --execute):"
    echo "  Source contents would be moved to: $DEST"
    echo "  Manifest: $MANIFEST_FILE"
    echo ""
    echo "Next recommended steps per strategy:"
    echo "  1. Review the manifest and dry-run output above."
    echo "  2. Run storage_daily_snapshot.sh --pre (if available) for baseline."
    echo "  3. Re-run this command with --execute only on small, verified terms."
    echo "  4. Run post-archive snapshot for delta."
else
    log "=== EXECUTE MODE ==="
    echo "CONFIRM: About to archive '$TERM' from '$SOURCE' to '$DEST'"
    echo "This is irreversible without restore from cold storage."
    read -q "?Proceed? (y/N) " || { echo; die "Aborted by user"; }
    echo

    perform_archive "$SOURCE" "$DEST" "false" || die "Archive operation failed (see above)"

    # Post-move provenance on destination where possible (light)
    if [[ -d "$DEST" ]]; then
        apply_provenance "$DEST"
    fi

    log "Archive completed for term: $TERM"
fi

# --- Obsidian / Log Append (best effort) --------------------------------------
if [[ -n "$OBSIDIAN_DAILY" && -f "$OBSIDIAN_DAILY" ]]; then
    {
        echo "- [$(date +%H:%M)] Valentine: archived term '$TERM' via $SCRIPT_NAME (mode: $([[ $DRY_RUN == true ]] && echo dry-run || echo executed)) → $DEST"
    } >> "$OBSIDIAN_DAILY"
    log "Appended to Obsidian daily: $OBSIDIAN_DAILY"
fi

# --- Summary ------------------------------------------------------------------
cat > "$SUMMARY_FILE" <<EOF
# Archive Summary — $TERM — $DATE_ISO

**Script**: $SCRIPT_NAME v$SCRIPT_VERSION  
**Mode**: $([[ $DRY_RUN == true ]] && echo "DRY-RUN (review only)" || echo "EXECUTED")  
**Source**: $SOURCE  
**Dest**: $DEST  
**Manifest**: $MANIFEST_FILE  

## Next Actions (per Vanguard Sprint + Valentine checklist)
- Run storage_daily_snapshot.sh (pre + post) and diff manifests in _MANIFESTS/
- Spot-check a few files in destination (especially if using fallback mv)
- Update sprint plan with GB reclaimed and terms archived
- Commit this manifest + summary to git (ThinkPad sync)

## Risks Acknowledged
- See strategy.md § Risks & Mitigations (hydration, Obsidian churn, quota, data loss)
- Small batches only during move window.

---
*Generated by Antigravity automation — zero-friction, auditable.*
EOF

log "Summary: $SUMMARY_FILE"
log "=== Complete ==="

# Final friendly reminder
if ! $DRY_RUN; then
    echo ""
    echo "✅ Archive pass finished. Now run your daily snapshot for deltas and commit the manifests."
fi

exit 0
