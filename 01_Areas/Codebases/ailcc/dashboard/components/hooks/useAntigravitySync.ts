/**
 * useAntigravitySync - Real-time bidirectional sync with Antigravity
 * 
 * Subscribes to Neural Uplink (Port 5005) for:
 * - Agent progress updates (for AgentCard throughput pulse)
 * - System events (task completions, handoffs)
 * - Antigravity state changes
 * 
 * Also provides sendCommand() for bidirectional communication
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export interface AntigravityState {
    status: 'idle' | 'executing' | 'thinking' | 'offline';
    currentTask: string | null;
    lastEvent: string;
    throughput: number;
    significance: number;
    performance: {
        cpu: number;
        memory: number;
        latency: number;
    };
    timestamp: string;
}

export interface SystemEvent {
    id: string;
    type: 'handoff' | 'task_complete' | 'task_start' | 'error' | 'system';
    msg: string;
    timestamp: string;
    agent?: string;
    data?: Record<string, unknown>;
}

export interface AgentProgress {
    agent: 'comet' | 'antigravity' | 'judge' | 'gemini';
    value: number;
}

interface UseAntigravitySyncOptions {
    autoConnect?: boolean;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
}

export function useAntigravitySync(options: UseAntigravitySyncOptions = {}) {
    const {
        autoConnect = true,
        reconnectInterval = 3000,
        maxReconnectAttempts = 10
    } = options;

    const [state, setState] = useState<AntigravityState | null>(null);
    const [events, setEvents] = useState<SystemEvent[]>([]);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [agentProgress, setAgentProgress] = useState<Record<string, number>>({
        comet: 0,
        antigravity: 0,
        judge: 0,
        gemini: 0
    });

    const socketRef = useRef<Socket | null>(null);
    const reconnectAttempts = useRef(0);

    // Connect to Neural Uplink
    useEffect(() => {
        if (!autoConnect) return;

        const connectSocket = () => {
            const socket = io('http://localhost:5005', {
                transports: ['websocket'],
                reconnection: true,
                reconnectionAttempts: maxReconnectAttempts,
                reconnectionDelay: reconnectInterval,
            });

            socketRef.current = socket;

            socket.on('connect', () => {
                console.log('[AntigravitySync] Connected to Neural Uplink (Port 5005)');
                setConnected(true);
                setError(null);
                reconnectAttempts.current = 0;
            });

            // Antigravity state updates
            socket.on('state:full', (fullState: any) => {
                console.log('[AntigravitySync] Full state received:', fullState);
                if (fullState.agents) {
                    const agState = fullState.agents.find((a: any) => a.id === 'antigravity');
                    if (agState) {
                        setState({
                            status: agState.status || 'idle',
                            currentTask: agState.currentTask || null,
                            lastEvent: agState.message || '',
                            throughput: agState.syncStrength || 0,
                            significance: Math.min(100, (agState.syncStrength || 0) * 1.2),
                            performance: {
                                cpu: 0,
                                memory: 0,
                                latency: 0
                            },
                            timestamp: new Date().toISOString()
                        });
                    }
                }
            });

            socket.on('state:update', (update: { type: string; data: any }) => {
                if (update.type === 'agents') {
                    const agState = update.data?.find((a: any) => a.id === 'antigravity');
                    if (agState) {
                        setState(prev => prev ? {
                            ...prev,
                            status: agState.status || prev.status,
                            currentTask: agState.currentTask || prev.currentTask,
                            lastEvent: agState.message || prev.lastEvent,
                            throughput: agState.syncStrength || prev.throughput,
                            timestamp: new Date().toISOString()
                        } : null);
                    }
                }
            });

            // Agent progress (for throughput pulse)
            socket.on('AGENT_PROGRESS', (progress: AgentProgress) => {
                setAgentProgress(prev => ({
                    ...prev,
                    [progress.agent]: progress.value
                }));
            });

            // System events
            socket.on('SYSTEM_EVENT', (event: SystemEvent) => {
                setEvents(prev => [event, ...prev].slice(0, 50)); // Keep last 50 events
            });

            // Heartbeat
            socket.on('HEARTBEAT', (heartbeat: any) => {
                if (heartbeat.agents) {
                    setAgentProgress(heartbeat.agents);
                }
            });

            socket.on('connect_error', (err: Error) => {
                console.error('[AntigravitySync] Connection error:', err.message);
                setError('Connection failed. Is Neural Uplink running on port 5005?');
                setConnected(false);
            });

            socket.on('disconnect', (reason: string) => {
                console.log('[AntigravitySync] Disconnected:', reason);
                setConnected(false);
            });
        };

        connectSocket();

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [autoConnect, maxReconnectAttempts, reconnectInterval]);

    // Send command to Antigravity via API
    const sendCommand = useCallback(async (command: string, payload?: Record<string, unknown>) => {
        try {
            const response = await fetch('/api/antigravity/command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command, payload })
            });

            if (!response.ok) {
                throw new Error(`Command failed: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (err) {
            console.error('[AntigravitySync] Command failed:', err);
            setError(err instanceof Error ? err.message : 'Command failed');
            throw err;
        }
    }, []);

    // Get current throughput for a specific agent (used by AgentCard)
    const getThroughput = useCallback((agentId: string): number => {
        return agentProgress[agentId] ?? 0;
    }, [agentProgress]);

    // Clear events
    const clearEvents = useCallback(() => {
        setEvents([]);
    }, []);

    return {
        // State
        state,
        connected,
        error,
        events,
        agentProgress,

        // Actions
        sendCommand,
        getThroughput,
        clearEvents,

        // Utils
        reconnect: () => socketRef.current?.connect(),
        disconnect: () => socketRef.current?.disconnect()
    };
}

export default useAntigravitySync;