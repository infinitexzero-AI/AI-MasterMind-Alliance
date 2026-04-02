import React, { useState, useEffect } from 'react';
import { Zap, Chrome, Compass, ArrowRightLeft, ShieldCheck } from 'lucide-react';
import { io } from 'socket.io-client';


export default function CometHub() {
    const [activeProfile, setActiveProfile] = useState<'COMET' | 'CHROME'>('COMET');
    const [bridgeStatus, setBridgeStatus] = useState<'CONNECTED' | 'DISCONNECTED' | 'SWITCHING'>('CONNECTED');
    const [llmMode, setLlmMode] = useState<'cloud' | 'local' | 'ollama'>('ollama');
    const [socket, setSocket] = useState<any>(null);

    useEffect(() => {
        const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
        const s = io(`http://${host}:5005`);
        setSocket(s);
        s.on('connect', () => setBridgeStatus('CONNECTED'));
        s.on('disconnect', () => setBridgeStatus('DISCONNECTED'));
        return () => { s.disconnect(); };
    }, []);

    const switchProfile = (profile: 'COMET' | 'CHROME') => {
        if (profile === activeProfile) return;
        setBridgeStatus('SWITCHING');
        setActiveProfile(profile);

        if (socket) {
            socket.emit('BROWSER_PROFILE_SWITCH', { profile });
        }

        setTimeout(() => setBridgeStatus('CONNECTED'), 2000);
    };

    return (
        <div className="renaissance-panel p-6 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Compass className="w-32 h-32 text-cyan-500 rotate-12" />
            </div>

            <div className="flex flex-col h-full relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-500/20 rounded-lg">
                            <Compass className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Comet Bridge</h2>
                            <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Agent Interop Layer</p>
                        </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-tighter ${bridgeStatus === 'CONNECTED' ? 'bg-emerald-500/20 text-emerald-400' :
                        bridgeStatus === 'SWITCHING' ? 'bg-amber-500/20 text-amber-400 animate-pulse' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                        {bridgeStatus}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <button
                        onClick={() => switchProfile('COMET')}
                        className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-3 ${activeProfile === 'COMET'
                            ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }`}
                    >
                        <Zap className={`w-8 h-8 ${activeProfile === 'COMET' ? 'text-cyan-400' : 'text-slate-500'}`} />
                        <span className="text-xs font-bold text-white">Comet.app</span>
                    </button>

                    <button
                        onClick={() => switchProfile('CHROME')}
                        className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-3 ${activeProfile === 'CHROME'
                            ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.2)]'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }`}
                    >
                        <Chrome className={`w-8 h-8 ${activeProfile === 'CHROME' ? 'text-blue-500' : 'text-slate-500'}`} />
                        <span className="text-xs font-bold text-white">Chrome Assist</span>
                    </button>
                </div>

                <div className="space-y-4">
                    {/* LLM Gateway Toggle */}
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-400" />
                                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">LLM Gateway</span>
                            </div>
                            <div className="flex bg-black/40 rounded-lg p-0.5 border border-white/5">
                                <button
                                    onClick={() => { setLlmMode('cloud'); socket?.emit('LLM_ROUTING_SWITCH', { mode: 'cloud' }); }}
                                    className={`px-2 py-1 text-[8px] font-bold rounded-md transition-all ${llmMode === 'cloud' ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-slate-500'}`}
                                >CLOUD</button>
                                <button
                                    onClick={() => { setLlmMode('local'); socket?.emit('LLM_ROUTING_SWITCH', { mode: 'local' }); }}
                                    className={`px-2 py-1 text-[8px] font-bold rounded-md transition-all ${llmMode === 'local' ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-white/5 text-slate-500'}`}
                                >LOCAL</button>
                                <button
                                    onClick={() => { setLlmMode('ollama'); socket?.emit('LLM_ROUTING_SWITCH', { mode: 'ollama' }); }}
                                    className={`px-2 py-1 text-[8px] font-bold rounded-md transition-all ${llmMode === 'ollama' ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.2)]' : 'hover:bg-white/5 text-slate-500'}`}
                                >OLLAMA</button>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 mb-2 font-mono">
                            MODE: <span className={llmMode === 'ollama' ? 'text-emerald-400' : 'text-cyan-400'}>
                                {llmMode === 'ollama' ? 'LOCAL-FIRST (GEMMA 3:4B)' : llmMode === 'local' ? 'HYBRID LOCAL' : 'CLOUD SYNTHESIS'}
                            </span>
                        </p>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
                                <span className="text-[10px] font-mono text-slate-400 uppercase">Handoff Protocol</span>
                            </div>
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                            Currently bridging Antigravity (Local) with {activeProfile === 'COMET' ? 'Comet AI' : 'Google Assist'}. Context relay is active.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
