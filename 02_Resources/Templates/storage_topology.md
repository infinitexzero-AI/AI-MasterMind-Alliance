# 🗺️ Storage Topology: Hippocampus Protocol

```mermaid
graph TD
    subgraph "Boot Volume (113GB)"
        OS["macOS System (10GiB)"]
        User["User Data (88GiB)"]
        subgraph "AILCC_PRIME (Local)"
            Code["Code (.venv/node_modules)"]
            Vault["Intelligence Vault"]
            Logs["Logs/State"]
        end
    end

    subgraph "Cloud Archive (iCloud)"
        Photos["Photos Zip (382MB)"]
        Scans["3D Scans (1.2GB)"]
        Docs["Legacy Docs"]
    end

    subgraph "External Storage (Target)"
        XA["XDriveAlpha (1.8TB) - 183MB ARCHIVED"]
        XB["XDriveBeta (1.8TB)"]
    end

    User -->|Critical Space| AILCC_PRIME
    Cloud_Archive -->|Sync| User
    User -.->|PROPOSED MIGRATION| XA
    User -.->|BACKUP| XB
```

## Data Categorization

- **High Retention (Archive)**: 3D Scans, Photos Zip, Legacy Playbooks.
- **Active Dev**: Python Virtual Envs, Node Modules, Git Pack Files.
- **Intelligence**: Academic Records, Mission Manifests, Sync State.
