#!/bin/bash
# AILCC System Inventory - Optimized Context Extraction

echo "=== AI MASTERMIND ALLIANCE - LIVE SYSTEM AUDIT (OPTIMIZED) ===" 
echo "Timestamp: $(date)"
echo "System: $(uname -a)"
echo ""

# ============================================
# SECTION 1: DIRECTORY STRUCTURE
# ============================================
echo "📁 SECTION 1: Project Directory Structure"
echo "=========================================="
echo ""

echo "AILCC_PRIME Location:"
[ -d "/Users/infinite27/AILCC_PRIME" ] && echo "/Users/infinite27/AILCC_PRIME" || mdfind "kMDItemFSName == 'AILCC_PRIME' && kMDItemContentType == 'public.folder'" | head -1
echo ""

echo "Valentine Core Location:"
[ -d "/Users/infinite27/AILCC_PRIME/valentine-core" ] && echo "/Users/infinite27/AILCC_PRIME/valentine-core" || mdfind "kMDItemFSName == 'valentine-core' && kMDItemContentType == 'public.folder'" | head -1
echo ""

echo "NEXUS Dashboard Location:"
[ -d "/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/dashboard" ] && echo "/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/dashboard" || mdfind "kMDItemFSName == 'dashboard' && kMDItemContentType == 'public.folder'" | head -5
echo ""

echo "All Node.js Projects (package.json locations):"
find /Users/infinite27/AILCC_PRIME -maxdepth 5 -name "package.json" -not -path "*/node_modules/*" 2>/dev/null
echo ""

# ============================================
# SECTION 2: RUNNING PROCESSES
# ============================================
echo "🔄 SECTION 2: Active Processes & Services"
echo "=========================================="
echo ""

echo "Node.js Processes:"
ps aux | grep node | grep -v grep | head -10 || echo "❌ No Node.js processes"
echo ""

echo "Python Processes:"
ps aux | grep python | grep -v grep | head -5 || echo "❌ No Python processes"
echo ""

echo "Docker Processes:"
docker info >/dev/null 2>&1 && echo "✅ Docker Running" || echo "⏸️ Docker not running"
echo ""

echo "Redis Status:"
redis-cli ping 2>/dev/null && echo "✅ Redis ACTIVE" || echo "❌ Redis NOT RUNNING"
echo ""

# ============================================
# SECTION 3: NETWORK PORTS
# ============================================
echo "🌐 SECTION 3: Active Network Ports"
echo "=========================================="
echo ""

echo "Port 3000 (NEXUS Dashboard):"
lsof -i :3000 2>/dev/null || echo "❌ Not in use"
echo ""

echo "Port 5001 (Valentine Core):"
lsof -i :5001 2>/dev/null || echo "❌ Not in use"
echo ""

echo "Port 5678 (n8n):"
lsof -i :5678 2>/dev/null || echo "❌ Not in use"
echo ""

echo "Port 8123 (Hippocampus/Chroma):"
lsof -i :8123 2>/dev/null || echo "❌ Not in use"
echo ""

# ============================================
# SECTION 4: CONFIGURATION FILES
# ============================================
echo "⚙️  SECTION 4: Configuration Files"
echo "=========================================="
echo ""

echo ".env Files:"
find /Users/infinite27/AILCC_PRIME -maxdepth 4 -name ".env*" -not -path "*/node_modules/*" 2>/dev/null
echo ""

echo "docker-compose.yml Files:"
find /Users/infinite27/AILCC_PRIME -maxdepth 4 -name "docker-compose.yml" 2>/dev/null
echo ""

echo "package.json names:"
find /Users/infinite27/AILCC_PRIME -maxdepth 4 -name "package.json" -not -path "*/node_modules/*" -exec sh -c 'echo "---"; echo "File: $1"; cat "$1" | grep -A 2 "\"name\"" | head -3' _ {} \; 2>/dev/null
echo ""

# ============================================
# SECTION 5: GIT STATUS
# ============================================
echo "📦 SECTION 5: Git Status"
echo "=========================================="
echo ""

find /Users/infinite27/AILCC_PRIME -maxdepth 3 -name ".git" -type d 2>/dev/null | while read gitdir; do
  repo=$(dirname "$gitdir")
  branch=$(cd "$repo" && git branch --show-current 2>/dev/null)
  echo "$repo -> $branch"
done | head -10
echo ""

# ============================================
# SECTION 6: DOCKER DETAILS
# ============================================
echo "🐳 SECTION 6: Docker Details"
echo "=========================================="
echo ""

docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "❌ Docker not available"
echo ""

# ============================================
# SECTION 10: RESOURCE USAGE
# ============================================
echo "💻 SECTION 10: System Resources"
echo "=========================================="
echo ""

echo "Disk Usage:"
du -sh /Users/infinite27/AILCC_PRIME 2>/dev/null
echo ""

# ============================================
# END REPORT
# ============================================
echo "=== END OF SYSTEM AUDIT ==="
echo "Generated: $(date)"
