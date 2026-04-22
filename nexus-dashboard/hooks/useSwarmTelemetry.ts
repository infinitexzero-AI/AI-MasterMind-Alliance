import { useState, useEffect, useRef } from 'react';
import { SwarmTaskSchema, NeuralSignalSchema } from '../types/api';

/**
 * useSwarmTelemetry Hook
 * Opens a real-time WebSocket connection to the Node.js Neural Relay (Port 5005)
 * Captures live Swarm Tasks and System Signals.
 */
export interface SingularityProposal {
    id: string;
    file_path: string;
    description: string;
    original_content: string;
    proposed_content: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    timestamp: string;
}

export interface SwarmTelemetryData {
    tasks: SwarmTaskSchema[];
    signals: NeuralSignalSchema[];
    hardwareStats: any | null;
    mediaContext: any | null;
    proposals: SingularityProposal[];
    isConnected: boolean;
    dispatchTask: (_command: any) => boolean;
    actionPlan: any | null; // Phase 72: Active Dynamic Checklist
    globalContext: any | null; // Phase 78: Global Synthesized Array
}

export function useSwarmTelemetry(): SwarmTelemetryData {
    const [tasks, setTasks] = useState<SwarmTaskSchema[]>([]);
    const [signals, setSignals] = useState<NeuralSignalSchema[]>([]);
    const [hardwareStats, setHardwareStats] = useState<any | null>(null);
    const [mediaContext, setMediaContext] = useState<any | null>(null);
    const [actionPlan, setActionPlan] = useState<any | null>(null);
    const [globalContext, setGlobalContext] = useState<any | null>(null);
    const [proposals, setProposals] = useState<SingularityProposal[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    
    // Store socket reference to enable outbound transmissions
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        // Safe check for browser environment
        if (typeof window === 'undefined') return;

        const host = window.location.hostname;
        const ws = new WebSocket(`ws://${host}:5005`);

        ws.onopen = () => {
            console.log('[useSwarmTelemetry] Hydrating WebSocket link...');
            setIsConnected(true);
        };

        ws.onmessage = (event) => {
            try {
                // Determine if event data is a direct object or wrapped in {type, payload}
                const raw = JSON.parse(event.data);
                
                // Usually socket.io emitted events over raw WebSocket arrive somewhat wrapped
                // Assuming socket.io parsing might be an array: [eventName, payload]
                // OR an engine.io string. 
                // Let's rely on standard JSON for now.
                // Note: The UI previously assumed { type: 'TYPE', payload: ... }
                // For direct Socket.IO -> native WebSocket, Engine.IO framing applies, 
                // but if using native WebSocket on both sides it's pure JSON.
                // Assuming `socket.io-client` would be cleaner, but we adjust the JSON logic here:
                
                let evtType = raw.type;
                let payload = raw.payload || raw; // Fallback if it's direct

                // Socket.io standard packet format typically is: '42["EVENT_NAME", {payload}]'
                // For native websocket compatibility, we parse simple schemas:
                
                if (evtType === 'TASK_UPDATE' || (Array.isArray(raw) && raw[0] === 'TASK_UPDATE')) {
                    const taskData = Array.isArray(raw) ? raw[1] : payload;
                    setTasks(Array.isArray(taskData) ? taskData : []);
                } else if (evtType === 'HARDWARE_TELEMETRY' || (Array.isArray(raw) && raw[0] === 'HARDWARE_TELEMETRY')) {
                    const hwData = Array.isArray(raw) ? raw[1] : payload;
                    setHardwareStats(hwData);
                } else if (evtType === 'NOW_PLAYING' || (Array.isArray(raw) && raw[0] === 'NOW_PLAYING')) {
                    const mediaData = Array.isArray(raw) ? raw[1] : payload;
                    setMediaContext(mediaData);
                } else if (evtType === 'GLOBAL_CONTEXT_ARRAY' || (Array.isArray(raw) && raw[0] === 'GLOBAL_CONTEXT_ARRAY')) {
                    const ctxData = Array.isArray(raw) ? raw[1] : payload;
                    setGlobalContext(ctxData);
                } else if (evtType === 'NEURAL_SYNAPSE' || (Array.isArray(raw) && raw[0] === 'NEURAL_SYNAPSE')) {
                    const signalData = Array.isArray(raw) ? raw[1] : payload;
                    // Mock adapter for mapping synapse to signal structure if needed
                    const normalizedSignal: NeuralSignalSchema = {
                        signal_id: signalData.id || `syn-${Date.now()}`,
                        source: 'SYSTEM',
                        type: 'STATE_CHANGE',
                        severity: signalData.severity === 'CRITICAL' || signalData.severity === 'HIGH' ? signalData.severity : 'ROUTINE',
                        message: signalData.intent || signalData.msg || 'Neural Pulse',
                        timestamp: signalData.timestamp || new Date().toISOString(),
                        metadata: { event: signalData.intent || signalData.msg || 'Neural Pulse' }
                    };
                    setSignals(prev => [normalizedSignal, ...prev].slice(0, 100)); // Keep last 100
                }
            } catch (err) {
                // If it's a raw engine.io ping/pong (e.g. "2", "3"), quietly ignore
                if (event.data.startsWith('0') || event.data.startsWith('2') || event.data.startsWith('3') || event.data.startsWith('40')) {
                    return;
                }
                
                // Try parsing Socket.IO message arrays explicitly, e.g., 42["EVENT_NAME", payload]
                if (typeof event.data === 'string' && event.data.startsWith('42[')) {
                   try {
                       const parsed = JSON.parse(event.data.slice(2));
                       const evtName = parsed[0];
                       const payload = parsed[1];
                       
                       if (evtName === 'TASK_UPDATE') {
                           setTasks(Array.isArray(payload) ? payload : []);
                       } else if (evtName === 'HARDWARE_TELEMETRY') {
                           setHardwareStats(payload);
                       } else if (evtName === 'NOW_PLAYING') {
                           setMediaContext(payload);
                       } else if (evtName === 'GLOBAL_CONTEXT_ARRAY') {
                           setGlobalContext(payload);
                       } else if (evtName === 'NEURAL_SYNAPSE' || evtName === 'SYSTEM_EVENT') {
                           const normalizedSignal: NeuralSignalSchema = {
                               signal_id: payload.id || `syn-${Date.now()}`,
                               source: 'SYSTEM',
                               type: payload.type === 'error' ? 'ERROR' : 'LOG',
                               severity: payload.type === 'error' ? 'CRITICAL' : 'ROUTINE',
                               message: payload.intent || payload.msg || 'Neural Pulse',
                               timestamp: payload.timestamp || new Date().toISOString(),
                               metadata: payload
                           };
                           setSignals(prev => [normalizedSignal, ...prev].slice(0, 100));
                       } else if (evtName === 'SYSTEM_COMMAND') {
                           if (payload.command === 'ACTION_PLAN') {
                               console.log("[useSwarmTelemetry] Captured ACTION_PLAN payload:", payload.data);
                               setActionPlan(payload.data);
                           }
                        } else if (evtName === 'HEARTBEAT') {
                            setHardwareStats(payload);
                        } else if (evtName === 'NODE_HEARTBEAT') {
                            // Integrate specific node update into hardwareStats
                            setHardwareStats(prev => {
                                const nodes = prev?.vanguard || [];
                                const existingIdx = nodes.findIndex(n => n.node_name === payload.node_name || n.id === payload.id);
                                if (existingIdx > -1) {
                                    nodes[existingIdx] = { ...nodes[existingIdx], ...payload };
                                } else {
                                    nodes.push(payload);
                                }
                                return { ...prev, vanguard: [...nodes] };
                            });
                       } else if (evtName === 'SWARM_PROPOSAL') {
                           setProposals(prev => [payload, ...prev]);
                       }
                   } catch (e) {
                       // Ignore parsing errors for unknown payloads
                   }
                   return;
                }

                console.error('[useSwarmTelemetry] Corrupted pipeline frame:', err);
            }
        };

        ws.onclose = () => {
            setIsConnected(false);
            console.warn('[useSwarmTelemetry] Connection lost. Relay Server offline?');
            wsRef.current = null;
        };

        wsRef.current = ws;

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, []);

    const dispatchTask = (command: any) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            // Phase 82/83: Send strictly-typed Zero-Trust JSON payload, no Engine.IO wrappers.
            const packet = JSON.stringify({
                type: "PROCESS_TASK",
                payload: { prompt: typeof command === 'string' ? command : command.description || '' }
            });
            wsRef.current.send(packet);
            console.log(`[useSwarmTelemetry] Dispatched zero-trust task payload:`, command);
            return true;
        }
        console.error('[useSwarmTelemetry] Cannot dispatch, link is dead.', command);
        return false;
    };

    return { tasks, signals, hardwareStats, mediaContext, proposals, isConnected, dispatchTask, actionPlan, globalContext };
}
