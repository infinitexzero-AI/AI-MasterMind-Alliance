import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Box, Cpu, HardDrive, Archive, CheckCircle, Clock } from 'lucide-react';

interface ParaNexusProps {
    tasks: any[];
}

export function ParaNexusView({ tasks }: ParaNexusProps) {
    // Map existing tasks or mock tasks into PARA structures
    const projects = tasks.filter(t => t.paraBucket === 'PROJECT' || t.category === 'RESEARCH'); 
    const areas = tasks.filter(t => t.paraBucket === 'AREA' || t.track === 'LIFE');
    const resources = tasks.filter(t => t.paraBucket === 'RESOURCE' || t.category === 'OPERATIONS');
    const archives = tasks.filter(t => t.paraBucket === 'ARCHIVE' || t.status === 'COMPLETED');

    const renderLane = (title: string, icon: React.ReactNode, items: any[], color: string) => (
        <div className={`bg-slate-900/60 rounded-2xl border border-white/5 shadow-sm p-4 flex flex-col min-h-[400px]`}>
            <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                <div className={`p-1.5 rounded-lg ${color}`}>{icon}</div>
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">{title} <span className="text-slate-500 text-xs ml-1">({items.length})</span></h3>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item, i) => (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        key={item.id} 
                        className="bg-slate-800/80 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors"
                    >
                        <div className="flex justify-between items-start gap-2 mb-2">
                            <span className="text-xs font-semibold text-white truncate leading-tight">{item.directive || item.title}</span>
                            <span className="text-[9px] font-bold text-slate-400 bg-black/40 px-1.5 py-0.5 rounded">{item.id.split('-')[1]}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                            {item.assignedTo && (
                                <span className={`px-1.5 py-0.5 rounded border border-white/5 uppercase ${color.replace('bg-', 'text-').replace('/20', '')}`}>
                                    {item.assignedTo}
                                </span>
                            )}
                            {item.telemetry?.progress !== undefined && (
                                <span>{item.telemetry.progress}%</span>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col gap-6">
            {/* PANEL 1: PARA LANES */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {renderLane('Projects', <Box className="w-4 h-4 text-blue-400" />, projects, 'bg-blue-500/20')}
                {renderLane('Areas', <Layers className="w-4 h-4 text-emerald-400" />, areas, 'bg-emerald-500/20')}
                {renderLane('Resources', <HardDrive className="w-4 h-4 text-purple-400" />, resources, 'bg-purple-500/20')}
                {renderLane('Archive', <Archive className="w-4 h-4 text-slate-400" />, archives, 'bg-slate-500/20')}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* PANEL 2: Active Projects List */}
                <div className="lg:col-span-8 bg-slate-900/60 rounded-2xl border border-white/5 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Box className="w-5 h-5 text-indigo-400" />
                        <h2 className="text-sm font-bold text-white uppercase tracking-widest">Active Vanguard Projects</h2>
                    </div>
                    <div className="space-y-4">
                        {projects.map(p => {
                            const getWidthClass = (pct: number) => {
                                if (pct === 0) return 'w-0';
                                if (pct < 15) return 'w-1/12';
                                if (pct < 30) return 'w-1/4';
                                if (pct < 45) return 'w-1/3';
                                if (pct < 60) return 'w-1/2';
                                if (pct < 75) return 'w-2/3';
                                if (pct < 90) return 'w-3/4';
                                if (pct < 100) return 'w-11/12';
                                return 'w-full';
                            };
                            return (
                                <div key={p.id} className="bg-slate-800/80 rounded-xl p-4 border border-white/5">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="text-sm font-semibold text-white">{p.directive || p.title}</h4>
                                        <span className="text-xs text-slate-400 uppercase tracking-widest">{p.category || 'TECH'}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mb-4">{p.why || p.narrative}</p>
                                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                                        <div className={`h-full bg-indigo-500 ${getWidthClass(p.telemetry?.progress || 0)}`} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* PANEL 3: Area Health */}
                <div className="lg:col-span-4 bg-slate-900/60 rounded-2xl border border-white/5 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Cpu className="w-5 h-5 text-teal-400" />
                        <h2 className="text-sm font-bold text-white uppercase tracking-widest">Area Health Matrices</h2>
                    </div>
                    <div className="space-y-3">
                        {['Academic Trajectory', 'AILCC Ops', 'Medical CanMEDS'].map(area => {
                            const healthScore = Math.floor(Math.random() * 20) + 80; // Mock highly healthy baseline
                            return (
                                <div key={area} className="bg-slate-800/80 rounded-xl p-4 border border-white/5 flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-white uppercase">{area}</span>
                                        <span className={`text-xs font-mono font-bold ${healthScore > 90 ? 'text-emerald-400' : 'text-amber-400'}`}>{healthScore}%</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] text-slate-500">
                                        <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> 2 Active Projects</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Touched 2h ago</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
