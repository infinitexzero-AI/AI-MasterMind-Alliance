# Behavioral Pattern: Flow State Optimization

## 🌊 Characteristics

- **High Synchronization**: Corpus Callosum (Sync Packets) and Prefrontal (Valentine Core) are in lockstep.
- **Low Latency**: <30ms inter-agent communication.
- **High Success Rate**: Continuous streak of `[x]` task completions without retries.

## 🛠️ Triggers

- **Memory Warm-up**: Recent access to relevant context files.
- **Clear Objectives**: Well-defined `task.md` with no ambiguous nodes.
- **System Stability**: Load <10, Free Disk >15GB.

## 🚀 Optimization Logic

1. **Context Locking**: Prevent background tasks from clearing the active project's cache.
2. **Prioritized Resource Allocation**: Divert all available CPU to the active agent group.
3. **Seamless Handoffs**: Use direct memory-sharing rather than disk-based sync packets where possible.
