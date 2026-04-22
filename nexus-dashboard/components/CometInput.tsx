import React, { useState } from 'react';
import { Send, Zap, Activity } from 'lucide-react';

interface CometInputProps {
    onSubmit: (data: any) => Promise<void>;
    isProcessing?: boolean;
}

export function CometInput({ onSubmit, isProcessing = false }: CometInputProps) {
    const [goal, setGoal] = useState('');
    const [domain, setDomain] = useState('automation');
    const [priority, setPriority] = useState('normal');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!goal.trim()) return;

        onSubmit({
            title: 'New Comet Request', // Auto-generated for now
            description: goal,
            intent: {
                goal,
                domain
            },
            priority
        });

        setGoal('');
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative bg-slate-900 ring-1 ring-white/10 rounded-lg p-2 flex flex-col md:flex-row gap-2">

                    {/* Main Input */}
                    <div className="flex-1">
                        <textarea
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            placeholder="Describe your task for the Alliance..."
                            className="w-full h-24 md:h-12 bg-transparent text-slate-100 placeholder-slate-500 text-sm p-3 focus:outline-none resize-none"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                        />
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2 px-2 border-t md:border-t-0 md:border-l border-white/5 pt-2 md:pt-0">
                        <select
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            className="bg-slate-800 text-xs text-slate-300 rounded px-2 py-1 outline-none border border-white/5 hover:border-cyan-500/30 transition-colors"
                        >
                            <option value="automation">Automation</option>
                            <option value="code_generation">Code Gen</option>
                            <option value="research">Research</option>
                            <option value="high_priority">Urgent</option>
                        </select>

                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className="bg-slate-800 text-xs text-slate-300 rounded px-2 py-1 outline-none border border-white/5 hover:border-purple-500/30 transition-colors"
                        >
                            <option value="low">Low</option>
                            <option value="normal">Normal</option>
                            <option value="high">High</option>
                            <option value="urgent">Critical</option>
                        </select>

                        <button
                            type="submit"
                            disabled={isProcessing || !goal.trim()}
                            className={`p-2 rounded-md transition-all ${goal.trim()
                                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg hover:shadow-cyan-500/20 hover:scale-105'
                                    : 'bg-slate-800 text-slate-400 cursor-not-allowed'
                                }`}
                        >
                            {isProcessing ? <Activity className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
