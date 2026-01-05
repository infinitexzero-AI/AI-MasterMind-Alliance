# ANTI-Gravity Agent Calls Library

> **Status**: Live 🟢
> **Registry**: `registry.json`

This directory contains the executable capabilities for the Antigravity Agent and the wider Valentine system.

## 📚 Available Commands

### 🛠️ Core & Maintenance
*   **System Status** (`sys_check`): Verifies workspace health.
*   **Junk Migrator** (`migrate_junk`): Offloads large archives to external storage.
*   **Kill Switch** (`kill_all`): Emergency stop for agent processes.

### 🎨 Creative & Tools
*   **Grapher Agent** (`make_visual`): Turns math notes into visual prototypes (Shaders).

### 📡 Communication
*   **iOS Notify** (`notify_mobile`): Pushes alerts to mobile.

## Usage

Agents can read `registry.json` to discover available tools and their arguments.
Human users can run commands directly from `bin/`.
