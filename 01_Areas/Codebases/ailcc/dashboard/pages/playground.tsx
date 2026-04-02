import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import NexusLayout from '../components/NexusLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Trash2, Zap, Code, Search, Brain, BookOpen, Download } from 'lucide-react';
import { ChatMarkdown } from '../components/ChatMarkdown';

const AGENTS = [
    { id: 'general', label: 'NEXUS', icon: Bot, color: 'cyan', desc: 'General purpose' },
    { id: 'research', label: 'SCOUT', icon: Search, color: 'blue', desc: 'Research & analysis' },
    { id: 'code', label: 'FORGE', icon: Code, color: 'green', desc: 'Code & implementation' },
    { id: 'strategy', label: 'ARCHITECT', icon: Zap, color: 'amber', desc: 'Strategic planning' },
    { id: 'memory', label: 'MEMORY', icon: Brain, color: 'purple', desc: 'Vault recall' },
];

const colorMap: Record<string, string> = {
    cyan: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400',
    blue: 'border-blue-500/50 bg-blue-500/10 text-blue-400',
    green: 'border-green-500/50 bg-green-500/10 text-green-400',
    amber: 'border-amber-500/50 bg-amber-500/10 text-amber-400',
    purple: 'border-purple-500/50 bg-purple-500/10 text-purple-400',
};

// --- Utils ---
function parseDiffBlock(diffText: string) {
    let oldCode: string[] = [];
    let newCode: string[] = [];
    diffText.split('\n').forEach(line => {
        if (line.startsWith('-')) {
            oldCode.push(line.substring(1));
        } else if (line.startsWith('+')) {
            newCode.push(line.substring(1));
        } else {
            // Remove leading space if it exists for context lines
            const cleanLine = line.startsWith(' ') ? line.substring(1) : line;
            oldCode.push(cleanLine);
            newCode.push(cleanLine);
        }
    });
    return { oldValue: oldCode.join('\n'), newValue: newCode.join('\n') };
}

// --- Reusable Chat Panel Component ---
function ChatPanel({
    panelId,
    selectedAgent,
    onSelectAgent
}: {
    panelId: string,
    selectedAgent: string | null,
    onSelectAgent: (id: string | null) => void
}) {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [useSupervisor, setUseSupervisor] = useState(false);
    const [devilAdvocate, setDevilAdvocate] = useState(false);
    const [peerReview, setPeerReview] = useState(false);
    const [forgePersona, setForgePersona] = useState<string>('Full-Stack Engineer');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const handleAbort = () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
                setLoading(false);
                setMessages(prev => [...prev, {
                    role: 'agent',
                    content: '[ABORT] Task terminated by global killswitch.',
                    timestamp: new Date()
                }]);
            }
        };
        window.addEventListener('ALLIANCE_ABORT_ALL', handleAbort);
        return () => window.removeEventListener('ALLIANCE_ABORT_ALL', handleAbort);
    }, []);

    const dispatch = async () => {
        if (!input.trim() || loading) return;
        const task = input.trim();
        setInput('');

        const userMsg: Message = {
            role: 'user', content: task, timestamp: new Date()
        };
        setMessages(prev => [...prev, userMsg]);
        setLoading(true);

        try {
            abortControllerRef.current = new AbortController();
            const res = await fetch('/api/alliance/dispatch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task, agentOverride: selectedAgent, useSupervisor, devilAdvocate, forgePersona: selectedAgent === 'code' ? forgePersona : undefined, peerReview }),
                signal: abortControllerRef.current.signal
            });
            const data = await res.json();

            const agentMsg: Message = {
                role: 'agent',
                content: data.response || data.error || 'No response.',
                thought: data.thought || null,
                agentType: data.agentType,
                model: data.model,
                duration_ms: data.duration_ms,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, agentMsg]);
        } catch (err: any) {
            if (err.name === 'AbortError') return;
            setMessages(prev => [...prev, {
                role: 'agent',
                content: `Error: ${err.message}`,
                timestamp: new Date()
            }]);
        } finally {
            setLoading(false);
            abortControllerRef.current = null;
        }
    };

    const downloadChat = () => {
        if (messages.length === 0) return;

        let mdContent = `# Alliance Chat Export\n_Exported on ${new Date().toLocaleString()}_\n\n---\n\n`;

        messages.forEach(msg => {
            if (msg.role === 'user') {
                mdContent += `### 👤 User\n\n${msg.content}\n\n`;
            } else {
                const agentName = msg.agentType ? (AGENTS.find(a => a.id === msg.agentType)?.label || msg.agentType) : 'Agent';
                mdContent += `### 🤖 ${agentName} (Alliance)\n\n`;
                if (msg.thought) {
                    mdContent += `<details><summary>Agent Reasoning</summary>\n\n${msg.thought}\n\n</details>\n\n`;
                }
                mdContent += `${msg.content}\n\n`;
            }
            mdContent += `---\n\n`;
        });

        const blob = new Blob([mdContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `alliance-chat-${new Date().toISOString().slice(0, 10)}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const agentColor = (id: string) => AGENTS.find(a => a.id === id)?.color || 'cyan';

    return (
        <div className="flex-1 flex flex-col gap-4">
            {/* Agent Selector (Local to Panel) */}
            <div className="flex gap-2 pb-2 overflow-x-auto hide-scrollbar">
                {AGENTS.map(agent => {
                    const Icon = agent.icon;
                    const isSelected = selectedAgent === agent.id;
                    return (
                        <button
                            key={agent.id}
                            onClick={() => onSelectAgent(isSelected ? null : agent.id)}
                            className={`flex flex-col items-center flex-shrink-0 gap-1.5 p-2 rounded-lg border transition-all duration-200 w-[72px] ${isSelected
                                ? colorMap[agent.color] + ' shadow-md scale-105'
                                : 'border-slate-700/50 bg-slate-900/50 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span className="text-[9px] font-mono font-bold tracking-widest truncate w-full text-center">{agent.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Sub-Persona Selector for FORGE */}
            {selectedAgent === 'code' && (
                <div className="flex justify-end pr-2 -my-2 text-xs">
                    <select
                        value={forgePersona}
                        onChange={(e) => setForgePersona(e.target.value)}
                        className="bg-slate-800/80 border border-slate-700/50 text-slate-300 rounded px-2 py-1 focus:outline-none focus:border-cyan-500/50"
                    >
                        <option value="Full-Stack Engineer">Role: Full-Stack Engineer</option>
                        <option value="Postgres DBA">Role: Postgres DBA</option>
                        <option value="DevOps Specialist">Role: DevOps Specialist</option>
                        <option value="UI/UX Specialist">Role: UI/UX Specialist</option>
                    </select>
                </div>
            )}

            {/* Chat Window */}
            <div className="renaissance-panel border border-slate-700/30 rounded-xl flex flex-col flex-1 min-h-[500px] h-[65vh] overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center gap-4 opacity-40 px-4">
                            <BookOpen className="w-10 h-10 text-cyan-400" />
                            <p className="text-slate-400 font-mono text-xs sm:text-sm">
                                Send a task to dispatch it to {selectedAgent ? AGENTS.find(a => a.id === selectedAgent)?.label : 'an Alliance agent'}.
                            </p>
                        </div>
                    )}
                    <AnimatePresence>
                        {messages.map((msg, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[90%] sm:max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-cyan-500/15 border border-cyan-500/20 text-slate-100 ml-4'
                                    : 'bg-slate-900/80 border border-slate-700/50 text-slate-200 mr-4'
                                    }`}>
                                    {msg.role === 'agent' && msg.agentType && (
                                        <div className={`flex items-center flex-wrap gap-2 mb-2 text-[10px] font-mono tracking-widest uppercase ${colorMap[agentColor(msg.agentType)].split(' ').at(-1)
                                            }`}>
                                            <Bot className="w-3 h-3" />
                                            {AGENTS.find(a => a.id === msg.agentType)?.label || msg.agentType}
                                            {msg.model && <span className="opacity-50 break-all w-full sm:w-auto">· {msg.model}</span>}
                                            {msg.duration_ms && <span className="opacity-50">· {msg.duration_ms}ms</span>}
                                        </div>
                                    )}
                                    {msg.role === 'agent' && msg.thought && (
                                        <details className="mb-3 text-xs opacity-70 border border-slate-700/50 rounded-lg overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                                            <summary className="cursor-pointer bg-slate-800/50 px-3 py-2 flex items-center justify-between hover:bg-slate-700/50 transition-colors">
                                                <span className="font-mono tracking-widest uppercase">Agent Reasoning</span>
                                                <Brain className="w-3 h-3" />
                                            </summary>
                                            <div className="p-3 bg-slate-900/50 text-slate-400 text-xs sm:text-sm">
                                                <ChatMarkdown content={msg.thought} />
                                            </div>
                                        </details>
                                    )}
                                    <div className="text-slate-300 text-sm leading-relaxed prose prose-invert max-w-none">
                                        <ChatMarkdown content={msg.content} />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {loading && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                            <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-400 font-mono flex items-center gap-2">
                                <div className="flex gap-1">
                                    {[0, 0.15, 0.3].map((delay, i) => (
                                        <span key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: `${delay}s` }} />
                                    ))}
                                </div>
                                Processing...
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t border-slate-700/30 p-3 sm:p-4 flex flex-col gap-2">
                    <div className="flex flex-wrap gap-4 px-1 pb-1">
                        <label className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest uppercase text-slate-400 cursor-pointer hover:text-cyan-400 transition-colors">
                            <input type="checkbox" checked={useSupervisor} onChange={e => setUseSupervisor(e.target.checked)} className="rounded border-slate-700 bg-slate-800 accent-cyan-500" />
                            Supervisor Pass
                        </label>
                        <label className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest uppercase text-slate-400 cursor-pointer hover:text-red-400 transition-colors">
                            <input type="checkbox" checked={devilAdvocate} onChange={e => setDevilAdvocate(e.target.checked)} className="rounded border-slate-700 bg-slate-800 accent-red-500" />
                            Devil's Advocate
                        </label>
                        {selectedAgent === 'code' && (
                            <label className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest uppercase text-slate-400 cursor-pointer hover:text-emerald-400 transition-colors">
                                <input type="checkbox" checked={peerReview} onChange={e => setPeerReview(e.target.checked)} className="rounded border-slate-700 bg-slate-800 accent-emerald-500" />
                                SCOUT Peer Review
                            </label>
                        )}
                    </div>
                    <div className="flex gap-2 sm:gap-3 items-end">
                        <textarea
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); dispatch(); } }}
                            placeholder="Dispatch task..."
                            className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 resize-none focus:outline-none focus:border-cyan-500/50 min-h-[38px] max-h-[120px]"
                            rows={1}
                        />
                        <button onClick={() => setMessages([])} className="p-2 sm:p-2.5 text-slate-500 hover:text-red-400 transition-colors" title="Clear chat">
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <button onClick={downloadChat} disabled={messages.length === 0} className="p-2 sm:p-2.5 text-slate-500 hover:text-cyan-400 disabled:opacity-30 transition-colors" title="Download Chat as Markdown">
                            <Download className="w-4 h-4" />
                        </button>
                        <button onClick={dispatch} disabled={loading || !input.trim()} className="px-3 py-2 sm:px-4 sm:py-2.5 bg-cyan-500 text-black font-bold text-xs sm:text-sm rounded-lg hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2">
                            <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Send</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Main Page Component ---

interface Message {
    role: 'user' | 'agent';
    content: string;
    thought?: string | null;
    agentType?: string;
    model?: string;
    duration_ms?: number | null;
    timestamp: Date;
}

export default function PlaygroundPage() {
    const [isSplitMode, setIsSplitMode] = useState(false);

    // Lift agent selection state so panels can have default distinct agents in split mode
    const [panel1Agent, setPanel1Agent] = useState<string | null>(null);
    const [panel2Agent, setPanel2Agent] = useState<string | null>(null);

    const toggleSplitMode = () => {
        setIsSplitMode(prev => {
            if (!prev) {
                // When entering split mode, assign distinct default agents if none selected
                if (!panel1Agent) setPanel1Agent('code');
                if (!panel2Agent) setPanel2Agent('strategy');
            }
            return !prev;
        });
    };

    return (
        <NexusLayout>
            <Head><title>Agent Playground | Alliance Command</title></Head>
            <div className={`flex flex-col gap-6 pb-20 mx-auto transition-all duration-300 ${isSplitMode ? 'max-w-[1600px] w-full px-4' : 'max-w-5xl'}`}>

                {/* Header Container defined as flex with justify-between */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tighter uppercase">Agent Playground</h1>
                        <p className="text-slate-400 font-mono text-xs uppercase tracking-widest mt-1">
                            Dispatch tasks to specialized Alliance agents
                        </p>
                    </div>

                    {/* Split View Toggle */}
                    <button
                        onClick={toggleSplitMode}
                        className={`hidden md:flex items-center gap-2 px-4 py-2 border rounded-full text-xs font-mono uppercase tracking-widest transition-colors ${isSplitMode
                            ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                            : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300'
                            }`}
                    >
                        <Zap className="w-4 h-4" />
                        {isSplitMode ? 'Single View' : 'Split View'}
                    </button>
                </div>

                {/* Dashboard Panels Layout */}
                <div className={`flex flex-col xl:flex-row gap-6 ${isSplitMode ? 'w-full' : ''}`}>
                    <ChatPanel
                        panelId="1"
                        selectedAgent={panel1Agent}
                        onSelectAgent={setPanel1Agent}
                    />

                    {isSplitMode && (
                        <>
                            <div className="w-px bg-slate-800 hidden xl:block" />
                            <div className="h-px bg-slate-800 xl:hidden block" />
                            <ChatPanel
                                panelId="2"
                                selectedAgent={panel2Agent}
                                onSelectAgent={setPanel2Agent}
                            />
                        </>
                    )}
                </div>

            </div>
        </NexusLayout>
    );
}
