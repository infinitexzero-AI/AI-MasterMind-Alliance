import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

export interface AntigravityState {
    status: 'idle' | 'working' | 'waiting' | 'offline' | 'throttled';
    currentTask?: string;
    lastEvent?: string;
    performance?: {
        cpu: number;
        memory: number;
        latency: number;
    };
}

export function useAntigravitySync() {
    const [state, setState] = useState<AntigravityState | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        // Connect directly to the Neural Uplink on port 5005
        const newSocket = io('http://localhost:5005', {
            transports: ['websocket'],
        });

        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('[useAntigravity] Connected to Neural Uplink');
            setState(prev => ({ ...prev, status: prev?.status === 'working' ? 'working' : 'idle' }));
        });

        newSocket.on('disconnect', () => {
            console.log('[useAntigravity] Disconnected from Neural Uplink');
            setState(prev => ({ ...prev, status: 'offline' }));
        });

        newSocket.on('AGENT_PROGRESS', (data) => {
            // Real-time throughput updates for AgentCard pulse
            setState(prev => ({
                ...prev,
                status: 'working',
                currentTask: data.task || prev?.currentTask,
                performance: data.performance || prev?.performance
            }));

            // Check throttling
            if (data.performance && data.performance.cpu) {
                const threshold = parseInt(localStorage.getItem('AILCC_CPU_THROTTLE') || '85', 10);
                if (data.performance.cpu > threshold) {
                    setState(prev => ({ ...prev, status: 'throttled' }));
                }
            }
        });

        newSocket.on('SYSTEM_EVENT', (event) => {
            // Task completions, handoffs, etc.
            setState(prev => ({
                ...prev,
                lastEvent: event.message || event.type,
                status: event.type === 'task_complete' ? 'idle' : (prev?.status || 'idle')
            }));
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    const sendCommand = async (command: string, payload?: any) => {
        try {
            const response = await fetch('/api/antigravity/command', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ command, payload }),
            });
            return await response.json();
        } catch (error) {
            console.error('[useAntigravity] Command failed:', error);
            return { success: false, error: String(error) };
        }
    };

    return { state, sendCommand, isConnected: socket?.connected || false };
}
