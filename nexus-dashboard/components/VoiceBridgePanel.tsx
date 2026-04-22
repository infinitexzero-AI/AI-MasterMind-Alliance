import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Volume2, Loader2, CheckCircle2 } from 'lucide-react';

const QUICK_PHRASES = [
    'System status report',
    'All agents nominal',
    'Air gap engaged',
    'Documentation scan complete',
    'Bundle size within limits',
];

export default function VoiceBridgePanel() {
    const [text, setText] = useState('');
    const [voice, setVoice] = useState('default');
    const [speaking, setSpeaking] = useState(false);
    const [lastSpoken, setLastSpoken] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const speak = async (override?: string) => {
        const content = override ?? text;
        if (!content.trim()) return;
        setSpeaking(true);
        try {
            const res = await fetch('/api/system/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: content, voice, mode: 'auto' })
            });

            if (res.headers.get('Content-Type')?.includes('audio/mpeg')) {
                // OpenAI route — play audio buffer in browser
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                if (audioRef.current) {
                    audioRef.current.src = url;
                    audioRef.current.play();
                }
            }
            // macOS route fires on the Mac speaker itself, no client-side audio
            setLastSpoken(content);
        } catch { /* ignore */ } finally {
            setSpeaking(false);
        }
    };

    return (
        <div className="renaissance-panel p-6 bg-slate-950/80 backdrop-blur-xl border border-fuchsia-500/20 rounded-2xl relative overflow-hidden group shadow-[0_0_30px_rgba(217,70,239,0.1)] hover:border-fuchsia-500/40 transition-all">
            <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/5 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
            <audio ref={audioRef} className="hidden" />

            <div className="flex justify-between items-center mb-5 border-b border-fuchsia-500/20 pb-4 relative z-10">
                <h3 className="font-mono text-fuchsia-400 font-bold uppercase tracking-[0.2em] flex items-center gap-3">
                    <Volume2 className="w-5 h-5" /> Voice Bridge
                </h3>
                <select
                    value={voice}
                    onChange={e => setVoice(e.target.value)}
                    title="Select TTS voice"
                    className="text-[11px] font-mono bg-slate-900 border border-fuchsia-500/30 text-fuchsia-300 rounded px-2 py-1 focus:outline-none"
                >
                    {['default', 'alex', 'allison', 'ava', 'karen', 'tom'].map(v => (
                        <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
                    ))}
                </select>
            </div>

            <div className="relative z-10 space-y-4">
                <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Type anything to speak aloud..."
                    className="w-full h-20 bg-slate-900/60 border border-fuchsia-500/20 rounded-xl p-3 text-sm text-slate-300 font-mono resize-none focus:outline-none focus:border-fuchsia-500/50 placeholder:text-slate-600"
                />

                <button
                    onClick={() => speak()}
                    disabled={speaking || !text.trim()}
                    className="w-full py-3 flex items-center justify-center gap-2 rounded-xl font-mono font-bold text-sm uppercase tracking-widest bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-300 hover:bg-fuchsia-500/30 transition-all disabled:opacity-40"
                >
                    {speaking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
                    {speaking ? 'Speaking...' : 'Speak'}
                </button>

                <div className="space-y-1.5">
                    <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Quick Phrases</p>
                    <div className="flex flex-wrap gap-1.5">
                        {QUICK_PHRASES.map(phrase => (
                            <button
                                key={phrase}
                                onClick={() => speak(phrase)}
                                disabled={speaking}
                                className="text-[10px] font-mono px-2 py-1 bg-slate-800/60 border border-fuchsia-500/20 text-slate-400 rounded hover:text-fuchsia-300 hover:border-fuchsia-500/40 transition-all disabled:opacity-40"
                            >
                                {phrase}
                            </button>
                        ))}
                    </div>
                </div>

                <AnimatePresence>
                    {lastSpoken && (
                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="flex items-center gap-2 text-emerald-400 text-[11px] font-mono p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">Spoke: "{lastSpoken.slice(0, 60)}{lastSpoken.length > 60 ? '...' : ''}"</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
