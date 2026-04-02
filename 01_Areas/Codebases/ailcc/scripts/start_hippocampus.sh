#!/bin/bash
# start_hippocampus.sh - Launch Qdrant Vector Database for Nexus Hippocampus

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

CONTAINER_NAME="nexus-hippocampus"
STORAGE_DIR="$(pwd)/hippocampus_storage"

echo -e "${BLUE}[Hippocampus] Initializing Memory Systems...${NC}"

# 1. Check Docker availability
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}[Error] Docker is not active!${NC}"
    echo "Please start Docker Desktop to enable Hippocampus memory."
    # We exit with 0 to allow the rest of the dashboard to load even without memory, 
    # but strictly this should be 1 if it was a hard dependency. 
    # Giving it a warning but allowing proceed for partial system availability.
    exit 1
fi

# 2. Manage Container
if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${GREEN}[Hippocampus] Qdrant is already active on :6333${NC}"
elif docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${BLUE}[Hippocampus] Waking up existing memory node...${NC}"
    docker start "$CONTAINER_NAME" > /dev/null
    echo -e "${GREEN}[Hippocampus] Qdrant active.${NC}"
else
    echo -e "${BLUE}[Hippocampus] Provisioning new memory node...${NC}"
    mkdir -p "$STORAGE_DIR"
    docker run -d \
        --name "$CONTAINER_NAME" \
        -p 6333:6333 \
        -p 6334:6334 \
        -v "$STORAGE_DIR":/qdrant/storage \
        qdrant/qdrant:latest > /dev/null
    
    echo -e "${GREEN}[Hippocampus] Qdrant launched on :6333.${NC}"
fi
