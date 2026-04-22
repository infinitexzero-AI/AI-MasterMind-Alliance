import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Sun, Zap, Shield, Moon, Trophy,
    Clock, Target,
    CheckCircle2, Circle, Flame, Brain, Sparkles,
    Wand2, Settings, History
} from 'lucide-react';

interface DailyEntry {
    date: string;
    topTask: string;
    timeBlocks: { am: string; pm: string; eve: string };
    energy: number;
    focusMinutes: number;
    reflection: { win: string; learn: string; tomorrow: string };
    shutdownComplete: boolean;
}

const EMPTY_ENTRY: DailyEntry = {
    date: new Date().toISOString().split('T')[0],
    topTask: '',
    timeBlocks: { am: '', pm: '', eve: '' },
    energy: 3,
    focusMinutes: 0,
    reflection: { win: '', learn: '', tomorrow: '' },
    shutdownComplete: false,
};

const ENERGY_LEVELS = [
    { emoji: '😴', label: 'Drained', color: 'text-red-400', bg: 'bg-red-500/20' },
    { emoji: '😐', label: 'Low', color: 'text-orange-400', bg: 'bg-orange-500/20' },
    { emoji: '🙂', label: 'Steady', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    { emoji: '😊', label: 'Good', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
    { emoji: '🔥', label: 'Charged', color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
];



export default function DailyPage() {
    const [entry, setEntry] = useState<DailyEntry>(EMPTY_ENTRY);
    const [streak, setStreak] = useState<number>(0);
    const [weekDays, setWeekDays] = useState<{ date: string; completed: boolean }[]>([]);
    const [saving, setSaving] = useState(false);
    const [focusActive, setFocusActive] = useState(false);
    const [focusTimer, setFocusTimer] = useState(0);
    const [generating, setGenerating] = useState(false);

    // Mock pending tasks for generation
    const PENDING_TASKS = [
        { id: '1', label: 'Finish Thesis Draft', energyWeight: 'HIGH' as const, category: 'Academic' },
        { id: '2', label: 'Sync Zotero Data', energyWeight: 'LOW' as const, category: 'Academic' },
        { id: '3', label: 'Review Budget', energyWeight: 'MEDIUM' as const, category: 'Finance' },
    ];

    // Load today's entry
    useEffect(() => {
        fetch('/api/daily')
            .then(r => r.json())
            .then(data => {
                if (data.today) setEntry({ ...EMPTY_ENTRY, ...data.today });
                if (data.streak !== undefined) setStreak(data.streak);
                if (data.week) setWeekDays(data.week);
            })
            .catch(() => { });
    }, []);

    // Focus timer
    useEffect(() => {
        if (!focusActive) return;
        const interval = setInterval(() => setFocusTimer(t => t + 1), 1000);
        return () => clearInterval(interval);
    }, [focusActive]);

    const save = async (updates: Partial<DailyEntry>) => {
        const updated = { ...entry, ...updates };
        setEntry(updated);
        setSaving(true);
        try {
            await fetch('/api/daily', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated),
            });
        } catch { }
        setTimeout(() => setSaving(false), 500);
    };

    const formatTimer = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    const generateRoutine = async () => {
        setGenerating(true);
        try {
            const res = await fetch('/api/routine/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    energy: entry.energy,
                    availableHours: 8, // Default
                    tasks: PENDING_TASKS
                }),
            });
            if (res.ok) {
                const optimized = await res.json();
                save({
                    topTask: optimized.am,
                    timeBlocks: {
                        am: optimized.am,
                        pm: optimized.pm,
                        eve: optimized.eve
                    }
                });
            }
        } catch (e) {
            console.error("Generation failed", e);
        } finally {
            setTimeout(() => setGenerating(false), 800);
        }
    };

    const today = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const greeting = today.getHours() < 12 ? 'Good morning' : today.getHours() < 17 ? 'Good afternoon' : 'Good evening';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                        Daily System
                    </h1>
                    <p className="text-slate-400 mt-1">{greeting}. Build your momentum.</p>
                </div>
                <div className="flex items-center gap-3">
                    {saving && (
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-emerald-400 font-mono">
                            Saved ✓
                        </motion.span>
                    )}
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/60 border border-white/10">
                        <Flame className="w-5 h-5 text-orange-400" />
                        <span className="text-xl font-bold text-white">{streak}</span>
                        <span className="text-xs text-slate-400">day streak</span>
                    </div>
                </div>
            </div>

            {/* 7-Day Streak Bar */}
            <div className="flex gap-2">
                {weekDays.length > 0 ? weekDays.map((d, _i) => (
                    <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[10px] font-mono text-slate-500">
                            {dayNames[new Date(d.date + 'T12:00:00').getDay()]}
                        </span>
                        <div className={`w-full h-2 rounded-full transition-all ${d.completed ? 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_0_8px_rgba(251,146,60,0.4)]' : 'bg-slate-800'
                            }`} />
                    </div>
                )) : Array.from({ length: 7 }, (_, i) => {
                    const d = new Date(); d.setDate(d.getDate() - 6 + i);
                    return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-[10px] font-mono text-slate-500">{dayNames[d.getDay()]}</span>
                            <div className={`w-full h-2 rounded-full ${i === 6 ? 'bg-slate-700' : 'bg-slate-800'}`} />
                        </div>
                    );
                })}
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Card 1: Morning Plan (#1, #2, #4) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:border-amber-500/20 transition-all"
                >
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                            <Sun className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Morning Plan</h2>
                            <p className="text-xs text-slate-400">Top task + time blocks + routine</p>
                        </div>
                        <button
                            onClick={generateRoutine}
                            disabled={generating}
                            aria-label="Generate Routine"
                            title="Generate Autonomous Routine"
                            className={`ml-auto p-2 rounded-lg border transition-all ${generating ? 'bg-amber-500/20 border-amber-500/30' : 'bg-slate-800 border-slate-700 hover:border-amber-500/50 group'}`}
                        >
                            <Wand2 className={`w-4 h-4 text-amber-400 ${generating ? 'animate-pulse' : 'group-hover:scale-110'}`} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-mono text-amber-400/80 uppercase tracking-wider mb-1.5 block">
                                <Target className="w-3 h-3 inline mr-1" /> #1 Priority Task
                            </label>
                            <input
                                type="text"
                                value={entry.topTask}
                                onChange={e => save({ topTask: e.target.value })}
                                placeholder="What's the ONE thing that matters most today?"
                                className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/20 transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { key: 'am' as const, label: 'Morning', icon: '☀️' },
                                { key: 'pm' as const, label: 'Afternoon', icon: '🌤' },
                                { key: 'eve' as const, label: 'Evening', icon: '🌙' },
                            ].map(block => (
                                <div key={block.key}>
                                    <label className="text-[10px] font-mono text-slate-500 mb-1 block">{block.icon} {block.label}</label>
                                    <input
                                        type="text"
                                        value={entry.timeBlocks[block.key]}
                                        onChange={e => save({ timeBlocks: { ...entry.timeBlocks, [block.key]: e.target.value } })}
                                        placeholder="Focus..."
                                        className="w-full bg-slate-800/40 border border-slate-700/30 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-amber-500/40 focus:outline-none transition-all"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Card 2: Energy Check (#6) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:border-emerald-500/20 transition-all"
                >
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Energy Check</h2>
                            <p className="text-xs text-slate-400">Adjust your day based on how you feel</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="text-center py-4">
                            <span className="text-6xl">{ENERGY_LEVELS[entry.energy - 1]?.emoji}</span>
                            <p className={`text-lg font-semibold mt-2 ${ENERGY_LEVELS[entry.energy - 1]?.color}`}>
                                {ENERGY_LEVELS[entry.energy - 1]?.label}
                            </p>
                        </div>

                        <div className="flex justify-center gap-3">
                            {ENERGY_LEVELS.map((level, i) => (
                                <button
                                    key={i}
                                    onClick={() => save({ energy: i + 1 })}
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all ${entry.energy === i + 1
                                        ? `${level.bg} border-2 border-white/20 scale-110 shadow-lg`
                                        : 'bg-slate-800/40 border border-slate-700/30 hover:bg-slate-700/40'
                                        }`}
                                >
                                    {level.emoji}
                                </button>
                            ))}
                        </div>

                        <div className={`text-center text-sm px-4 py-3 rounded-lg ${ENERGY_LEVELS[entry.energy - 1]?.bg}`}>
                            {entry.energy <= 2 && <p className="text-slate-300">💡 Low energy? Do your hardest task first, then coast. Give yourself permission to do less.</p>}
                            {entry.energy === 3 && <p className="text-slate-300">💡 Steady state. Stick to your plan and protect your focus blocks.</p>}
                            {entry.energy >= 4 && <p className="text-slate-300">💡 High energy! Attack your #1 task now. Consider adding a bonus deep work session.</p>}
                        </div>
                    </div>
                </motion.div>

                {/* Card 3: Focus Mode (#3) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:border-violet-500/20 transition-all"
                >
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Focus Mode</h2>
                            <p className="text-xs text-slate-400">Limit digital distractions</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-6 py-4">
                        <div className={`text-5xl font-mono font-bold ${focusActive ? 'text-violet-400' : 'text-slate-600'}`}>
                            {formatTimer(focusTimer)}
                        </div>

                        <button
                            onClick={() => {
                                if (focusActive) {
                                    save({ focusMinutes: entry.focusMinutes + Math.floor(focusTimer / 60) });
                                    setFocusTimer(0);
                                }
                                setFocusActive(!focusActive);
                            }}
                            className={`px-8 py-3 rounded-xl font-semibold text-sm transition-all ${focusActive
                                ? 'bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30'
                                : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/20'
                                }`}
                        >
                            {focusActive ? 'End Focus Session' : 'Start Focus Session'}
                        </button>

                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Clock className="w-3 h-3" />
                            <span>Total today: {entry.focusMinutes + (focusActive ? Math.floor(focusTimer / 60) : 0)} min focused</span>
                        </div>
                    </div>
                </motion.div>

                {/* Card 4: Evening Reflect (#5, #7) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:border-blue-500/20 transition-all"
                >
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <Moon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Evening Reflect</h2>
                            <p className="text-xs text-slate-400">3-minute reflection + shutdown ritual</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {[
                            { key: 'win' as const, label: 'Today\'s Win', icon: <Trophy className="w-3 h-3 text-amber-400" />, placeholder: 'What went well?' },
                            { key: 'learn' as const, label: 'Lesson Learned', icon: <Brain className="w-3 h-3 text-cyan-400" />, placeholder: 'What did you learn?' },
                            { key: 'tomorrow' as const, label: 'Tomorrow\'s Seed', icon: <Sparkles className="w-3 h-3 text-violet-400" />, placeholder: 'One thing to carry forward?' },
                        ].map(field => (
                            <div key={field.key}>
                                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                                    {field.icon} {field.label}
                                </label>
                                <input
                                    type="text"
                                    value={entry.reflection[field.key]}
                                    onChange={e => save({ reflection: { ...entry.reflection, [field.key]: e.target.value } })}
                                    placeholder={field.placeholder}
                                    className="w-full bg-slate-800/40 border border-slate-700/30 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-blue-500/40 focus:outline-none transition-all"
                                />
                            </div>
                        ))}

                        <button
                            onClick={() => save({ shutdownComplete: !entry.shutdownComplete })}
                            className={`w-full mt-3 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${entry.shutdownComplete
                                ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                                : 'bg-slate-800/60 border border-slate-700/30 text-slate-400 hover:bg-slate-700/40 hover:text-white'
                                }`}
                        >
                            {entry.shutdownComplete ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                            {entry.shutdownComplete ? 'Shutdown Complete ✓' : 'Complete Shutdown Ritual'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
