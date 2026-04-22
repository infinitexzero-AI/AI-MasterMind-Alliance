import { useState, useEffect, useCallback } from 'react';

interface HeartbeatResult {
    agent: string;
    alive: boolean;
    latencyMs: number | null;
    lastChecked: string | null;
    history: number[];
}

/**
 * Polls agent APIs to check responsiveness and measure latency.
 * Currently checks Grok (xAI) via /api/studio/grok health ping.
 */
export function useAgentHeartbeat(intervalMs = 15000) {
    const [heartbeats, setHeartbeats] = useState<Record<string, HeartbeatResult>>({});

    const checkGrok = useCallback(async (): Promise<Partial<HeartbeatResult>> => {
        const start = performance.now();
        try {
            const res = await fetch('/api/studio/grok', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode: 'automation',
                    input: 'ping',
                    context: 'heartbeat',
                }),
                signal: AbortSignal.timeout(8000),
            });
            const elapsed = Math.round(performance.now() - start);
            return {
                alive: res.ok,
                latencyMs: elapsed,
                lastChecked: new Date().toLocaleTimeString(),
            };
        } catch {
            return {
                alive: false,
                latencyMs: null,
                lastChecked: new Date().toLocaleTimeString(),
            };
        }
    }, []);

    useEffect(() => {
        let active = true;

        const runChecks = async () => {
            const grok = await checkGrok();
            if (active) {
                setHeartbeats(prev => {
                    const grokHistory = [...(prev.GROK?.history || []), grok.latencyMs || 0].slice(-10);
                    const newGrok = { 
                        agent: 'GROK', 
                        ...grok, 
                        history: grokHistory 
                    } as HeartbeatResult;
                    
                    return {
                        ...prev,
                        GROK: newGrok,
                        'GROK-ARCH': { ...newGrok, agent: 'GROK-ARCH' },
                    };
                });
            }
        };

        runChecks();
        const id = setInterval(runChecks, intervalMs);
        return () => {
            active = false;
            clearInterval(id);
        };
    }, [checkGrok, intervalMs]);

    return heartbeats;
}
