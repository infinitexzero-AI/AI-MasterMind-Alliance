import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clipboard, Send, ArrowDown, CheckCircle2, Loader2, Globe, ShieldCheck, AlertCircle } from 'lucide-react';

export default function ClipboardSyncPanel() {
    const [pushContent, setPushContent] = useState('');
    const [macClipboard, setMacClipboard] = useState<string | null>(null);
    const [loading, setLoading] = useState<'push' | 'pull' | null>(null);
    const [lastAction, setLastAction] = useState<string | null>(null);
    const [syncStatus, setSyncStatus] = useState<{ source: string, timestamp: string } | null>(null);
    const [networkMode, setNetworkMode] = useState<'LOCAL' | 'CLOUD' | 'LINKING'>('LINKING');

    const checkHealth = useCallback(async () => {
        try {
            const res = await fetch('/api/system/health');
            if (res.ok) {
                const data = await res.json();
                setNetworkMode(data.redis === 'CONNECTED' ? 'CLOUD' : 'LOCAL');
            }
        } catch { setNetworkMode('LOCAL'); }
    }, []);

    const pullFromRelay = useCallback(async () => {
        setLoading('pull');
        try {
            const res = await fetch('/api/system/clipboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'get' })
            });
            if (res.ok) {
                const data = await res.json();
                setMacClipboard(data.text);
                setSyncStatus({ source: data.source, timestamp: data.timestamp });
                setLastAction(`Sync: received ${data.text.length} chars from ${data.source}`);
            }
        } catch { /* ignore */ } finally { setLoading(null); }
    }, []);

    const pushToRelay = useCallback(async () => {
        if (!pushContent.trim()) return;
        setLoading('push');
        try {
            const res = await fetch('/api/system/clipboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: 'set', 
                    text: pushContent, 
                    source: 'Dashboard' 
                })
            });
            if (res.ok) {
                setLastAction(`Pushed ${pushContent.length} chars to Universal Relay`);
                setPushContent('');
                pullFromRelay(); // Refresh state
            }
        } catch { /* ignore */ } finally { setLoading(null); }
    }, [pushContent, pullFromRelay]);

    // Initial sync
    useEffect(() => {
        checkHealth();
        pullFromRelay();
        const interval = setInterval(() => {
            checkHealth();
            pullFromRelay();
        }, 10000); // 10s auto-refresh
        return () => clearInterval(interval);
    }, [pullFromRelay, checkHealth]);

    return (
        <div className="renaissance-panel p-6 bg-slate-950/80 backdrop-blur-xl border border-lime-500/20 rounded-2xl relative overflow-hidden group shadow-[0_0_30px_rgba(132,204,22,0.08)] hover:border-lime-500/40 transition-all">
            <div className="absolute top-0 right-0 w-64 h-64 bg-lime-500/5 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />

            <div className="flex justify-between items-center mb-5 border-b border-lime-500/20 pb-4 relative z-10">
                <div>
                    <h3 className="font-mono text-lime-400 font-bold uppercase tracking-[0.2em] flex items-center gap-3">
                        <Globe className="w-5 h-5 animate-pulse" /> Universal Clipboard
                    </h3>
                    {syncStatus && (
                        <div className="text-[9px] font-mono text-slate-500 mt-1 uppercase tracking-tighter">
                            Last Sync: {syncStatus.source} @ {new Date(syncStatus.timestamp).toLocaleTimeString()}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2">
                             <span className={`w-1.5 h-1.5 rounded-full ${networkMode === 'CLOUD' ? 'bg-lime-500 shadow-[0_0_8px_rgba(132,204,22,1)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,1)]'}`} />
                             <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                                {networkMode === 'CLOUD' ? 'Sync Enabled' : 'Local Only'}
                             </span>
                        </div>
                        <div className="text-[9px] font-mono text-slate-600 uppercase tracking-tighter">Phase 27 Protocol</div>
                    </div>
                </div>
            </div>

            <div className="relative z-10 space-y-4">
                {/* Push to Relay */}
                <div className="space-y-2">
                    <label className="text-[10px] font-mono text-lime-400/70 uppercase tracking-widest flex items-center gap-1.5">
                        <Send className="w-3 h-3" /> Push to Universal Relay
                    </label>
                    <textarea
                        value={pushContent}
                        onChange={e => setPushContent(e.target.value)}
                        placeholder="Paste an error, URL, or code snippet from this device..."
                        className="w-full h-16 bg-slate-900/60 border border-lime-500/20 rounded-xl p-3 text-xs text-slate-300 font-mono resize-none focus:outline-none focus:border-lime-500/50 placeholder:text-slate-600"
                    />
                    <button
                        onClick={pushToRelay}
                        disabled={loading !== null || !pushContent.trim()}
                        className="w-full py-2 flex items-center justify-center gap-2 rounded-lg font-mono text-xs uppercase tracking-widest bg-lime-500/20 border border-lime-500/40 text-lime-300 hover:bg-lime-500/30 transition-all disabled:opacity-40"
                    >
                        {loading === 'push' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        Broadcast to All Nodes
                    </button>
                </div>

                <div className="border-t border-slate-800/60" />

                {/* Read Current State */}
                <div className="space-y-2">
                    <label className="text-[10px] font-mono text-lime-400/70 uppercase tracking-widest flex items-center gap-1.5">
                        <Clipboard className="w-3 h-3" /> Latest Shared Content
                    </label>
                    <button
                        onClick={pullFromRelay}
                        disabled={loading !== null}
                        className="w-full py-2 flex items-center justify-center gap-2 rounded-lg font-mono text-xs uppercase tracking-widest bg-slate-800/60 border border-lime-500/20 text-slate-300 hover:border-lime-500/40 hover:text-lime-300 transition-all disabled:opacity-40"
                    >
                        {loading === 'pull' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowDown className="w-3.5 h-3.5" />}
                        Refresh Universal State
                    </button>
                    <AnimatePresence mode="wait">
                        {macClipboard !== null && (
                            <motion.div 
                                key={macClipboard}
                                initial={{ opacity: 0, y: 5 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                exit={{ opacity: 0, y: -5 }}
                                className="bg-slate-900/60 rounded-lg border border-lime-500/20 p-3 text-[11px] text-slate-300 font-mono max-h-24 overflow-y-auto"
                            >
                                {macClipboard || <span className="text-slate-600 italic">Universal clipboard is empty</span>}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <AnimatePresence>
                    {lastAction && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex items-center gap-2 text-emerald-400 text-[10px] font-mono bg-emerald-500/5 p-2 rounded border border-emerald-500/10">
                            <ShieldCheck className="w-3.5 h-3.5" /> {lastAction}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
