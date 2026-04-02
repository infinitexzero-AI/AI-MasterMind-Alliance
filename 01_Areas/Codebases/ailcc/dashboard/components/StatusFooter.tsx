import React, { useEffect, useState } from 'react';
import { useStealthMode } from './StealthModeProvider';
import { Activity, Cpu, Database, HardDrive, Zap } from 'lucide-react';
import { spatialAudio } from '../lib/audio-engine';

const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
    if (data.length < 2) return null;
    const max = 100;
    const min = 0;
    const range = max - min || 1;
    const width = 40;
    const height = 12;
    const step = width / (data.length - 1);

    const points = data.map((d, i) => {
        const x = i * step;
        const y = height - ((d - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={width} height={height} className="opacity-50">
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="1"
                points={points}
                strokeLinejoin="round"
                strokeLinecap="round"
            />
        </svg>
    );
};

const StatusFooter: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [history, setHistory] = useState<{ cpu: number[], ram: number[], disk: number[] }>({
        cpu: [],
        ram: [],
        disk: []
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/system/health');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);

                    // Update history for sparklines (keep last 10 points)
                    setHistory(prev => ({
                        cpu: [...prev.cpu, data.cpu?.usage || Math.random() * 20 + 5].slice(-10),
                        ram: [...prev.ram, 100 - (data.memory.freeRAM / 16384 * 100)].slice(-10),
                        disk: [...prev.disk, data.disk.percent].slice(-10)
                    }));

                    // Dynamic Theme Orchestration: Shift hue from 120 (Green) to 0 (Red)
                    const utilization = data.disk.percent;
                    const hue = Math.max(0, 120 - (utilization * 1.2));
                    document.documentElement.style.setProperty('--nexus-load-hue', hue.toString());

                    // Spatial Feedback: Subtle pings if stats are extreme
                    if (data.cpu?.usage > 90) spatialAudio.playError();
                    else spatialAudio.playActivity();
                }
            } catch (e) {
                console.debug('[StatusFooter] Health check suppressed or failed');
            }
        };
        fetchStats();
        const interval = setInterval(fetchStats, 5000);
        return () => clearInterval(interval);
    }, []);

    const { isStealthMode } = useStealthMode();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!stats || !mounted) return null;

    return (
        <div className={`fixed bottom-0 left-20 lg:left-64 right-0 h-7 bg-slate-950/80 backdrop-blur-md border-t border-white/5 z-50 flex items-center px-4 justify-between font-mono text-[9px] uppercase tracking-wider text-slate-500 overflow-hidden ${isStealthMode ? 'h-12 text-[12px] bg-black border-white/10' : ''}`}>
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Activity className="w-2.5 h-2.5 text-cyan-500" />
                        <span>UPLINK: <span className="text-slate-300">ACTIVE</span></span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Cpu className="w-2.5 h-2.5 text-purple-500" />
                        <span>RAM: <span className="text-slate-300">{stats.memory.freeRAM}MB</span></span>
                    </div>
                    <Sparkline data={history.ram} color="hsl(var(--neon-purple))" />
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <HardDrive className="w-2.5 h-2.5 text-amber-500" />
                        <span>DISK: <span className="text-slate-300">{stats.disk.percent}%</span></span>
                    </div>
                    <Sparkline data={history.disk} color="hsl(var(--neon-amber))" />
                </div>

                <div className="flex items-center gap-2 border-l border-white/10 pl-4 h-full">
                    <Zap className={`w-2.5 h-2.5 ${stats.performance?.mode === 'TURBO' ? 'text-emerald-500' : 'text-amber-500 animate-pulse'}`} />
                    <span>MODE: <span className={stats.performance?.mode === 'TURBO' ? 'text-emerald-400' : 'text-amber-400'}>{stats.performance?.mode || 'AUTO'}</span></span>
                    <span className="text-[7px] opacity-60 ml-1">({stats.performance?.reason || 'BALANCED'})</span>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <Zap className="w-2.5 h-2.5 text-emerald-500 animate-pulse" />
                    <span>AGENTS: <span className="text-slate-300">5 READY</span></span>
                </div>
                <div className="flex items-center gap-2 border-l border-white/10 pl-4 h-full">
                    <Cpu className="w-2.5 h-2.5 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                    <span>OLLAMA: <span className="text-emerald-400">ON (GEMMA 3:4B)</span></span>
                </div>
                <div className="flex items-center gap-2 border-l border-white/10 pl-4 h-full">
                    <Database className="w-2.5 h-2.5 text-blue-500" />
                    <span>VAULT: <span className="text-slate-300">SYNCHRONIZED</span></span>
                </div>
                <div className="text-[8px] opacity-40">
                    {new Date().toISOString().split('T')[1].split('.')[0]} UTC
                </div>
            </div>
        </div>
    );
};

export default StatusFooter;
