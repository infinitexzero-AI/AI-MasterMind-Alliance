import React, { useState, useEffect } from 'react';
import NexusLayout from '../components/NexusLayout';
import { Settings2, Cpu, HardDrive, ShieldAlert, Save } from 'lucide-react';
import { useAntigravitySync } from '../hooks/useAntigravitySync';
import { SecuritySettings } from '../components/SecuritySettings';
import { PluginManager } from '../components/PluginManager';
import { AchievementStats } from '../components/AchievementStats';

export default function SettingsPage() {
    const [cpuThreshold, setCpuThreshold] = useState(85);
    const [saved, setSaved] = useState(false);

    // Load from local storage on mount
    useEffect(() => {
        const stored = localStorage.getItem('AILCC_CPU_THROTTLE');
        if (stored) setCpuThreshold(parseInt(stored, 10));
    }, []);

    const handleSave = () => {
        localStorage.setItem('AILCC_CPU_THROTTLE', cpuThreshold.toString());
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        // Force an event to tell hook to re-read
        window.dispatchEvent(new Event('ailcc-settings-updated'));
    };

    return (
        <NexusLayout>
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="flex items-center gap-4 mb-8 border-b border-slate-700/50 pb-6">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 shadow-inner">
                        <Settings2 className="w-8 h-8 text-cyan-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">System Configuration</h1>
                        <p className="text-slate-400 font-mono text-sm max-w-2xl">
                            Govern the alliance's global operational parameters and resource constraints.
                        </p>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Resource Throttling Card */}
                    <div className="renaissance-panel p-6 border border-slate-700/50 flex flex-col h-full relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Cpu className="w-32 h-32" />
                        </div>
                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <ShieldAlert className="w-5 h-5 text-amber-500" />
                            <h2 className="text-lg font-bold text-white uppercase tracking-widest">Resource Throttling</h2>
                        </div>
                        <div className="text-sm text-slate-400 mb-6 relative z-10 hidden sm:block">
                            Configure thresholds to pause non-critical background agents (like indexing or deep research) when your Mac's resources are constrained.
                        </div>

                        <div className="space-y-6 flex-1 relative z-10">
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <label htmlFor="cpu-throttle-range" className="text-xs font-mono text-slate-300">Max Sustained CPU Target</label>
                                    <span className="text-lg font-bold text-cyan-400">{cpuThreshold}%</span>
                                </div>
                                <input
                                    id="cpu-throttle-range"
                                    type="range"
                                    min="50"
                                    max="100"
                                    step="5"
                                    value={cpuThreshold}
                                    onChange={(e) => setCpuThreshold(parseInt(e.target.value, 10))}
                                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400 transition-all"
                                    title="CPU Throttle Percentage"
                                />
                                <div className="mt-2 text-[10px] text-slate-500 font-mono uppercase">
                                    If OS CPU remains above {cpuThreshold}% for &gt;30s, background tasks will be suspended.
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 mt-6 border-t border-slate-700/50 relative z-10 text-right">
                            <button onClick={handleSave} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-mono font-bold uppercase tracking-widest rounded transition-all flex items-center gap-2 ml-auto border border-cyan-500/20">
                                <Save className="w-3.5 h-3.5" />
                                {saved ? 'Saved' : 'Apply Protocol'}
                            </button>
                        </div>
                    </div>

                    {/* Biometric Sovereignty Card */}
                    <div className="renaissance-panel p-6 border border-slate-700/50 flex flex-col h-full relative overflow-hidden group">
                        <SecuritySettings />
                    </div>

                    {/* Plugin Extensions Card */}
                    <div className="renaissance-panel p-6 border border-slate-700/50 flex flex-col h-full relative overflow-hidden group col-span-1 md:col-span-2">
                        <PluginManager />
                    </div>

                    {/* Mastery Cortex Card */}
                    <div className="renaissance-panel p-6 border border-slate-700/50 flex flex-col h-full relative overflow-hidden group col-span-1 md:col-span-2">
                        <AchievementStats />
                    </div>

                    {/* Placeholder for future settings */}
                    <div className="renaissance-panel p-6 border border-slate-700/50 flex flex-col h-full opacity-50 grayscale">
                        <div className="flex items-center gap-3 mb-6">
                            <HardDrive className="w-5 h-5 text-slate-400" />
                            <h2 className="text-lg font-bold text-slate-300 uppercase tracking-widest">Storage & Archival</h2>
                        </div>
                        <div className="text-sm text-slate-500">
                            (Locked) Automatic snapshot and vector space compaction protocols.
                        </div>
                    </div>
                </div>
            </div>
        </NexusLayout>
    );
}

