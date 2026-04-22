import React, { useState } from 'react';
import { SearchCode, Zap, Info, AlertTriangle, Loader2 } from 'lucide-react';

interface Refactor {
    type: string;
    description: string;
    impact: 'High' | 'Medium' | 'Low';
}

export default function RefactorScanPanel() {
    const [filePath, setFilePath] = useState('');
    const [scanning, setScanning] = useState(false);
    const [results, setResults] = useState<Refactor[] | null>(null);
    const [thought, setThought] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const runScan = async () => {
        if (!filePath) return;
        setScanning(true);
        setError(null);
        setResults(null);
        try {
            const res = await fetch('/api/alliance/refactor-scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filePath })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Scan failed');
            setResults(data.refactors || []);
            setThought(data.thought || null);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setScanning(false);
        }
    };

    return (
        <div className="renaissance-panel p-6 bg-slate-950/80 backdrop-blur-xl border border-emerald-500/20 rounded-2xl relative overflow-hidden group shadow-[0_0_30px_rgba(16,185,129,0.1)] hover:border-emerald-500/40 transition-all">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none group-hover:bg-emerald-500/10 transition-all" />

            <h3 className="font-mono text-emerald-400 uppercase text-sm mb-6 flex items-center gap-3 font-bold tracking-widest border-b border-emerald-500/20 pb-4 relative z-10 transition-all group-hover:text-emerald-300">
                <SearchCode className="w-4 h-4" /> Proactive Refactor Scan
            </h3>

            <div className="space-y-4 relative z-10">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={filePath}
                        onChange={(e) => setFilePath(e.target.value)}
                        placeholder="Path to file (e.g. dashboard/pages/index.tsx)"
                        className="flex-1 bg-slate-900/60 border border-white/10 rounded-lg px-4 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-all"
                    />
                    <button
                        onClick={runScan}
                        disabled={scanning || !filePath}
                        className="bg-emerald-600/80 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2"
                    >
                        {scanning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                        Scan
                    </button>
                </div>

                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-[10px] font-mono">
                        [ERROR] {error}
                    </div>
                )}

                {thought && (
                    <details className="group/thought">
                        <summary className="text-[10px] font-mono text-emerald-500/60 uppercase cursor-pointer hover:text-emerald-400 transition-all select-none">
                            Architect Reasoning Process
                        </summary>
                        <div className="mt-2 p-3 bg-slate-900/60 border border-white/5 rounded-lg text-[10px] font-mono text-slate-400 italic whitespace-pre-wrap leading-relaxed">
                            {thought}
                        </div>
                    </details>
                )}

                <div className="space-y-2">
                    {results?.map((r, i) => (
                        <div key={i} className="p-3 bg-white/5 border border-white/10 rounded-lg group/item hover:border-emerald-500/30 transition-all">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter">{r.type}</span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono ${r.impact === 'High' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                        r.impact === 'Medium' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                                            'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                    }`}>
                                    {r.impact} IMPACT
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-300 leading-relaxed">{r.description}</p>
                        </div>
                    ))}
                    {results?.length === 0 && (
                        <div className="text-center py-4 text-slate-500 text-xs italic">
                            No immediate refactors proposed. The architecture appears sound.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
