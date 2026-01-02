# 🧠 Hippocampus Storage Protocol: AI-Driven Memory Management

This protocol outlines the synchronization and archival logic for the AI Mastermind Alliance, ensuring system-wide intelligence persistence and storage optimization.

## 🏛️ Core Principles

1. **Surgical Auditing**: Utilize Comet (Scout) to index existing directories and identify low-frequency access vs. mission-critical data.
2. **Archival Migration**: Large assets (recordings, large PDFs, old projects) are moved to the "Intelligence Vault" (SSD/External) to free up iCloud and internal disk space.
3. **Intelligence Distillation**: Before archival, agents perform a summary pass (Standardized Signals) to preserve the "gist" in `master_commands.json` or `knowledge.db`.

## 🛠️ Implementation Phases (Roadmap Tasks 055-075)

### Phase 1: The Audit (Tasks 055-060)

- [ ] Deploy `audit_storage.py` to map file sizes and last-access timestamps.
- [ ] Identified "Cold Storage" candidates: Old academic modules, 2023-2024 workspace logs.

### Phase 2: The Migration (Tasks 061-070)

- [ ] Establish directory structure on External Storage.
- [ ] Move archival data and verify hash integrity.
- [ ] Symlink active manifests back to local workspace for context retrieval.

### Phase 3: iCloud Optimization (Tasks 071-075)

- [ ] Purge non-essential synced folders.
- [ ] Prioritize sync for the `Intelligence_Vault` manifests.

---

**Status**: DRAFT (Baseline established)
**Dependencies**: Perplexity/Comet integration for file indexing.
