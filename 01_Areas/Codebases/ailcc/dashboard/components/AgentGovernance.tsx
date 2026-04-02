import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal, ShieldCheck, Plus, X } from 'lucide-react';

export const AgentGovernance = () => {
    const [allowList, setAllowList] = useState([
        'git add .',
        'git commit -m',
        'git push origin',
        'git pull',
        'npm install',
        'npm run build',
        'npm run dev',
        'npm run lint -- --fix',
        'mkdir -p',
        'rm -rf',
        'mv',
        'cp -r',
        'touch',
        'echo',
        'python3 -m pip install',
        'python3',
        'node',
        'curl',
        'grep -r',
        'find .',
        'ls -la',
        'ps aux | grep'
    ]);
    const [newEntry, setNewEntry] = useState('');

    const addEntry = () => {
        if (newEntry && !allowList.includes(newEntry)) {
            setAllowList([...allowList, newEntry]);
            setNewEntry('');
        }
    };

    const removeEntry = (entry: string) => {
        setAllowList(allowList.filter(e => e !== entry));
    };

    return (
        <div className="space-y-6">
            <div className="renaissance-panel p-6 bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-xl">
                <header className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded bg-indigo-500/20 border border-indigo-500/50">
                        <ShieldCheck className="text-indigo-400" size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Security Governance</h2>
                        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                            Allow List Terminal Commands
                        </p>
                    </div>
                </header>

                <div className="bg-black/40 border border-slate-800 rounded-lg p-4 mb-6">
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed italic">
                        "Agent auto-executes commands matched by an allow list entry. For Unix shells, an allow list entry matches a command if its space-separated tokens form a prefix of the command's tokens."
                    </p>

                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                        {allowList.map((entry) => (
                            <div key={entry} className="flex items-center justify-between bg-white/5 border border-white/5 rounded px-3 py-2 group">
                                <div className="flex items-center gap-2">
                                    <Terminal size={12} className="text-slate-400" />
                                    <code className="text-xs text-cyan-400 font-mono">{entry}</code>
                                </div>
                                <button
                                    onClick={() => removeEntry(entry)}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 text-red-400 rounded transition-all"
                                    aria-label={`Remove ${entry} from allow list`}
                                    title={`Remove ${entry}`}
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newEntry}
                        onChange={(e) => setNewEntry(e.target.value)}
                        placeholder="Enter command prefix (e.g. 'git push')"
                        className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <button
                        onClick={addEntry}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded flex items-center gap-2 text-xs font-bold transition-colors"
                    >
                        <Plus size={16} />
                        ADD
                    </button>
                </div>
            </div>

            {/* Role Taxonomy Overlay */}
            <div className="renaissance-panel p-6 bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-xl border-l-4 border-l-emerald-500">
                <header className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded bg-emerald-500/20 border border-emerald-500/50">
                        <Terminal className="text-emerald-400" size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Role Taxonomy</h2>
                        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                            Intelligence Swarm Definitions
                        </p>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { name: "Comet", role: "The Scout", domain: "Browser, Research", color: "text-blue-400" },
                        { name: "Grok", role: "The Judge", domain: "Strategy, Log Analysis", color: "text-orange-400" },
                        { name: "Grok", role: "The Architect", domain: "Logic, Synthesis", color: "text-amber-400" },
                        { name: "Gemini", role: "The Craftsman", domain: "Code, Implementation", color: "text-cyan-400" },
                        { name: "Valentine", role: "The Visionary", domain: "UI/UX, Aesthetics", color: "text-pink-400" },
                        { name: "Antigravity", role: "The Bridge", domain: "Files, System Control", color: "text-emerald-400" }
                    ].map((agent) => (
                        <div key={agent.name} className="p-4 bg-white/5 border border-white/10 rounded-lg hover:border-emerald-500/50 transition-all group">
                            <div className="flex items-center justify-between mb-2">
                                <span className={`text-sm font-bold ${agent.color}`}>{agent.name}</span>
                                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white font-mono uppercase">
                                    {agent.role}
                                </span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-mono italic">{agent.domain}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-6 pt-6 border-t border-slate-800 flex justify-between items-center text-[10px] font-mono">
                    <span className="text-slate-400 uppercase">Swarm Coverage</span>
                    <span className="text-emerald-400 font-bold tracking-widest">7/11 ACTIVE</span>
                </div>
            </div>
        </div>
    );
};
