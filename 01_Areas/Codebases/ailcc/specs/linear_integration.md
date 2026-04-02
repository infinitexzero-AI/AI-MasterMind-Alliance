# Linear Integration Spec

Integrate Linear into the NEXUS system to enable bidirectional task synchronization. This allows creating Linear issues that spawn NEXUS tasks and updating Linear as the agents work.

## Configuration

1.  **Get API Key**: Go to [Linear API settings](https://linear.app/settings/api) and create a "Personal API Key" named "NEXUS".
2.  **Env Variable**: Add this key to your `.env.local` file:
    ```bash
    LINEAR_API_KEY=lin_api_key_xyz...
    ```

## Features

### 1. Inbound Sync (Linear -> NEXUS)
*   **Mechanism**: Polling (every 5 minutes) or Manual Trigger.
*   **Filter**: Issues assigned to the authenticated user (or a specific "AI" user) with status "In Progress" or a specific label "AI".
*   **Action**: Creates a task in `TaskQueue`.

### 2. Outbound Updates (NEXUS -> Linear)
*   **Action**: When a NEXUS task status changes (e.g., to "completed"), post a comment on the Linear issue.

## API Endpoints

### `POST /api/integrations/linear/sync`
*   **Description**: Force a sync of Linear issues to NEXUS tasks.
*   **Auth**: `X-API-Key` required.

### `POST /api/webhooks/linear`
*   **Description**: Receiver for Linear Webhooks (optional, for real-time updates).
*   **Security**: Signature verification (if configured in Linear).

## SDK Usage

We utilize `@linear/sdk`.

```typescript
import { LinearClient } from '@linear/sdk';

const linearClient = new LinearClient({
  apiKey: process.env.LINEAR_API_KEY
});
```
