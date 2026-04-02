import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Download, RefreshCcw, Cpu, CheckCircle2, Loader2 } from 'lucide-react';
import { StudioMode, STUDIO_MODES } from './StudioModeSelector';
import { ChatMarkdown } from './ChatMarkdown';

interface StudioOutput {
    mode: StudioMode;
    content: string;
    agentUsed?: string;
    timestamp?: string;
}

function StreamingMarkdown({ content }: { content: string }) {
    const [displayedContent, setDisplayedContent] = React.useState('');
    const [isComplete, setIsComplete] = React.useState(false);

    React.useEffect(() => {
        setDisplayedContent('');
        setIsComplete(false);
        
        // Skip typewriter for very short strings (like mocked responses)
        if (content.length < 50) {
            setDisplayedContent(content);
            setIsComplete(true);
            return;
        }

        let current = 0;
        // Faster speed for longer documents to maintain flow
        const speed = content.length > 500 ? 5 : 15; 
        
        const interval = setInterval(() => {
            current += 3; // Type 3 chars at a time for "fast-live" feel
            if (current >= content.length) {
                setDisplayedContent(content);
                setIsComplete(true);
                clearInterval(interval);
            } else {
                setDisplayedContent(content.slice(0, current));
            }
        }, speed);

        return () => clearInterval(interval);
    }, [content]);

    return (
        <div className="relative">
            <ChatMarkdown content={displayedContent} />
            {!isComplete && (
                <motion.div 
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="inline-block w-2 h-4 bg-emerald-400 ml-1 translate-y-0.5"
                />
            )}
        </div>
    );
}

export default function StudioOutputCanvas({
    output,
    isLoading,
    onRegenerate,
}: {
    output: StudioOutput | null;
    isLoading: boolean;
    onRegenerate?: () => void;
}) {
    const [copied, setCopied] = React.useState(false);
    const modeConfig = output ? STUDIO_MODES.find(m => m.id === output.mode) : null;

    const handleCopy = () => {
        if (output?.content) {
            navigator.clipboard.writeText(output.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="flex-1 flex flex-col min-h-0">
            {/* Canvas Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/20">
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">
                        {isLoading ? 'Grok is thinking...' : output ? `${modeConfig?.label} Output` : 'Awaiting Input'}
                    </span>
                </div>
                {output && !isLoading && (
                    <div className="flex items-center gap-2">
                        {output.agentUsed && (
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] font-mono text-emerald-400">
                                <Cpu className="w-3 h-3" /> {output.agentUsed}
                            </div>
                        )}
                        <button
                            onClick={handleCopy}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
                            title="Copy to clipboard"
                        >
                            {copied
                                ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                : <Copy className="w-4 h-4 text-slate-400 group-hover:text-white" />
                            }
                        </button>
                        {onRegenerate && (
                            <button
                                onClick={onRegenerate}
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
                                title="Regenerate"
                            >
                                <RefreshCcw className="w-4 h-4 text-slate-400 group-hover:text-white" />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Canvas Body */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <AnimatePresence mode="wait">
                    {isLoading && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full flex flex-col items-center justify-center gap-6 text-slate-400"
                        >
                            <div className="relative">
                                <div className="w-20 h-20 rounded-full border border-emerald-500/20 animate-ping absolute inset-0" />
                                <div className="w-20 h-20 rounded-full border border-emerald-500/40 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                                </div>
                            </div>
                            <div className="text-center space-y-2">
                                <p className="font-mono text-sm text-emerald-400/70 uppercase tracking-widest">Grok Processing</p>
                                <p className="font-mono text-xs text-slate-400">Routing through Mode 6 Orchestrator...</p>
                            </div>
                        </motion.div>
                    )}

                    {!isLoading && output && (
                        <motion.div
                            key={output.timestamp}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`renaissance-panel p-6 rounded-2xl bg-gradient-to-br ${modeConfig?.gradient ?? 'from-slate-900'} border border-white/10`}
                        >
                            <StreamingMarkdown content={output.content} />
                        </motion.div>
                    )}

                    {!isLoading && !output && (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-full flex flex-col items-center justify-center gap-4 text-slate-700"
                        >
                            <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-800 flex items-center justify-center">
                                <span className="text-4xl opacity-30">✦</span>
                            </div>
                            <p className="font-mono text-xs uppercase tracking-widest">Select a mode and submit your prompt</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
