#!/bin/bash
# AILCC System Inventory - Full Context Extraction

echo "=== AI MASTERMIND ALLIANCE - LIVE SYSTEM AUDIT ===" 
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
find ~ -type d -name "AILCC_PRIME" 2>/dev/null || echo "❌ AILCC_PRIME not found"
echo ""

echo "Valentine Core Location:"
find ~ -type d -name "valentine-core" 2>/dev/null || echo "❌ valentine-core not found"
echo ""

echo "NEXUS Dashboard Location:"
find ~ -type d -name "nexus" -o -name "nexus-dashboard" 2>/dev/null || echo "❌ NEXUS not found"
echo ""

echo "All Node.js Projects (package.json locations):"
find ~ -name "package.json" -not -path "*/node_modules/*" 2>/dev/null | head -20
echo ""

# ============================================
# SECTION 2: RUNNING PROCESSES
# ============================================
echo "🔄 SECTION 2: Active Processes & Services"
echo "=========================================="
echo ""

echo "Node.js Processes:"
ps aux | grep node | grep -v grep || echo "❌ No Node.js processes"
echo ""

echo "Python Processes:"
ps aux | grep python | grep -v grep || echo "❌ No Python processes"
echo ""

echo "Docker Processes:"
ps aux | grep docker | grep -v grep || echo "⏸️  Docker not running"
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

echo "Port 5000 (Valentine Core):"
lsof -i :5000 2>/dev/null || echo "❌ Not in use"
echo ""

echo "Port 5678 (n8n):"
lsof -i :5678 2>/dev/null || echo "❌ Not in use"
echo ""

echo "Port 6379 (Redis):"
lsof -i :6379 2>/dev/null || echo "❌ Not in use"
echo ""

echo "Port 5432 (PostgreSQL):"
lsof -i :5432 2>/dev/null || echo "❌ Not in use"
echo ""

# ============================================
# SECTION 4: CONFIGURATION FILES
# ============================================
echo "⚙️  SECTION 4: Configuration Files"
echo "=========================================="
echo ""

echo ".env Files (locations only, NOT content):"
find ~ -name ".env" -not -path "*/node_modules/*" 2>/dev/null | head -10
echo ""

echo "docker-compose.yml Files:"
find ~ -name "docker-compose.yml" 2>/dev/null | head -10
echo ""

echo "valentine.config.js:"
find ~ -name "valentine.config.js" 2>/dev/null || echo "❌ Not found"
echo ""

echo "package.json files (with names):"
find ~ -name "package.json" -not -path "*/node_modules/*" -exec sh -c 'echo "---"; echo "File: $1"; cat "$1" | grep -A 2 "\"name\"" | head -3' _ {} \; 2>/dev/null | head -50
echo ""

# ============================================
# SECTION 5: GIT REPOSITORIES
# ============================================
echo "📦 SECTION 5: Git Repos"
echo "=========================================="
echo ""

echo "Git Repos in Home Directory:"
find ~ -maxdepth 4 -name ".git" -type d 2>/dev/null | sed 's/\/.git$//' | head -20
echo ""

echo "Current Branch for Each Repo:"
find ~ -maxdepth 4 -name ".git" -type d 2>/dev/null | while read gitdir; do
  repo=$(dirname "$gitdir")
  branch=$(cd "$repo" && git branch --show-current 2>/dev/null)
  echo "$repo -> $branch"
done | head -20
echo ""

# ============================================
# SECTION 6: DOCKER STATUS
# ============================================
echo "🐳 SECTION 6: Docker Status"
echo "=========================================="
echo ""

echo "Docker Desktop Status:"
docker info 2>/dev/null && echo "✅ Docker RUNNING" || echo "❌ Docker NOT RUNNING"
echo ""

echo "Docker Containers:"
docker ps -a 2>/dev/null || echo "❌ Docker not available"
echo ""

echo "Docker Images:"
docker images 2>/dev/null | head -20 || echo "❌ Docker not available"
echo ""

echo "Docker Volumes:"
docker volume ls 2>/dev/null || echo "❌ Docker not available"
echo ""

# ============================================
# SECTION 7: HOMEBREW PACKAGES
# ============================================
echo "🍺 SECTION 7: Installed Tools (Homebrew)"
echo "=========================================="
echo ""

echo "Key Tools Check:"
for tool in node python3 redis docker docker-compose git curl wget; do
  which $tool >/dev/null 2>&1 && echo "✅ $tool: $(which $tool)" || echo "❌ $tool: NOT INSTALLED"
done
echo ""

echo "Node.js Version:"
node --version 2>/dev/null || echo "❌ Node.js not installed"
echo ""

echo "Python Version:"
python3 --version 2>/dev/null || echo "❌ Python not installed"
echo ""

# ============================================
# SECTION 8: ENVIRONMENT VARIABLES
# ============================================
echo "🔐 SECTION 8: Environment Variables (SAFE - no values)"
echo "=========================================="
echo ""

echo "API Keys Configured (existence check only):"
env | grep -i "API" | cut -d'=' -f1 || echo "❌ No API env vars set"
echo ""

echo "PATH directories:"
echo $PATH | tr ':' '\n' | head -20
echo ""

# ============================================
# SECTION 9: RECENT LOGS
# ============================================
echo "📋 SECTION 9: Recent Logs & Activity"
echo "=========================================="
echo ""

echo "Most Recently Modified Files in Home (last 24h):"
find ~ -type f -mtime -1 -not -path "*/Library/*" -not -path "*/node_modules/*" 2>/dev/null | head -30
echo ""

# ============================================
# SECTION 10: RESOURCE USAGE
# ============================================
echo "💻 SECTION 10: System Resources"
echo "=========================================="
echo ""

echo "Memory Usage:"
vm_stat | head -10
echo ""

echo "Disk Usage (key directories):"
du -sh ~ ~/AILCC_PRIME ~/Documents ~/Desktop 2>/dev/null
echo ""

echo "Top 10 Processes by Memory:"
ps aux | sort -nrk 4 | head -11
echo ""

# ============================================
# END REPORT
# ============================================
echo ""
echo "=== END OF SYSTEM AUDIT ==="
echo "Generated: $(date)"
echo ""
