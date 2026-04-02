import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Activity, Cpu, Layers, User, Zap } from 'lucide-react';
import { MasterCycleData } from '../types/comet_protocol';

const MasterCycleView: React.FC = () => {
    const [data, setData] = useState<MasterCycleData>({
        currentMode: 'Professional (2) - Productivity & Integration Optimization',
        systemStatus: '●●●●● (5/5 integrations active)',
        reason: 'Task focuses on code-based integrations, agent coordination, and data consolidation.',
        stats: {
            student: 'Research on API patterns complete',
            professional: '4 integration tasks in progress',
            life: 'Balance metrics stable',
            selfActualized: 'Innovation score 82/100',
            automation: '95% tasks delegated autonomously'
        },
        priorities: [
            '[Professional] Implement API access code',
            '[Automation] Set up real-time data stream',
            '[Self-Actualized] Optimize agent network'
        ],
        teamStatus: {
            superGrok: '✓ Orchestrating',
            comet: '✓ Mobile Sync',
            grok: '✓ Analyzing',
            perplexity: '✓ Research'
        }
    });

    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        const connect = () => {
            const wsUrl = 'ws://localhost:5005';
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    if (message.type === 'MASTER_CYCLE_UPDATE') {
                        setData(message.payload);
                    }
                } catch (e) {
                    // Ignore non-JSON messages
                }
            };

            ws.onclose = () => {
                setTimeout(connect, 3000);
            };
        };

        connect();

        return () => {
            wsRef.current?.close();
        };
    }, []);

    return (
        <div className="bg-black/80 border border-slate-700 rounded-lg p-6 font-mono text-sm shadow-2xl backdrop-blur-md relative overflow-hidden">
             {/* Header */}
            <div className="border-b border-slate-700 pb-4 mb-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-100 uppercase tracking-widest">
                    AI Lifecycle Command Center - Master View
                </h2>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">STATUS</span>
                    <span className="text-green-400 animate-pulse">{data.systemStatus}</span>
                </div>
            </div>

            {/* Current Mode */}
            <div className="mb-6 bg-slate-900/50 p-4 rounded border-l-4 border-blue-500">
                <div className="flex items-center gap-3 mb-2">
                    <Layers className="text-blue-400" size={18} />
                    <span className="text-blue-400 font-bold uppercase">Current Mode</span>
                </div>
                <div className="text-lg text-white mb-1">{data.currentMode}</div>
                <div className="text-slate-400 text-xs italic">{data.reason}</div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-900/30 p-3 rounded border border-slate-800">
                    <div className="flex items-center gap-2 mb-2 text-purple-400">
                        <Activity size={14} /> <span className="font-bold">Mode Stats</span>
                    </div>
                    <ul className="space-y-1 text-xs text-slate-300">
                        <li>🎓 Student: {data.stats.student}</li>
                        <li>💼 Professional: {data.stats.professional}</li>
                        <li>🏡 Life: {data.stats.life}</li>
                        <li>🌟 Self-Actualized: {data.stats.selfActualized}</li>
                    </ul>
                </div>
                <div className="bg-slate-900/30 p-3 rounded border border-slate-800">
                     <div className="flex items-center gap-2 mb-2 text-cyan-400">
                        <Cpu size={14} /> <span className="font-bold">Automation</span>
                    </div>
                    <div className="text-cyan-300 text-lg">{data.stats.automation}</div>
                </div>
            </div>

             {/* Priorities */}
             <div className="mb-6">
                <div className="flex items-center gap-2 mb-3 text-amber-400">
                    <Zap size={16} /> <span className="font-bold uppercase">Today's Priorities</span>
                </div>
                <div className="space-y-2">
                    {data.priorities.map((p, i) => (
                        <div key={i} className="flex items-center gap-2 text-slate-200 bg-slate-800/50 p-2 rounded">
                            <span className="text-amber-500 font-bold">{i + 1}.</span>
                            <span>{p}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Team Status */}
             <div className="mb-6">
                <div className="flex items-center gap-2 mb-3 text-emerald-400">
                    <User size={16} /> <span className="font-bold uppercase">AI Team Status</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {Object.entries(data.teamStatus).map(([agent, status]) => (
                        <div key={agent} className="flex justify-between items-center border-b border-slate-800 py-1">
                            <span className="capitalize text-slate-400">{agent}</span>
                            <span className="text-emerald-300">{status}</span>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Quick Actions Footer */}
            <div className="mt-4 pt-4 border-t border-slate-700 flex gap-2">
                {['Switch Mode', 'View SOPs', 'Add Task', 'Run Automation'].map((action) => (
                    <button key={action} className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-1 px-3 rounded transition-colors border border-slate-600">
                        [{action}]
                    </button>
                ))}
            </div>
        </div>
    );
};

export default MasterCycleView;
