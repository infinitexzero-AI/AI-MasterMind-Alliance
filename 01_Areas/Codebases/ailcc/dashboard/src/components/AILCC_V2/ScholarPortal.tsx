import React, { useState } from 'react';
import { Search, BookOpen, GraduationCap, FileText, AlertCircle, RefreshCw, ExternalLink, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ScholarPortal() {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [auditing, setAuditing] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [results, setResults] = useState<any[]>([]);

    const searchVault = async () => {
        if (!query) return;
        setLoading(true);
        try {
            const response = await fetch(`/api/scholar?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            setResults(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error('Search failed:', e);
        }
        setLoading(false);
    };

    const runAudit = async () => {
        setAuditing(true);
        try {
            await fetch('/api/scholar/audit', { method: 'POST' });
            // Optionally refresh or show success
        } catch (e) {
            console.error('Audit failed:', e);
        }
        setAuditing(false);
    };

    return (
        <div className="p-6 rounded-3xl border border-slate-700/20 bg-slate-900/60 backdrop-blur-xl space-y-8 h-full overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                        <GraduationCap className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Scholar Protocol</h2>
                        <p className="text-sm text-slate-400">Academic Dominance Engine</p>
                    </div>
                </div>
                <button
                    onClick={runAudit}
                    disabled={auditing}
                    aria-label="Run System Audit"
                    title="Run System Audit"
                    className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-purple-500/20 hover:border-purple-500/30 transition-all group"
                >
                    <RefreshCw className={`w-5 h-5 text-slate-400 group-hover:text-purple-400 ${auditing ? 'animate-spin text-purple-400' : ''}`} />
                </button>
            </div>

            {/* Credit Mapping Integration (New) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800/50 space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="text-[10px] font-mono text-green-400 uppercase tracking-wider font-bold">BSc Biology Progress</p>
                        <span className="text-xs font-mono text-slate-300">Target: May 2027</span>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <p className="text-2xl font-bold text-white leading-none">114 <span className="text-slate-500 text-sm font-normal uppercase tracking-tighter">/ 120 Units</span></p>
                            <p className="text-sm text-green-400 font-mono">95%</p>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '95%' }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono uppercase">
                        <div className="p-2 rounded bg-green-500/5 border border-green-500/10 text-green-400 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" /> CORE_SCIENCE: OK
                        </div>
                        <div className="p-2 rounded bg-yellow-500/5 border border-yellow-500/10 text-yellow-500 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full blink" /> APPEAL_PENDING
                        </div>
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800/50 space-y-4">
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Course Distribution</p>
                    <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
                        <div className="p-2 border border-slate-800/50 rounded-lg bg-slate-900/30">
                            <p className="text-slate-500 text-[9px] mb-1">CHEM 1001</p>
                            <p className="text-green-400 font-bold uppercase underline underline-offset-4 decoration-green-500/30">COMPLETE</p>
                        </div>
                        <div className="p-2 border border-slate-800/50 rounded-lg bg-slate-900/30">
                            <p className="text-slate-500 text-[9px] mb-1">MATH 1111</p>
                            <p className="text-yellow-500 font-bold uppercase">RECOVERY_REQ</p>
                        </div>
                        <div className="p-2 border border-slate-800/50 rounded-lg bg-slate-900/30">
                            <p className="text-slate-500 text-[9px] mb-1">BIOL 2811</p>
                            <p className="text-green-400 font-bold uppercase underline underline-offset-4 decoration-green-500/30">COMPLETE</p>
                        </div>
                        <div className="p-2 border border-slate-800/50 rounded-lg bg-slate-900/30">
                            <p className="text-slate-500 text-[9px] mb-1">BIOL 2701</p>
                            <p className="text-slate-600 font-bold uppercase">PENDING</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* GENS2101 - Active Course Intelligence */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-950/40 to-slate-950/40 border border-teal-500/20 space-y-4 shadow-[0_0_30px_rgba(20,184,166,0.08)]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-500/10 rounded-lg border border-teal-500/20">
                            <BookOpen className="w-4 h-4 text-teal-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-teal-300 uppercase tracking-wider">GENS/GENV 2101</h3>
                            <p className="text-[10px] font-mono text-slate-500">Natural Resource Management · Dr. Larry Swatuk</p>
                        </div>
                    </div>
                    <span className="px-2 py-1 text-[9px] font-mono font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-full uppercase tracking-wider">
                        IN PROGRESS
                    </span>
                </div>

                {/* Assignment Tracker */}
                <div className="space-y-2">
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Assignment 1 — Personal Vision Statement</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {[
                            { label: 'Draft Status', value: 'FINAL SUBMITTED', status: 'done' },
                            { label: 'Word Count', value: '~1,200 words', status: 'done' },
                            { label: 'Sources Cited', value: '10 / 10 confirmed', status: 'done' },
                            { label: 'Visuals Generated', value: '4 / 4 complete', status: 'done' },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/40 border border-slate-800/40">
                                <span className="text-[10px] font-mono text-slate-400">{item.label}</span>
                                <div className="flex items-center gap-1.5">
                                    <span className={`text-[10px] font-mono font-bold ${item.status === 'done' ? 'text-emerald-400' : item.status === 'warn' ? 'text-amber-400' : 'text-slate-500'}`}>
                                        {item.value}
                                    </span>
                                    {item.status === 'done' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                                    {item.status === 'warn' && <AlertTriangle className="w-3 h-3 text-amber-400" />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Key Sources Quick Status */}
                <div className="space-y-2">
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Source PDFs</p>
                    <div className="flex flex-wrap gap-1.5">
                        {[
                            { name: 'Steffen 2015', ok: true },
                            { name: 'Folke 2021', ok: true },
                            { name: 'Mitchell 2002', ok: true },
                            { name: 'Phare 2025', ok: false },
                            { name: 'Wells 2025', ok: false },
                            { name: 'Vicaire 2024', ok: false },
                            { name: 'Armitage 2007', ok: true },
                            { name: 'Lennox 2021', ok: false },
                            { name: 'Marshall 2021', ok: false },
                            { name: 'DFO 2023', ok: true },
                        ].map((src) => (
                            <span
                                key={src.name}
                                className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${src.ok
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    }`}
                            >
                                {src.ok ? '✓' : '⚠'} {src.name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* MTA Library Quick Access */}
            <div className="p-4 rounded-2xl bg-slate-950/40 border border-indigo-500/15 space-y-3">
                <p className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider font-bold">
                    Mount Allison University — Quick Access
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                        { label: 'MTA Library', url: 'https://library.mta.ca', color: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/15' },
                        { label: 'JSTOR', url: 'https://www.jstor.org', color: 'text-blue-400 border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/15' },
                        { label: 'Web of Science', url: 'https://www.webofscience.com', color: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/15' },
                        { label: 'Moodle', url: 'https://moodle.mta.ca', color: 'text-amber-400 border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/15' },
                    ].map((link) => (
                        <a
                            key={link.label}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${link.color}`}
                        >
                            {link.label}
                            <ExternalLink className="w-3 h-3 opacity-50" />
                        </a>
                    ))}
                </div>
            </div>

            {/* Search Module */}
            <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl blur-lg transition-opacity opacity-0 group-hover:opacity-100" />
                <div className="relative flex gap-3 p-1 rounded-xl bg-slate-950/50 border border-slate-800/50 focus-within:border-purple-500/50 transition-colors">
                    <div className="flex-1 flex items-center px-3 gap-3">
                        <Search className="w-5 h-5 text-slate-500" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && searchVault()}
                            placeholder="Query Intelligence Vault..."
                            className="bg-transparent w-full outline-none text-slate-200 placeholder-slate-600"
                        />
                    </div>
                    <button
                        onClick={searchVault}
                        disabled={loading}
                        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-lg font-semibold text-white shadow-lg shadow-purple-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Scanning...' : 'Search'}
                    </button>
                </div>
            </div>

            {/* Results Area */}
            {results.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">Signals Found</h3>
                    {results.map((res, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-4 rounded-xl bg-slate-800/20 border border-slate-700/30 hover:border-purple-500/30 hover:bg-slate-800/40 transition-all cursor-pointer group"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex gap-3">
                                    <FileText className="w-5 h-5 text-purple-400/70 group-hover:text-purple-400 transition-colors" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-200 group-hover:text-purple-200 transition-colors">
                                            {res.document}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                                Relevance: {(res.score * 100).toFixed(0)}%
                                            </span>
                                            <span className="text-xs text-slate-500">{res.timestamp}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Transcript Audit Area (Refined) */}
            <div className="pt-6 border-t border-slate-700/20">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-cyan-400" />
                        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">Transcript Reconciliation</h3>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-mono bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded uppercase font-bold">
                        TASK_127: APPEAL_REQUIRED
                    </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/20 border border-slate-800/50 flex items-start gap-3 relative group/audit">
                    <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover/audit:opacity-100 transition-opacity rounded-xl" />
                    <AlertCircle className="w-5 h-5 text-yellow-500/50 shrink-0 mt-0.5" />
                    <div className="relative z-10">
                        <p className="text-sm text-yellow-200/80 mb-1 font-bold">Audit Pending for 2023-2024 Cycle</p>
                        <p className="text-xs text-slate-400 leading-relaxed max-w-lg">
                            Degree requirements for <span className="text-cyan-400">Bachelor of Science (Biology)</span> require verification of 12 credits.
                            The 2023 Academic Appeal is currently draft-complete and ready for final submission.
                        </p>
                        <div className="flex gap-4 mt-4">
                            <button
                                onClick={runAudit}
                                disabled={auditing}
                                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors disabled:opacity-50 flex items-center gap-1 border border-cyan-400/20 px-3 py-1.5 rounded bg-cyan-400/5"
                            >
                                {auditing ? 'Running Audit...' : 'Run Audit Script →'}
                            </button>
                            <button className="text-xs font-bold text-yellow-500 hover:text-yellow-400 transition-colors border border-yellow-500/20 px-3 py-1.5 rounded bg-yellow-500/5 uppercase tracking-tighter">
                                View Appeal Draft
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
