import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clipboard, Send, ArrowDown, CheckCircle2, Loader2 } from 'lucide-react';

export default function ClipboardSyncPanel() {
    const [pushContent, setPushContent] = useState('');
    const [macClipboard, setMacClipboard] = useState<string | null>(null);
    const [loading, setLoading] = useState<'push' | 'pull' | null>(null);
    const [lastAction, setLastAction] = useState<string | null>(null);

    const pullFromMac = useCallback(async () => {
        setLoading('pull');
        try {
            const res = await fetch('/api/clipboard/sync');
            if (res.ok) {
                const data = await res.json();
                setMacClipboard(data.content);
                setLastAction(`Pulled ${data.length} chars from Mac clipboard`);
            }
        } catch { /* ignore */ } finally { setLoading(null); }
    }, []);

    const pushToMac = useCallback(async () => {
        if (!pushContent.trim()) return;
        setLoading('push');
        try {
            const res = await fetch('/api/clipboard/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: pushContent })
            });
            if (res.ok) {
                setLastAction(`Pushed ${pushContent.length} chars to Mac clipboard`);
                setPushContent('');
            }
        } catch { /* ignore */ } finally { setLoading(null); }
    }, [pushContent]);

    return (
        <div className="renaissance-panel p-6 bg-slate-950/80 backdrop-blur-xl border border-lime-500/20 rounded-2xl relative overflow-hidden group shadow-[0_0_30px_rgba(132,204,22,0.08)] hover:border-lime-500/40 transition-all">
            <div className="absolute top-0 right-0 w-64 h-64 bg-lime-500/5 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />

            <div className="flex justify-between items-center mb-5 border-b border-lime-500/20 pb-4 relative z-10">
                <h3 className="font-mono text-lime-400 font-bold uppercase tracking-[0.2em] flex items-center gap-3">
                    <Clipboard className="w-5 h-5" /> Cross-Device Clipboard
                </h3>
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">pbcopy / pbpaste</div>
            </div>

            <div className="relative z-10 space-y-4">
                {/* Push to Mac */}
                <div className="space-y-2">
                    <label className="text-[10px] font-mono text-lime-400/70 uppercase tracking-widest flex items-center gap-1.5">
                        <Send className="w-3 h-3" /> Push to Mac clipboard
                    </label>
                    <textarea
                        value={pushContent}
                        onChange={e => setPushContent(e.target.value)}
                        placeholder="Paste an error, URL, or code snippet from your phone..."
                        className="w-full h-16 bg-slate-900/60 border border-lime-500/20 rounded-xl p-3 text-xs text-slate-300 font-mono resize-none focus:outline-none focus:border-lime-500/50 placeholder:text-slate-600"
                    />
                    <button
                        onClick={pushToMac}
                        disabled={loading !== null || !pushContent.trim()}
                        className="w-full py-2 flex items-center justify-center gap-2 rounded-lg font-mono text-xs uppercase tracking-widest bg-lime-500/20 border border-lime-500/40 text-lime-300 hover:bg-lime-500/30 transition-all disabled:opacity-40"
                    >
                        {loading === 'push' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        Send to Mac
                    </button>
                </div>

                <div className="border-t border-slate-800/60" />

                {/* Pull from Mac */}
                <div className="space-y-2">
                    <label className="text-[10px] font-mono text-lime-400/70 uppercase tracking-widest flex items-center gap-1.5">
                        <ArrowDown className="w-3 h-3" /> Read Mac clipboard
                    </label>
                    <button
                        onClick={pullFromMac}
                        disabled={loading !== null}
                        className="w-full py-2 flex items-center justify-center gap-2 rounded-lg font-mono text-xs uppercase tracking-widest bg-slate-800/60 border border-lime-500/20 text-slate-300 hover:border-lime-500/40 hover:text-lime-300 transition-all disabled:opacity-40"
                    >
                        {loading === 'pull' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowDown className="w-3.5 h-3.5" />}
                        Read Clipboard
                    </button>
                    <AnimatePresence>
                        {macClipboard !== null && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                className="bg-slate-900/60 rounded-lg border border-lime-500/20 p-3 text-[11px] text-slate-300 font-mono max-h-20 overflow-y-auto">
                                {macClipboard || <span className="text-slate-600">Clipboard is empty</span>}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <AnimatePresence>
                    {lastAction && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex items-center gap-2 text-emerald-400 text-[11px] font-mono">
                            <CheckCircle2 className="w-3.5 h-3.5" /> {lastAction}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
