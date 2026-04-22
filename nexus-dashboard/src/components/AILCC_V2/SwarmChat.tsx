import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Zap, Shield, Sparkles, ServerCrash, Send, User } from 'lucide-react';
import clsx from 'clsx';

// Dynamically assign icons based on role from the API.
const getIcon = (role: string) => {
    switch (role?.toUpperCase()) {
        case 'STRATEGY': return Sparkles;
        case 'EXECUTION': return Zap;
        case 'SECURITY': return Shield;
        case 'USER': return User;
        case 'SYSTEM':
        case 'HEARTBEAT': return ServerCrash;
        default: return Network;
    }
};

const HANDLE_MAP: Record<string, string> = {
    '@comet': 'research',
    '@antigravity': 'code',
    '@grok': 'strategy',
    '@nexus': 'general'
};

export const SwarmChat = () => {
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Web Audio Context for Spatial Panning
    const audioCtxRef = useRef<AudioContext | null>(null);

    const speakWithSpatialAudio = (text: string, panValue: number) => {
        if (!('speechSynthesis' in window)) return;

        // Initialize AudioContext on first interaction
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        const utterance = new SpeechSynthesisUtterance(text);

        // Select a modern system voice if available
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Siri') || v.name.includes('Daniel') || v.name.includes('Samantha'));
        if (preferredVoice) utterance.voice = preferredVoice;

        // To route SpeechSynthesis through Web Audio API, we have to use a MediaStream destination trick,
        // but SpeechSynthesis directly outputs to system speakers natively.
        // A simpler, very effective fallback for spatial UI without routing the actual text-to-speech
        // through the panner (which is complex due to browser sandbox limits on SpeechSynthesis output)
        // is to play a subtle "activation ping" through the PannerNode just BEFORE the voice speaks,
        // drawing the user's attention to that physical side of the room.

        const osc = audioCtxRef.current.createOscillator();
        const panner = audioCtxRef.current.createStereoPanner();
        const gain = audioCtxRef.current.createGain();

        // Pan left (-1) or right (1)
        panner.pan.value = panValue;

        // Soft UI tech ping
        osc.type = 'sine';
        osc.frequency.setValueAtTime(panValue < 0 ? 800 : 1200, audioCtxRef.current.currentTime);
        gain.gain.setValueAtTime(0.1, audioCtxRef.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtxRef.current.currentTime + 0.1);

        osc.connect(panner);
        panner.connect(gain);
        gain.connect(audioCtxRef.current.destination);

        osc.start();
        osc.stop(audioCtxRef.current.currentTime + 0.1);

        // Finally, speak the actual text
        window.speechSynthesis.speak(utterance);
    };

    const fetchSwarmData = async () => {
        try {
            const res = await fetch('/api/swarm');
            if (res.ok) {
                const data = await res.json();
                setMessages((prev) => {
                    const existingSignatures = new Set(prev.map(m => m.msg + m.timestamp));
                    const newEvents = data.filter((m: any) => !existingSignatures.has(m.msg + m.timestamp));

                    if (newEvents.length > 0 && newEvents[0].role !== 'USER' && newEvents[0].role !== 'SYSTEM') {
                        // Pan left for strategy/scout (-0.8), right for exec/synthesis (0.8)
                        const pan = ['STRATEGY', 'SCOUT'].includes(newEvents[0].role) ? -0.8 : 0.8;
                        speakWithSpatialAudio(newEvents[0].msg, pan);
                    }

                    return [...prev, ...newEvents].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                });
            }
        } catch (e) {
            console.error("Failed to fetch swarm data", e);
        }
    };

    useEffect(() => {
        fetchSwarmData();
        const timer = setInterval(fetchSwarmData, 10000); // Slower polling to favor real-time chat
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isProcessing) return;

        const userMsg = input.trim();
        setInput('');
        setIsProcessing(true);

        // Add User Message Optimistically
        const newMsg = {
            agent: 'OPERATOR',
            role: 'USER',
            msg: userMsg,
            color: 'text-white',
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, newMsg]);

        // Parse @mention routing
        let targetAgent = 'general';
        const match = userMsg.match(/^(@\w+)/i);
        if (match && HANDLE_MAP[match[1].toLowerCase()]) {
            targetAgent = HANDLE_MAP[match[1].toLowerCase()];
        }

        try {
            const res = await fetch('/api/alliance/dispatch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task: userMsg, agentOverride: targetAgent })
            });

            if (res.ok) {
                const data = await res.json();

                // Add Agent Response
                const agentResponse = {
                    agent: data.agentType.toUpperCase(),
                    role: data.agentType === 'research' ? 'SCOUT' :
                        data.agentType === 'code' ? 'EXECUTION' :
                            data.agentType === 'strategy' ? 'STRATEGY' : 'SYNTHESIS',
                    msg: data.response,
                    color: data.agentType === 'code' ? 'text-blue-400' :
                        data.agentType === 'research' ? 'text-cyan-400' :
                            data.agentType === 'strategy' ? 'text-amber-400' : 'text-emerald-400',
                    timestamp: new Date().toISOString()
                };

                // Pan left for strategy/scout (-0.8), right for exec/synthesis (0.8)
                const pan = ['STRATEGY', 'SCOUT'].includes(agentResponse.role) ? -0.8 : 0.8;
                speakWithSpatialAudio(agentResponse.msg, pan);

                setMessages(prev => [...prev, agentResponse]);
            }
        } catch (err) {
            setMessages(prev => [...prev, {
                agent: 'SYSTEM',
                role: 'ERROR',
                msg: `Failed to reach Alliance Hub: ${err}`,
                color: 'text-red-400',
                timestamp: new Date().toISOString()
            }]);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="renaissance-panel p-4 flex flex-col h-[400px] border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)]">
            <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                <div className="flex items-center gap-2">
                    <Network className="w-5 h-5 text-emerald-400" />
                    <h2 className="text-white font-sans font-semibold tracking-wider">Tactical Uplink (War Room)</h2>
                </div>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500">Live Sync</span>
                </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3 mb-4">
                <AnimatePresence initial={false}>
                    {messages.map((m, i) => {
                        const Icon = getIcon(m.role);
                        const isUser = m.role === 'USER';
                        return (
                            <motion.div
                                key={`${m.agent}-${m.timestamp}-${i}`}
                                initial={{ opacity: 0, x: isUser ? 20 : -20, height: 0 }}
                                animate={{ opacity: 1, x: 0, height: 'auto' }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                                className={clsx(
                                    "flex gap-3 p-3 rounded-lg border",
                                    isUser ? "bg-indigo-500/10 border-indigo-500/20 ml-8" : "bg-slate-900/50 border-white/5 mr-8"
                                )}
                            >
                                {!isUser && (
                                    <div className={clsx("mt-0.5", m.color)}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                )}
                                <div className="flex flex-col flex-1">
                                    <div className={clsx("flex items-center mb-1", isUser ? "justify-end gap-2" : "justify-between")}>
                                        {!isUser && (
                                            <span className={clsx("text-xs font-bold uppercase tracking-wider", m.color)}>
                                                {m.agent}
                                            </span>
                                        )}
                                        <span className={clsx("text-[9px] font-mono uppercase px-1.5 py-0.5 rounded", isUser ? "bg-indigo-500/20 text-indigo-300" : "bg-black/40 text-slate-600")}>
                                            {m.role}
                                        </span>
                                        {isUser && (
                                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                                                {m.agent}
                                            </span>
                                        )}
                                    </div>
                                    <p className={clsx("text-[11px] leading-relaxed", isUser ? "text-indigo-100/90 text-right" : "text-slate-300 font-mono whitespace-pre-wrap")}>
                                        {m.msg}
                                    </p>
                                </div>
                                {isUser && (
                                    <div className="mt-0.5 text-indigo-400">
                                        <Icon className="w-4 h-4" />
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {messages.length === 0 && (
                    <div className="flex items-center justify-center h-full text-slate-600 font-mono text-xs uppercase tracking-widest italic animate-pulse">
                        Awaiting tactical directives...
                    </div>
                )}
                {isProcessing && (
                    <div className="flex items-center justify-start text-emerald-500/50 font-mono text-[10px] uppercase tracking-widest italic animate-pulse">
                        <Sparkles className="w-3 h-3 mr-2" />
                        Routing through CORTEX...
                    </div>
                )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSubmit} className="mt-auto border border-white/10 rounded-lg bg-black/40 flex items-end p-2 gap-2 focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e);
                        }
                    }}
                    placeholder="Broadcast to swarm or @mention agent..."
                    className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none resize-none min-h-[40px] max-h-[120px] custom-scrollbar p-2"
                    rows={input.split('\n').length > 1 ? Math.min(input.split('\n').length, 5) : 1}
                />
                <button
                    type="submit"
                    disabled={!input.trim() || isProcessing}
                    className="p-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 hover:text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Send Message"
                    aria-label="Send Message"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
};

