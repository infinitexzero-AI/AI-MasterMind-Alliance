import React from 'react';
import { Puzzle, CheckCircle2, Circle, Settings, Trash2, ExternalLink } from 'lucide-react';
import { usePlugins } from '../hooks/usePlugins';
import { motion, AnimatePresence } from 'framer-motion';

export const PluginManager: React.FC = () => {
    const { plugins, togglePlugin } = usePlugins();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
                <Puzzle className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-medium text-slate-100">Extensions & Orbitals</h3>
            </div>

            <div className="grid gap-4">
                {plugins.length > 0 ? (
                    plugins.map((plugin) => (
                        <div key={plugin.metadata.id} className="p-4 bg-slate-900/40 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-lg ${plugin.enabled ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}>
                                        <Puzzle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-slate-100">{plugin.metadata.name}</span>
                                            <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">v{plugin.metadata.version}</span>
                                        </div>
                                        <div className="text-xs text-slate-500 font-mono mt-0.5">{plugin.metadata.author.toUpperCase()}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => togglePlugin(plugin.metadata.id)}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all ${plugin.enabled
                                                ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                                                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                                            }`}
                                    >
                                        {plugin.enabled ? "Enabled" : "Disabled"}
                                    </button>
                                </div>
                            </div>

                            <p className="text-xs text-slate-400 leading-relaxed mb-4 font-sans opacity-80">
                                {plugin.metadata.description}
                            </p>

                            <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                                <button className="text-[10px] font-mono text-slate-500 hover:text-cyan-400 flex items-center gap-1.5 uppercase tracking-wider transition-colors">
                                    <Settings className="w-3 h-3" />
                                    Configure
                                </button>
                                <button className="text-[10px] font-mono text-slate-500 hover:text-red-400 flex items-center gap-1.5 uppercase tracking-wider transition-colors ml-auto">
                                    <Trash2 className="w-3 h-3" />
                                    Purge
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-8 text-center bg-slate-900/40 border border-white/5 border-dashed rounded-xl">
                        <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">No active extensions discovered in Hippocampus</span>
                    </div>
                )}
            </div>

            <div className="pt-4">
                <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-mono text-slate-400 hover:bg-white/10 transition-all uppercase tracking-widest flex items-center justify-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Explore Swarm Marketplace
                </button>
            </div>
        </div>
    );
};
