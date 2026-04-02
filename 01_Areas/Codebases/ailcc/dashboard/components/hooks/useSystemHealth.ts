import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export interface QueueMetrics {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
}

export interface SystemHealth {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    machine: {
        memory: { freeRAM: number; swapPercent: number; status: 'healthy' | 'warning' | 'critical' };
        disk: { percent: number };
    };
    services: {
        core: {
            status: 'up' | 'down' | 'standalone';
            uptime: number;
            version: string;
            agents_active?: number;
            mode?: 'docker' | 'direct-api';
        };
        redis: {
            status: 'connected' | 'disconnected';
        };
        queues: Record<string, QueueMetrics>;
    };
}

export type StatusType = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

function deriveCoreStatus(data?: SystemHealth): StatusType {
    if (!data) return 'unknown';
    if (data.services.core.status === 'up') return 'healthy';
    if (data.services.core.status === 'standalone') return 'degraded';
    return 'unhealthy';
}

function deriveRedisStatus(data?: SystemHealth): StatusType {
    if (!data) return 'unknown';
    return data.services.redis.status === 'connected' ? 'healthy' : 'unhealthy';
}

function deriveQueueStatus(queues: Record<string, QueueMetrics> | undefined): {
    bullStatus: StatusType;
    totalActive: number;
    totalWaiting: number;
    totalFailed: number;
} {
    if (!queues) {
        return {
            bullStatus: 'unknown',
            totalActive: 0,
            totalWaiting: 0,
            totalFailed: 0,
        };
    }

    const allQueues = Object.values(queues);
    const totalActive = allQueues.reduce((acc, q) => acc + q.active, 0);
    const totalWaiting = allQueues.reduce((acc, q) => acc + q.waiting + q.delayed, 0);
    const totalFailed = allQueues.reduce((acc, q) => acc + q.failed, 0);

    // simple thresholds – tune to your scale
    const BACKLOG_SOFT = 50;
    const BACKLOG_HARD = 200;
    const FAILED_SOFT = 1;
    const FAILED_HARD = 5;

    let bullStatus: StatusType = 'healthy';

    if (totalFailed >= FAILED_HARD || totalWaiting >= BACKLOG_HARD) {
        bullStatus = 'unhealthy';
    } else if (totalFailed >= FAILED_SOFT || totalWaiting >= BACKLOG_SOFT) {
        bullStatus = 'degraded';
    }

    return { bullStatus, totalActive, totalWaiting, totalFailed };
}

export function useSystemHealth() {
    const { data, error, isLoading, mutate } = useSWR<SystemHealth>(
        '/api/monitor/health',
        fetcher,
        {
            refreshInterval: 5000,
            // SWR-specific: retry errors a few times, then back off
            errorRetryCount: 3,
            dedupingInterval: 3000,
            revalidateOnFocus: true,
        }
    );

    const coreStatus = deriveCoreStatus(data);
    const redisStatus = deriveRedisStatus(data);
    const {
        bullStatus: derivedBullStatus,
        totalActive,
        totalWaiting,
        totalFailed,
    } = deriveQueueStatus(data?.services?.queues);

    // If the overall system is marked unhealthy, override queue health
    const bullStatus: StatusType =
        data?.status === 'unhealthy' ? 'unhealthy' : derivedBullStatus;

    const totalAgents = data?.services?.core?.agents_active || 0;

    // Bidirectional sync: push state updates to backend
    const pushUpdate = async (payload: Record<string, unknown>): Promise<boolean> => {
        try {
            const res = await fetch('/api/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payload }),
            });
            if (res.ok) {
                // Revalidate to fetch fresh state
                mutate();
                return true;
            }
            return false;
        } catch {
            return false;
        }
    };

    // Force refresh from all backends
    const forceSync = async (): Promise<void> => {
        try {
            await fetch('/api/sync', { method: 'GET' });
            mutate();
        } catch {
            // Silently fail, polling will retry
        }
    };

    // 4. Resilience Monitor: Auto-trigger self-heal on critical machine stats
    useSWR(
        data?.machine?.memory?.status === 'critical' ? '/api/system/self_heal' : null,
        async (url: string) => {
            console.log('[Resilience] Critical memory detected. Triggering self-heal...');
            try {
                const res = await fetch(url, { method: 'POST' });
                if (res.ok) {
                    const result = await res.json();
                    console.log('[Resilience] Self-heal complete:', result.actions);
                }
            } catch (e) {
                console.error('[Resilience] Auto-heal failed:', e);
            }
        },
        { refreshInterval: 0, revalidateOnFocus: false }
    );

    return {
        health: data,
        isLoading,
        isError: !!error,
        isConnected: !error && !!data,
        coreStatus,
        redisStatus,
        bullStatus,
        totalAgents,
        activeSessions: totalActive,
        totalWaiting,
        totalFailed,
        queueMetrics: data?.services?.queues || {},
        // Bidirectional sync capabilities
        pushUpdate,
        forceSync,
        refresh: mutate,
    };
}
