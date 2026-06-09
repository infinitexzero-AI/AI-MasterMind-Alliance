# Universal Agent Protocol (UAP) v1.0

**Status:** Active Protocol
**Based on:** Universal Commerce Protocol (Google Cloud)
**Adaptation:** AILCC/Nexus System

## 1. Overview
The **Universal Agent Protocol (UAP)** transforms the Nexus ecosystem into a "Marketplace of Intelligence." Instead of hard-coded imperative scripts, the system operates as an open market where:
-   **Tasks** are "Orders" waiting to be filled.
-   **Agents** are "Merchants" broadcasting their capabilities.
-   **Nexus** is the "Exchange" that matches them.

## 2. The Protocol Layers

### L1: Discovery (Capability Broadcasting)
Every agent must publish a **Service Manifest**. This is a live JSON object describing what the agent can do *right now*.

**Schema:**
```json
{
  "agent_id": "comet-v1",
  "status": "online",
  "capabilities": [
    { "service": "web_research", "cost": "low", "latency": "high" },
    { "service": "fact_verification", "cost": "low", "latency": "medium" }
  ],
  "location": "web",
  "endpoint": "wss://comet.ailcc.net/stream"
}
```

### L2: Booking (Task Assignment)
When the User or Grok issues an intent, the Nexus creates a **Task Order**.

**Order Flow:**
1.  **Intent:** "Research biology syllabus."
2.  **Order Created:** `ORDER-ID-123`
3.  **Matching:** Nexus scans L1 Manifests for "web_research".
4.  **Booking:** Comet is "booked" for the task.

### L3: Settlement (Verification)
A task is not complete until "Settled". settlement requires verification by a neutral observer (Comet or User).

**Settlement States:**
-   `PENDING_VERIFICATION`: Agent claims done.
-   `SETTLED`: Verifier confirms output matches requirements.
-   `DISPUTED`: Output failed validation; re-booking required.

## 3. Protocol Stream (The UI)
The Nexus Dashboard visualizes this flow as a **Protocol Stream**: a real-time feed of market activity.

**Visual Metaphor:**
-   **Bid:** Agent offering to take a task.
-   **Deal:** Task assigned.
-   **Receipt:** Verified completion artifact.

---

## 4. Implementation Guidelines
-   **Local Agents (Antigravity):** Broadcast via file watcher updates to `AILCC_PRIME/.aimma/registry`.
-   **Cloud Agents (Replit):** Broadcast via HTTP POST to Nexus Bridge.
-   **Web Agents (Comet):** Broadcast via WebSocket.

**"Unity of effort, diversity of intelligence."**
