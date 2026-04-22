import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Bidirectional Sync API
 * Enables two-way communication between dashboard and backend systems.
 * 
 * GET: Fetch current sync state from all connected systems
 * POST: Push state updates from dashboard to backend
 * PUT: Register a sync callback for real-time updates
 */

interface SyncState {
    timestamp: string;
    source: 'dashboard' | 'backend' | 'agent';
    payload: Record<string, unknown>;
}

interface SyncResponse {
    success: boolean;
    syncId?: string;
    state?: SyncState;
    error?: string;
}

// In-memory sync registry (in production, use Redis or similar)
const syncRegistry: Map<string, {
    callback: string;
    lastSync: string;
    direction: 'push' | 'pull' | 'bidirectional';
}> = new Map();

// Pending state updates queue
const pendingUpdates: SyncState[] = [];

// Backend endpoints to sync with
const BACKEND_ENDPOINTS = {
    valentine: process.env.VALENTINE_CORE_URL || 'http://localhost:3002',
    health: process.env.HEALTH_API_URL || 'http://localhost:3004',
};

async function fetchBackendState(): Promise<Record<string, unknown>> {
    const results: Record<string, unknown> = {};

    // Fetch from Valentine Core
    try {
        const valentineRes = await fetch(`${BACKEND_ENDPOINTS.valentine}/api/state`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(5000),
        });
        if (valentineRes.ok) {
            results.valentine = await valentineRes.json();
        }
    } catch (e) {
        results.valentineError = 'Connection failed';
    }

    // Fetch from Health API
    try {
        const healthRes = await fetch(`${BACKEND_ENDPOINTS.health}/health/system`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(5000),
        });
        if (healthRes.ok) {
            results.health = await healthRes.json();
        }
    } catch (e) {
        results.healthError = 'Connection failed';
    }

    return results;
}

async function pushToBackend(payload: Record<string, unknown>): Promise<boolean> {
    try {
        const res = await fetch(`${BACKEND_ENDPOINTS.valentine}/api/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                source: 'dashboard',
                timestamp: new Date().toISOString(),
                payload,
            }),
            signal: AbortSignal.timeout(5000),
        });
        return res.ok;
    } catch {
        return false;
    }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<SyncResponse>
) {
    const syncId = `sync-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    switch (req.method) {
        case 'GET': {
            // Fetch current state from all backends
            const backendState = await fetchBackendState();

            // Include any pending updates from dashboard
            const state: SyncState = {
                timestamp: new Date().toISOString(),
                source: 'dashboard',
                payload: {
                    backends: backendState,
                    pendingUpdates: pendingUpdates.length,
                    registeredCallbacks: syncRegistry.size,
                },
            };

            return res.status(200).json({
                success: true,
                syncId,
                state,
            });
        }

        case 'POST': {
            // Push state update to backend
            const { payload, target } = req.body as {
                payload: Record<string, unknown>;
                target?: 'valentine' | 'health' | 'all';
            };

            if (!payload) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing payload in request body',
                });
            }

            // Queue the update
            const syncState: SyncState = {
                timestamp: new Date().toISOString(),
                source: 'dashboard',
                payload,
            };
            pendingUpdates.push(syncState);

            // Attempt to push to backend
            const pushed = await pushToBackend(payload);

            // Remove from pending if successful
            if (pushed) {
                const idx = pendingUpdates.indexOf(syncState);
                if (idx > -1) pendingUpdates.splice(idx, 1);
            }

            return res.status(pushed ? 200 : 202).json({
                success: true,
                syncId,
                state: syncState,
            });
        }

        case 'PUT': {
            // Register a sync callback
            const { callbackUrl, direction = 'bidirectional' } = req.body as {
                callbackUrl: string;
                direction?: 'push' | 'pull' | 'bidirectional';
            };

            if (!callbackUrl) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing callbackUrl in request body',
                });
            }

            syncRegistry.set(syncId, {
                callback: callbackUrl,
                lastSync: new Date().toISOString(),
                direction,
            });

            return res.status(201).json({
                success: true,
                syncId,
            });
        }

        case 'DELETE': {
            // Unregister a sync callback
            const { syncId: targetId } = req.body as { syncId: string };

            if (!targetId || !syncRegistry.has(targetId)) {
                return res.status(404).json({
                    success: false,
                    error: 'Sync registration not found',
                });
            }

            syncRegistry.delete(targetId);

            return res.status(200).json({
                success: true,
            });
        }

        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            return res.status(405).json({
                success: false,
                error: `Method ${req.method} Not Allowed`,
            });
    }
}
