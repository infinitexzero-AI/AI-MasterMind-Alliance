import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { SwarmTaskSchema, NeuralSignalSchema } from '../types/api';

/**
 * useSwarmTelemetry Hook
 * Opens a real-time Socket.IO connection to the Node.js Neural Relay (Port 3001)
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
    dispatchTask: (command: any) => boolean;
    actionPlan: any | null;
    globalContext: any | null;
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
    
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const host = window.location.hostname;
        const socket = io(`http://${host}:3001`);

        socket.on('connect', () => {
            console.log('[useSwarmTelemetry] Socket.IO link established.');
            setIsConnected(true);
        });

        socket.on('TASK_UPDATE', (data) => {
            setTasks(Array.isArray(data) ? data : []);
        });

        socket.on('HARDWARE_TELEMETRY', (data) => {
            setHardwareStats(data);
        });
        
        socket.on('HEARTBEAT', (data) => {
            setHardwareStats(data);
        });

        socket.on('NOW_PLAYING', (data) => {
            setMediaContext(data);
        });

        socket.on('GLOBAL_CONTEXT_ARRAY', (data) => {
            setGlobalContext(data);
        });

        socket.on('NEURAL_SYNAPSE', (data) => {
            const normalizedSignal: NeuralSignalSchema = {
                signal_id: data.id || `syn-${Date.now()}`,
                source: 'SYSTEM',
                type: 'STATE_CHANGE',
                severity: data.severity === 'CRITICAL' || data.severity === 'HIGH' ? data.severity : 'ROUTINE',
                message: data.intent || data.msg || 'Neural Pulse',
                timestamp: data.timestamp || new Date().toISOString(),
                metadata: data
            };
            setSignals(prev => [normalizedSignal, ...prev].slice(0, 100));
        });

        socket.on('SYSTEM_EVENT', (data) => {
            const normalizedSignal: NeuralSignalSchema = {
                signal_id: data.id || `syn-${Date.now()}`,
                source: 'SYSTEM',
                type: data.type === 'error' ? 'ERROR' : 'LOG',
                severity: data.type === 'error' ? 'CRITICAL' : 'ROUTINE',
                message: data.msg || 'Neural Pulse',
                timestamp: data.timestamp || new Date().toISOString(),
                metadata: data
            };
            setSignals(prev => [normalizedSignal, ...prev].slice(0, 100));
        });

        socket.on('SYSTEM_COMMAND', (data) => {
            if (data.command === 'ACTION_PLAN') {
                setActionPlan(data.data);
            }
        });

        socket.on('SWARM_PROPOSAL', (data) => {
            setProposals(prev => [data, ...prev]);
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
            console.warn('[useSwarmTelemetry] Connection lost.');
        });

        socketRef.current = socket;

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []);

    const dispatchTask = (command: any) => {
        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit('DISPATCH_VANGUARD_TASK', command);
            return true;
        }
        return false;
    };

    return { tasks, signals, hardwareStats, mediaContext, proposals, isConnected, dispatchTask, actionPlan, globalContext };
}
