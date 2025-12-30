# 📊 Alliance Status Dashboard: Specification

## 🎯 Objective
To provide a real-time, high-observability interface for tracking agent health, task flow, and system state.

## 🛠️ Requirements

### 1. Agent Health Monitoring
- **Visuals**: Green (Active), Yellow (Idle), Red (Offline).
- **Metric**: Last heartbeat received within 300s.

### 2. Task Queue Metrics
- Queue depth per agent.
- Average processing latency (Wave 2 metric).
- Recent completion/failure logs.

### 3. Sync State Status
- Last `knowledge.db` sync timestamp.
- Conflict detection flags.

### 4. Active Project List
- Links to relevant manifests (e.g., `MASTER_PROJECT_MANIFEST.md`).
- Active Wave status (e.g., "Current: Wave 1").

### 5. Error Log Summary
- Streaming view of `logs/valentine.log` and `logs/system_heartbeat.log`.

## 🎨 UI Aesthetics
- **Core**: Glassmorphism (consistent with Nexus).
- **Dynamic Updates**: Real-time WebSocket feed from Port 3001.
