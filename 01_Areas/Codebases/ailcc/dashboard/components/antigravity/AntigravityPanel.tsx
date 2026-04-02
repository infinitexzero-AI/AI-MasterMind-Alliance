import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GoalBubble, type GoalBubbleProps } from './GoalBubble';
import { AgentOrbitDock, type AgentState } from './AgentOrbitDock';
import { ToolRegistryTray, type ActiveTool } from './ToolRegistryTray';
import { VirtualTouchBar } from './VirtualTouchBar';

// Mock Data Generators for Demo
const INITIAL_AGENTS: AgentState[] = [
    { id: '1', name: 'Comet', role: 'System Orchestrator', status: 'thinking', currentAction: 'Monitoring System' },
    { id: '2', name: 'Researcher', role: 'Information Retrieval', status: 'acting', currentAction: 'Searching web' },
    { id: '3', name: 'Coder', role: 'Implementation', status: 'idle' },
    { id: '4', name: 'Writer', role: 'Content Generation', status: 'idle' },
];

const INITIAL_GOALS: GoalBubbleProps[] = [
    { id: 'g1', title: 'Integrate CrewAI', priority: 'high', owner: 'Comet', status: 'completed', x: 0, y: -50 },
    { id: 'g2', title: 'Design Antigravity UI', priority: 'high', owner: 'Researcher', status: 'active', x: 100, y: 50 },
    { id: 'g3', title: 'Implement Components', priority: 'medium', owner: 'Coder', status: 'pending', x: -100, y: 50 },
    { id: 'g4', title: 'Verify Physics', priority: 'low', owner: 'Reviewer', status: 'pending', x: 0, y: 150 },
];

const SCHOLAR_CHAPTERS: GoalBubbleProps[] = [
    { id: 'c1', title: 'Intro to Law & Risk', priority: 'high', owner: 'Scholar', status: 'completed', x: -150, y: -100 },
    { id: 'c2', title: 'Torts & Negligence', priority: 'high', owner: 'Scholar', status: 'active', x: 0, y: -120 },
    { id: 'c3', title: 'Contracts: Creation', priority: 'medium', owner: 'Scholar', status: 'pending', x: 150, y: -100 },
    { id: 'c4', title: 'Sale of Goods', priority: 'medium', owner: 'Scholar', status: 'pending', x: -200, y: 50 },
    { id: 'c5', title: 'Intellectual Property', priority: 'low', owner: 'Scholar', status: 'pending', x: 200, y: 50 },
    { id: 'c6', title: 'Business Orgs', priority: 'medium', owner: 'Scholar', status: 'pending', x: 0, y: 150 },
    { id: 'c7', title: 'Employment Law', priority: 'low', owner: 'Scholar', status: 'pending', x: 0, y: 0 },
];

const SUB_TOPICS: Record<string, GoalBubbleProps[]> = {
    'c2': [
        { id: 't2_1', title: 'Intentional Torts', priority: 'high', owner: 'Scholar', status: 'pending', x: -50, y: -180 },
        { id: 't2_2', title: 'Duty of Care', priority: 'high', owner: 'Scholar', status: 'pending', x: 50, y: -180 },
        { id: 't2_3', title: 'Causation', priority: 'medium', owner: 'Scholar', status: 'pending', x: 0, y: -220 },
    ],
    'c3': [
        { id: 't3_1', title: 'Offer & Acceptance', priority: 'high', owner: 'Scholar', status: 'pending', x: 100, y: -150 },
        { id: 't3_2', title: 'Consideration', priority: 'high', owner: 'Scholar', status: 'pending', x: 200, y: -150 },
        { id: 't3_3', title: 'Capacity', priority: 'medium', owner: 'Scholar', status: 'pending', x: 150, y: -200 },
    ],
    'c6': [ // Business Orgs
        { id: 't6_1', title: 'Sole Proprietorship', priority: 'medium', owner: 'Scholar', status: 'pending', x: -50, y: 220 },
        { id: 't6_2', title: 'Partnerships', priority: 'medium', owner: 'Scholar', status: 'pending', x: 50, y: 220 },
        { id: 't6_3', title: 'Corporations', priority: 'high', owner: 'Scholar', status: 'pending', x: 0, y: 260 },
    ],
    'c5': [ // IP
        { id: 't5_1', title: 'Copyright', priority: 'low', owner: 'Scholar', status: 'pending', x: 250, y: 0 },
        { id: 't5_2', title: 'Patents', priority: 'low', owner: 'Scholar', status: 'pending', x: 280, y: 50 },
        { id: 't5_3', title: 'Trademarks', priority: 'low', owner: 'Scholar', status: 'pending', x: 250, y: 100 },
    ]
};

const EXAM_CHALLENGES: GoalBubbleProps[] = [
    { id: 'ex_1', title: 'Case: Donoghue v Stevenson', priority: 'high', owner: 'Exam', status: 'active', x: -100, y: -100 },
    { id: 'ex_2', title: 'Case: Carlill v Carbolic', priority: 'high', owner: 'Exam', status: 'active', x: 100, y: -100 },
    { id: 'ex_3', title: 'Define: Vicarious Liability', priority: 'medium', owner: 'Exam', status: 'pending', x: -100, y: 100 },
    { id: 'ex_4', title: 'Distinguish: Emp vs Contractor', priority: 'high', owner: 'Exam', status: 'pending', x: 100, y: 100 },
    { id: 'ex_5', title: 'Scenario: Slip & Fall', priority: 'medium', owner: 'Exam', status: 'active', x: 0, y: 0 },
];

export function AntigravityPanel() {
    const [agents, setAgents] = useState<AgentState[]>(INITIAL_AGENTS);
    const [goals, setGoals] = useState<GoalBubbleProps[]>(INITIAL_GOALS);
    const [tools, setTools] = useState<ActiveTool[]>([]);

    // Simulation Loop for Demo purposes
    useEffect(() => {
        const interval = setInterval(() => {
            // Toggle random agent status
            setAgents(prev => prev.map(a => ({
                ...a,
                status: Math.random() > 0.7 ? (Math.random() > 0.5 ? 'thinking' : 'acting') : 'idle',
                currentAction: Math.random() > 0.5 ? 'Processing data...' : undefined
            })));

            // Randomly spawn/remove a tool
            if (Math.random() > 0.7) {
                const newTool: ActiveTool = {
                    id: Date.now().toString(),
                    name: Math.random() > 0.5 ? 'WebSearch' : 'Terminal',
                    agentId: 'Researcher',
                    args: 'query="AI agents"',
                    timestamp: Date.now()
                };
                setTools(prev => [...prev.slice(-2), newTool]);

                // Remove after 3s
                setTimeout(() => {
                    setTools(prev => prev.filter(t => t.id !== newTool.id));
                }, 3000);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    // WebSocket Connection
    const [ws, setWs] = useState<WebSocket | null>(null);

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:5005');

        socket.onopen = () => {
            console.log('Antigravity Connected to Neural Relay');
            setWs(socket);
        };

        socket.onmessage = (event) => {
            try {
                // If it's a Buffer/Blob (unlikely with this server setup but possible), ignore or decode
                if (typeof event.data !== 'string') return;

                const data = JSON.parse(event.data);

                // Handle Tool Events from Python
                if (data.type === 'TOOL_EVENT') {
                    const tool = data.payload;
                    setTools(prev => [...prev.slice(-4), { ...tool, timestamp: Date.now() }]);
                    // Auto-expire
                    setTimeout(() => setTools(prev => prev.filter(t => t.id !== tool.id)), 4000);
                }

                // Handle Crew Status Updates
                if (data.type === 'CREW_STATUS') {
                    const { status, message } = data.payload;

                    // Update all agents to reflect the crew state for this demo
                    setAgents(prev => prev.map(a => {
                        // Orchestrator shows the status message
                        if (a.role === 'Orchestrator' || a.name === 'Comet') {
                            return { ...a, status: 'acting', currentAction: message };
                        }
                        // Others join in
                        if (status === 'WORKING') {
                            return { ...a, status: 'thinking' };
                        }
                        return a;
                    }));

                    if (status === 'COMPLETED') {
                        setGoals(prev => [
                            ...prev,
                            { id: `res_${Date.now()}`, title: 'Crew Finished', priority: 'high', owner: 'Comet', status: 'completed', x: 0, y: 0 }
                        ]);
                    }
                }

            } catch (e) {
                console.error('WS Parse Error', e);
            }
        };

        return () => socket.close();
    }, []);

    const handleGoalDrag = (id: string, x: number, y: number) => {
        setGoals(prev => prev.map(g => g.id === id ? { ...g, x, y } : g));
    };

    const handleGoalClick = (id: string) => {
        // Check for sub-topics
        if (SUB_TOPICS[id]) {
            const newTopics = SUB_TOPICS[id];
            // Check if already expanded
            if (goals.some(g => g.id === newTopics[0].id)) return;

            setGoals(prev => [...prev, ...newTopics]);

            // Trigger "Research" for this topic
            setTools(prev => [
                ...prev,
                { id: `yt_${Date.now()}`, name: 'YouTube', agentId: 'Scholar', args: `Searching: ${SCHOLAR_CHAPTERS.find(c => c.id === id)?.title} Playlist`, timestamp: Date.now() }
            ]);
        }
    };

    const handleTouchAction = (action: string) => {
        console.log('Touch Bar Action:', action);

        if (action === 'comet' || action === 'launch') {
            const task = action === 'launch' ? 'Execute AILCC Mission' : 'System Improvement Plan';

            // Visual Feedback
            setAgents(prev => prev.map(a => a.name === 'Comet' ? { ...a, status: 'acting', currentAction: `Initializing: ${task}...` } : a));

            // Send Real Request to Neural Relay
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'CREW_START',
                    payload: {
                        task: task,
                        context: 'User requested via Antigravity UI'
                    }
                }));
            } else {
                console.warn("WebSocket not ready");
            }

            // Mock Tool to show immediate feedback while python boots
            const newTool: ActiveTool = {
                id: `cmd_${Date.now()}`,
                name: 'CrewCommand',
                agentId: 'Comet',
                args: `START_CREW: ${task}`,
                timestamp: Date.now()
            };
            setTools(prev => [...prev.slice(-2), newTool]);
            setTimeout(() => setTools(prev => prev.filter(t => t.id !== newTool.id)), 3000);
            return;
        }

        // ... existing mock handlers for other buttons ...
        const newTool: ActiveTool = {
            id: Date.now().toString(),
            name: action === 'design' ? 'WebSearch' : 'Terminal',
            agentId: 'Comet',
            args: `EXEC_PROTOCOL: ${action.toUpperCase()}`,
            timestamp: Date.now()
        };
        setTools(prev => [...prev.slice(-2), newTool]);
        setTimeout(() => setTools(prev => prev.filter(t => t.id !== newTool.id)), 3000);

        if (action === 'design') {
            setGoals(prev => [
                ...prev,
                { id: `g_new_${Date.now()}`, title: 'Optimize UX Buttons', priority: 'high', owner: 'Researcher', status: 'active', x: 0, y: 0 }
            ]);
        } else if (action === 'mobile') {
            // Valentine Integration (English)
            setAgents(prev => [...prev, { id: 'val_1', name: 'Valentine', role: 'Mobile Assistant', status: 'acting', currentAction: 'Syncing from iOS...' }]);
        } else if (action === 'ping') {
            // Check if Valentine is active
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'PING_REQUEST' }));
            }
        }
    };

    const [storage, setStorage] = useState<{ freeGb: number; status: string } | null>(null);

    // Poll Storage Health
    useEffect(() => {
        const checkStorage = async () => {
            try {
                const res = await fetch('/api/system/storage');
                if (res.ok) {
                    const data = await res.json();
                    setStorage(data);
                }
            } catch (e) {
                console.error('Storage Check Failed', e);
            }
        };
        checkStorage();
        const interval = setInterval(checkStorage, 60000); // Every minute
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full h-[600px] overflow-hidden bg-gradient-to-br from-gray-900 via-black to-slate-900 rounded-3xl border border-white/10 shadow-2xl flex">

            {/* Virtual Touch Bar (Top Center) */}
            <VirtualTouchBar onAction={handleTouchAction} />

            {/* Background Grid/Effect */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
                <div className="absolute inset-0 bg-radial-gradient(circle_at_center,transparent_0%,black_100%)" />
            </div>

            {/* Left Dock */}
            <div className="relative z-30 h-full">
                <AgentOrbitDock agents={agents} />
            </div>

            {/* Main Canvas Area */}
            <div className="flex-1 relative h-full flex items-center justify-center">

                {/* Center Gravity Point Visual */}
                <div className="absolute w-2 h-2 bg-white/10 rounded-full animate-pulse" />

                {/* Goal Bubbles */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative w-full h-full pointer-events-auto">
                        {/* Centering wrapper for coordinates relative to center? 
                        Ideally we'd use a physics engine, but for now absolute 50% + offset works 
                    */}
                        {goals.map(goal => (
                            <div key={goal.id} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                                <GoalBubble
                                    {...goal}
                                    onDragEnd={handleGoalDrag}
                                    onClick={() => handleGoalClick(goal.id)}
                                />
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Bottom Tool Tray */}
            <ToolRegistryTray activeTools={tools} />

            {/* Debug / Status Indicator */}
            <div className="absolute top-4 right-4 z-40 flex flex-col items-end gap-2">
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur rounded-full px-3 py-1 border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-white/60">SYSTEM: ONLINE</span>
                </div>
                {storage && (
                    <div className={`flex items-center gap-2 bg-black/40 backdrop-blur rounded-full px-3 py-1 border transition-colors ${storage.status === 'critical' ? 'border-red-500/50 bg-red-900/20' :
                        storage.status === 'warning' ? 'border-yellow-500/50 bg-yellow-900/20' :
                            'border-white/10'
                        }`}>
                        <div className={`w-2 h-2 rounded-full animate-pulse ${storage.status === 'critical' ? 'bg-red-500' :
                            storage.status === 'warning' ? 'bg-yellow-500' :
                                'bg-emerald-400'
                            }`} />
                        <span className={`text-[10px] font-mono ${storage.status === 'critical' ? 'text-red-200' :
                            storage.status === 'warning' ? 'text-yellow-200' :
                                'text-emerald-200/80'
                            }`}>
                            SSD: {storage.freeGb}GB
                        </span>
                    </div>
                )}
            </div>

        </div>
    );
}
