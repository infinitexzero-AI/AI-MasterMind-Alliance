import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { UnifiedTask, AgentRosterItem } from '../types/alliance';

const RELAY_URL = 'http://localhost:5005';

export const useAllianceData = () => {
    const [tasks, setTasks] = useState<UnifiedTask[]>([]);
    const [agents, setAgents] = useState<AgentRosterItem[]>([]);
    const [logs, setLogs] = useState<{ id: string; msg: string; type: string; timestamp: string }[]>([]);
    const [synapses, setSynapses] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({ cpu: 0, memory: 0, status: 'UNKNOWN', uptime: '0d 0h 0m', vanguard: [], activeAgents: {}, onedriveSync: 0, xbox: null });

    useEffect(() => {
        let socket: Socket;
        try {
            socket = io(RELAY_URL, {
                reconnectionAttempts: 10,
                reconnectionDelay: 2000,
                timeout: 5000
            });

            socket.on('connect', () => {
                console.log('📡 useAllianceData: Connected to Neural Uplink');
                setLogs(prev => [
                    { id: 'sys-' + Date.now(), msg: 'Real-time Data Matrix established.', type: 'system', timestamp: new Date().toLocaleTimeString() },
                    ...prev
                ].slice(0, 50));
            });

            socket.on('connect_error', (err) => {
                console.warn('⚠️ Neural Uplink unavailable:', err.message);
            });

            socket.on('AGENT_ROSTER', (data: AgentRosterItem[]) => setAgents(data));
            socket.on('TASK_UPDATE', (data: UnifiedTask[]) => setTasks(data));

            socket.on('TASK_PROGRESS_UPDATE', (update: any) => {
                setTasks(prevTasks => prevTasks.map(task => {
                    if (task.id === update.task_id) {
                        return {
                            ...task,
                            status: update.status || 'ACTIVE',
                            telemetry: {
                                ...task.telemetry,
                                progress: update.progress,
                                lastEvent: update.message
                            }
                        };
                    }
                    return task;
                }));
            });

            socket.on('HEARTBEAT', (data: any) => {
                setStats((prev: any) => ({
                    ...prev,
                    cpu: data.cpu,
                    memory: data.memory,
                    status: data.status,
                    uptime: data.uptime || '14d 22h', // Fallback to legacy if missing
                    vanguard: data.vanguard || []
                }));
            });

            socket.on('SYSTEM_EVENT', (event: any) => {
                setLogs(prev => [
                    { id: event.id || Date.now().toString(), msg: event.msg, type: event.type, timestamp: event.timestamp || new Date().toLocaleTimeString() },
                    ...prev
                ].slice(0, 50));
                
                // Native hook for global sync state injection
                if (event.type === 'ONEDRIVE_SYNC_STATE') {
                    setStats((prev: any) => ({
                        ...prev,
                        onedriveSync: event.percent
                    }));
                }
            });

            socket.on('XBOX_PRESENCE', (data: any) => {
                setStats((prev: any) => ({
                    ...prev,
                    xbox: data
                }));
            });

            socket.on('NEURAL_SYNAPSE', (synapse: any) => {
                setSynapses(prev => [synapse, ...prev].slice(0, 5));
            });
        } catch {
            console.warn('⚠️ Could not initialize Neural Uplink socket');
        }

        return () => {
            if (socket) socket.disconnect();
        };
    }, []);

    // Polling for Phase 33 Dynamic Agents
    useEffect(() => {
        const fetchAgents = async () => {
            try {
                const res = await fetch(`${RELAY_URL}/api/system/agents/active`);
                if (res.ok) {
                    const data = await res.json();
                    setStats((prev: any) => ({ ...prev, activeAgents: data }));
                }
            } catch (e) {
                // Silently ignore polling errors to prevent console spam if relay goes down
            }
        };

        fetchAgents();
        const interval = setInterval(fetchAgents, 3000);
        return () => clearInterval(interval);
    }, []);

    const syncData = useCallback(async () => {
        try {
            const response = await fetch(`${RELAY_URL}/api/sync`);
            if (!response.ok) throw new Error(`Sync returned ${response.status}`);
            await response.json();
            console.log('🔄 Data Matrix synced manually');
        } catch {
            console.warn('⚠️ Sync unavailable — relay server may be offline.');
        }
    }, []);

    return { tasks, agents, logs, synapses, stats, syncData };
};
