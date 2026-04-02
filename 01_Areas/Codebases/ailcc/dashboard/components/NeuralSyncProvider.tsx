import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Agent, AgentStatus } from '../types/DashboardInterfaces';
import { ReconnectionManager } from '../lib/websocket/ReconnectionManager';
import { MessageBuffer, BufferedMessage } from '../lib/websocket/MessageBuffer';
import { ConnectionHealth, ConnectionError } from '../lib/websocket/types';

interface Log {
    timestamp: string;
    source: 'COMET' | 'ANTIGRAVITY' | 'SYSTEM';
    message: string;
    agent?: string; // Agent name (e.g., 'ManagerWorker', 'Comet', etc.)
    status?: string; // Status of the log entry
    payload?: any;
}

export interface Telemetry {
    cpu: number;
    memory: number;
    network: number;
    status: string;
    ram_mb?: number;
    swap_percent?: number;
    helper_count?: number;
    namespaces?: Record<string, number>;
    type?: string;
    metadata?: any;
}

interface CometData {
    timestamp: string;
    traceId: string;
    observability: {
        circuits: Record<string, {
            open: boolean;
            failures: number;
            lastError?: number;
            lastErrorMessage?: string;
        }>;
    };
    mode6: {
        status: string;
        stats: {
            active: number;
            completed: number;
            failed: number;
            total: number;
        };
        recent_tasks: any[];
    };
    linear: any;
    github: any;
    health: any;
    agents: any[];
}

/* eslint-disable no-unused-vars */
interface NeuralSyncContextType {
    agents: Agent[];
    logs: Log[];
    telemetry: Telemetry;
    storage: any; // Using any for now to avoid circular dependency hell, ideally StorageState
    cometData: CometData | null;
    isConnected: boolean;
    connectionHealth: ConnectionHealth;
    sendMessage: (type: string, payload: any) => void;
    retryConnection: () => void;
}
/* eslint-enable no-unused-vars */

const NeuralSyncContext = createContext<NeuralSyncContextType | undefined>(undefined);

export const NeuralSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [logs, setLogs] = useState<Log[]>([]);
    const [telemetry, setTelemetry] = useState<Telemetry>({
        cpu: 0,
        memory: 0,
        network: 0,
        status: 'OFFLINE',
        ram_mb: 0,
        swap_percent: 0,
        helper_count: 0
    });
    const [storage, setStorage] = useState<any>({ icloud: { active: false }, onedrive: { active: false } });
    const [cometData] = useState<CometData | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionHealth, setConnectionHealth] = useState<ConnectionHealth>({
        state: 'disconnected',
        lastConnected: null,
        lastDisconnected: null,
        reconnectAttempts: 0,
        latency: null,
        queuedMessages: 0,
        errors: [],
        uptime: 0
    });

    const socketRef = useRef<any>(null);
    const logQueueRef = useRef<Log[]>([]);
    const reconnectionManagerRef = useRef<ReconnectionManager>(new ReconnectionManager());
    const messageBufferRef = useRef<MessageBuffer>(new MessageBuffer());
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const connectionStartTimeRef = useRef<number | null>(null);
    const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Track connection uptime
    useEffect(() => {
        if (!isConnected) return;

        const interval = setInterval(() => {
            if (connectionStartTimeRef.current) {
                const uptime = Date.now() - connectionStartTimeRef.current;
                setConnectionHealth(prev => ({ ...prev, uptime }));
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isConnected]);

    // Classify error type for better handling
    const classifyError = (error: any): 'network' | 'server' | 'protocol' | 'unknown' => {
        const message = error?.message?.toLowerCase() || '';
        if (message.includes('network') || message.includes('timeout') || message.includes('dns')) {
            return 'network';
        }
        if (message.includes('econnrefused') || message.includes('unavailable')) {
            return 'server';
        }
        if (message.includes('protocol') || message.includes('version')) {
            return 'protocol';
        }
        return 'unknown';
    };

    // Add error to connection health
    const trackError = (type: ConnectionError['type'], message: string, details?: any) => {
        const error: ConnectionError = {
            timestamp: new Date(),
            type,
            message,
            details
        };

        setConnectionHealth(prev => ({
            ...prev,
            errors: [...prev.errors.slice(-9), error] // Keep last 10 errors
        }));
    };

    // Attempt reconnection with exponential backoff
    const attemptReconnection = () => {
        if (!reconnectionManagerRef.current.shouldRetry()) {
            console.error('[NeuralSync] Max reconnection attempts reached');
            setConnectionHealth(prev => ({ ...prev, state: 'failed' }));
            return;
        }

        const delay = reconnectionManagerRef.current.calculateNextDelay();
        const attempt = reconnectionManagerRef.current.incrementAttempt();

        console.log(`[NeuralSync] Reconnection attempt ${attempt} in ${Math.round(delay)}ms`);

        setConnectionHealth(prev => ({
            ...prev,
            state: 'connecting',
            reconnectAttempts: attempt
        }));

        reconnectTimeoutRef.current = setTimeout(() => {
            if (socketRef.current) {
                socketRef.current.connect();
            }
        }, delay);
    };

    // Manual retry function
    const retryConnection = () => {
        console.log('[NeuralSync] Manual reconnection triggered');
        reconnectionManagerRef.current.reset();
        setConnectionHealth(prev => ({
            ...prev,
            state: 'connecting',
            reconnectAttempts: 0
        }));

        if (socketRef.current) {
            socketRef.current.connect();
        }
    };

    // Heartbeat/ping for latency tracking
    const startHeartbeat = () => {
        if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
        }

        heartbeatIntervalRef.current = setInterval(() => {
            if (socketRef.current?.connected) {
                const start = Date.now();
                socketRef.current.emit('ping', {}, () => {
                    const latency = Date.now() - start;
                    setConnectionHealth(prev => ({ ...prev, latency }));
                });
            }
        }, 10000); // Every 10 seconds
    };

    const stopHeartbeat = () => {
        if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
            heartbeatIntervalRef.current = null;
        }
    };

    useEffect(() => {
        // Connect to Neural Uplink on Port 5001/5005
        import('socket.io-client').then(({ io }) => {
            const host = typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1';
            const socket = io(`http://${host}:5005`, {
                transports: ['websocket'],
                reconnection: false, // We handle reconnection manually
                timeout: 10000
            });
            socketRef.current = socket;

            socket.on('connect', () => {
                console.log('[NeuralSync] Connected to Neural Uplink (Port 5005)');

                // Reset reconnection manager on successful connection
                reconnectionManagerRef.current.reset();
                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                    reconnectTimeoutRef.current = null;
                }

                // Update connection state
                setIsConnected(true);
                connectionStartTimeRef.current = Date.now();
                setConnectionHealth(prev => ({
                    ...prev,
                    state: 'connected',
                    lastConnected: new Date(),
                    reconnectAttempts: 0,
                    queuedMessages: messageBufferRef.current.size()
                }));

                // Start heartbeat
                startHeartbeat();

                // Replay buffered messages
                const bufferedMessages = messageBufferRef.current.flush();
                if (bufferedMessages.length > 0) {
                    console.log(`[NeuralSync] Replaying ${bufferedMessages.length} buffered messages`);
                    // Process buffered messages (implementation depends on message type)
                }

                addBatchLog('SYSTEM', 'Synced with Neural Uplink (UPLINK: ACTIVE)');
            });

            socket.on('SYSTEM_EVENT', (event: any) => {
                console.log('[NeuralSync] System Event Received:', event.type);
                addBatchLog(event.source || 'EVENT_BUS', `${event.type}: ${event.message}`);

                // If it's a mission update or high priority, we could trigger a toast or refresh
                if (event.priority <= 2) {
                    // This will be caught by the UI layers subscribing to logs
                }
            });

            socket.on('connect_error', (err) => {
                console.warn('[NeuralSync] Connection error:', err.message);
                const errorType = classifyError(err);
                trackError(errorType, err.message, err);

                setConnectionHealth(prev => ({
                    ...prev,
                    state: 'disconnected'
                }));

                // Attempt reconnection
                attemptReconnection();
            });

            socket.on('disconnect', (reason) => {
                console.log('[NeuralSync] Disconnected:', reason);

                setIsConnected(false);
                connectionStartTimeRef.current = null;
                stopHeartbeat();

                setConnectionHealth(prev => ({
                    ...prev,
                    state: 'disconnected',
                    lastDisconnected: new Date()
                }));

                addBatchLog('SYSTEM', `Connection Lost: ${reason}`);

                // Only attempt reconnection if not a manual disconnect
                if (reason !== 'io client disconnect') {
                    attemptReconnection();
                }
            });

            socket.on('state:full', (state: any) => {
                if (state.agents) {
                    setAgents(state.agents.map((a: any) => ({
                        ...a,
                        status: mapStatus(a.status),
                        skills: a.skills || a.capabilities || []
                    })));
                }
                if (state.storage) setStorage(state.storage);
                if (state.telemetry) {
                    setTelemetry(prev => ({ ...prev, ...state.telemetry, status: 'CONNECTED', network: 100 }));
                } else {
                    setTelemetry(prev => ({ ...prev, status: 'CONNECTED', network: 100 }));
                }
            });

            socket.on('state:update', (update: { type: string, data: any }) => {
                if (update.type === 'agents') {
                    setAgents(update.data.map((a: any) => ({
                        ...a,
                        status: mapStatus(a.status),
                        skills: a.skills || a.capabilities || []
                    })));
                } else if (update.type === 'storage') {
                    setStorage(update.data);
                } else if (update.type === 'telemetry') {
                    setTelemetry(prev => ({ ...prev, ...update.data }));
                }
            });

            socket.on('log', (log: any) => {
                addBatchLog(log.type === 'error' ? 'SYSTEM' : 'ANTIGRAVITY', log.message, log);
            });
        });

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            stopHeartbeat();
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    // Performance Optimization: Batch log updates every 500ms
    useEffect(() => {
        const flushLogs = () => {
            if (logQueueRef.current.length > 0) {
                setLogs(prev => [...prev.slice(-49), ...logQueueRef.current].slice(-50));
                logQueueRef.current = [];
            }
        };
        const interval = setInterval(flushLogs, 500);
        return () => clearInterval(interval);
    }, []);

    const addBatchLog = (source: any, message: string, payload?: any) => {
        const log: Log = {
            timestamp: new Date().toISOString(),
            source,
            message,
            payload
        };

        // If disconnected, buffer the log
        if (!isConnected) {
            const bufferedMessage: BufferedMessage = {
                id: `log-${Date.now()}-${Math.random()}`,
                timestamp: new Date(),
                data: log,
                priority: 'normal'
            };
            messageBufferRef.current.add(bufferedMessage);
            setConnectionHealth(prev => ({
                ...prev,
                queuedMessages: messageBufferRef.current.size()
            }));
        }

        logQueueRef.current.push(log);
    };

    const sendMessage = (type: string, payload: any) => {
        if (socketRef.current?.connected) {
            socketRef.current.emit(type, payload);
        } else {
            // Buffer the message if disconnected
            const bufferedMessage: BufferedMessage = {
                id: `msg-${Date.now()}-${Math.random()}`,
                timestamp: new Date(),
                data: { type, payload },
                priority: 'high'
            };
            messageBufferRef.current.add(bufferedMessage);
            setConnectionHealth(prev => ({
                ...prev,
                queuedMessages: messageBufferRef.current.size()
            }));
            console.warn('[NeuralSync] Message buffered - socket not connected');
        }
    };

    return (
        <NeuralSyncContext.Provider value={{
            agents,
            logs,
            telemetry,
            storage,
            cometData,
            isConnected,
            connectionHealth,
            sendMessage,
            retryConnection
        }}>
            {children}
        </NeuralSyncContext.Provider>
    );
};

const mapStatus = (status: string): AgentStatus => {
    const s = status.toUpperCase();
    if (s === 'ONLINE' || s === 'IDLE') return 'IDLE';
    if (s === 'EXECUTING' || s === 'ACTIVE') return 'EXECUTING';
    if (s === 'OFFLINE') return 'OFFLINE';
    if (s === 'THINKING') return 'THINKING';
    return 'IDLE';
};

export const useNeuralSync = () => {
    const context = useContext(NeuralSyncContext);
    if (!context) {
        throw new Error('useNeuralSync must be used within a NeuralSyncProvider');
    }
    return context;
};
