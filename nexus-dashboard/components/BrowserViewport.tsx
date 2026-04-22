import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MonitorPlay, WifiOff, Loader2 } from 'lucide-react';

interface BrowserViewportProps {
    isActive: boolean;
    currentUrl?: string;
}

export default function BrowserViewport({ isActive, currentUrl = 'about:blank' }: BrowserViewportProps) {
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [error, setError] = useState(false);
    const [fps, setFps] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const frameCount = useRef(0);
    const fpsTimer = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!isActive) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (fpsTimer.current) clearInterval(fpsTimer.current);
            return;
        }

        const poll = async () => {
            try {
                const res = await fetch('/api/browser-agent/screenshot?' + Date.now());
                if (!res.ok) { setError(true); return; }
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                setImgSrc(prev => { if (prev) URL.revokeObjectURL(prev); return url; });
                setError(false);
                frameCount.current++;
            } catch {
                setError(true);
            }
        };

        poll();
        intervalRef.current = setInterval(poll, 600);

        // FPS counter
        fpsTimer.current = setInterval(() => {
            setFps(frameCount.current);
            frameCount.current = 0;
        }, 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (fpsTimer.current) clearInterval(fpsTimer.current);
        };
    }, [isActive]);

    if (!isActive) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-slate-950/40 rounded-2xl border border-white/5">
                <MonitorPlay className="w-12 h-12 text-slate-700" />
                <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Browser offline — submit a task to activate</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-rose-950/20 rounded-2xl border border-rose-500/20">
                <WifiOff className="w-10 h-10 text-rose-500/60" />
                <p className="text-xs font-mono text-rose-400 uppercase tracking-widest">Browser server unreachable</p>
                <p className="text-[10px] text-slate-400 font-mono">Start with: <code className="text-cyan-400">npm run agent</code></p>
            </div>
        );
    }

    if (!imgSrc) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-slate-950/40 rounded-2xl border border-white/5">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Connecting to browser...</span>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative w-full h-full rounded-2xl overflow-hidden border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
        >
            {/* Browser chrome bar */}
            <div className="absolute top-0 left-0 right-0 z-10 h-9 bg-slate-900/90 backdrop-blur flex items-center px-3 gap-2 border-b border-white/10">
                {/* Traffic lights */}
                <div className="flex gap-1.5 flex-none">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                </div>

                {/* URL bar */}
                <div className="flex-1 mx-2 px-3 py-1 bg-slate-800/80 rounded-md flex items-center gap-2 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-emerald-500/60 flex-none" />
                    <span className="text-[9px] font-mono text-slate-400 truncate flex-1">{currentUrl}</span>
                </div>

                {/* FPS + LIVE badge */}
                <div className="flex items-center gap-2 flex-none">
                    <span className="text-[8px] font-mono text-slate-400">{fps}fps</span>
                    <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-[8px] font-mono text-emerald-400 uppercase">LIVE</span>
                    </div>
                </div>
            </div>

            {/* Screenshot viewport */}
            <img
                src={imgSrc}
                alt="Browser viewport"
                className="w-full h-full object-cover object-top pt-9 [image-rendering:auto]"
            />
        </motion.div>
    );
}
