# Neuromorphic Architecture: System overlay

**Status**: Active Integration
**Visual Assets**: `assets/brain_scan_01.png`, `assets/brain_scan_02.png`

## Cortex Mappings

### 1. Prefrontal Cortex (Executive Function)

* **System Component**: **Valentine Core**
* **Role**: Orchestration, high-level decision making, agent routing.
* **Status**: Online (Port 3000).
* **Visual Reference**: Anterior region in `brain_scan_01.png`.

### 2. Cerebellum (Motor Control & Coordination)

* **System Component**: **Docker Containers / Microservices**
* **Role**: Automated execution, scaling, error-correction, repetitive task handling.
* **Analogy**: Just as the cerebellum fine-tunes motor movement, Docker fine-tunes container orchestration and restart policies.
* **Visual Reference**: Base/Posterior region in `brain_scan_02.png`.

### 3. Hippocampus (Memory Consolidation)

* **System Component**: **Database / Vector Store (Qdrant)**
* **Role**: Long-term memory storage, context retrieval, converting short-term inputs (RAM) into persistent knowledge (Disk).
* **Visual Reference**: Medial temporal lobe (Verify in scan).

### 4. Thalamus (Sensory Relay)

* **System Component**: **API Gateway / MCP Server**
* **Role**: Routing external inputs (User, Web) to the appropriate processing center (Agent).

## Integration Notes

This mapping guides the "Visual Intelligence" phase. Future dashboard iterations should overlay these labels directly onto the rendered 3D brain model.
