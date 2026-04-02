import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, Bot, Layout, Terminal, Activity, Zap, X } from 'lucide-react';
import { useRouter } from 'next/router';

interface Action {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    shortcut?: string;
    action: () => void;
    category: 'Navigation' | 'Agents' | 'System';
}

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const actions: Action[] = [
        // Navigation
        { id: 'nav-hub', title: 'Go to Hub', description: 'Return to major mission control', icon: Layout, category: 'Navigation', action: () => router.push('/') },
        { id: 'nav-war', title: 'War Room', description: 'Active swarm strategy & monitoring', icon: Zap, category: 'Navigation', action: () => router.push('/war-room') },
        { id: 'nav-obs', title: 'Observability', description: 'System health & telemetry matrix', icon: Activity, category: 'Navigation', action: () => router.push('/observability') },
        
        // Agents
        { id: 'agent-comet', title: 'Launch Comet', description: 'Scout intelligence & research', icon: Bot, category: 'Navigation', action: () => router.push('/comet') },
        { id: 'agent-grok', title: 'Grok Studio', description: 'Architectural synthesis & strategy', icon: Terminal, category: 'Navigation', action: () => router.push('/studio') },
        
        // System Actions
        { id: 'sys-optimize', title: 'Optimize Swarm', description: 'Purge redundant telemetry & flush cache', icon: Zap, category: 'System', action: () => executeSystemCommand('SWARM_OPTIMIZE') },
        { id: 'sys-audit', title: 'Security Audit', description: 'Trigger full system vulnerability scan', icon: Command, category: 'System', action: () => executeSystemCommand('SECURITY_AUDIT') },
        { id: 'sys-vault', title: 'Intelligence Vault', description: 'Search archived swarm knowledge', icon: Command, category: 'Navigation', action: () => router.push('/library') },
    ];

    const executeSystemCommand = async (cmd: string) => {
        try {
            await fetch('/api/system/command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command: cmd })
            });
        } catch (e) {
            console.error('Command execution failed:', e);
        }
    };

    const filteredActions = query === '' 
        ? actions 
        : actions.filter(action => 
            action.title.toLowerCase().includes(query.toLowerCase()) || 
            action.description.toLowerCase().includes(query.toLowerCase())
        );

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(i => (i + 1) % filteredActions.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(i => (i - 1 + filteredActions.length) % filteredActions.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredActions[selectedIndex]) {
                    filteredActions[selectedIndex].action();
                    onClose();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, filteredActions, selectedIndex, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md" 
                    />

                    {/* Palette */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="w-full max-w-2xl bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative z-10 backdrop-blur-2xl"
                    >
                        {/* Search Input */}
                        <div className="flex items-center px-4 py-4 border-b border-white/5">
                            <Search className="w-5 h-5 text-slate-400 mr-3" />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Universal Command Input..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="flex-1 bg-transparent border-none outline-none text-slate-100 placeholder-slate-500 text-lg"
                            />
                            <div className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded border border-white/10">
                                <span className="text-[10px] font-mono text-slate-400 uppercase">esc</span>
                            </div>
                        </div>

                        {/* Results */}
                        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
                            {filteredActions.length === 0 ? (
                                <div className="py-12 text-center">
                                    <X className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                                    <p className="text-slate-500 text-sm">No commands found matching "{query}"</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {filteredActions.map((action, idx) => (
                                        <div
                                            key={action.id}
                                            onClick={() => {
                                                action.action();
                                                onClose();
                                            }}
                                            onMouseEnter={() => setSelectedIndex(idx)}
                                            className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all ${
                                                idx === selectedIndex 
                                                    ? 'bg-cyan-500/10 border-l-2 border-cyan-400' 
                                                    : 'hover:bg-white/5 border-l-2 border-transparent'
                                            }`}
                                        >
                                            <div className={`p-2 rounded-lg ${
                                                idx === selectedIndex ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'
                                            }`}>
                                                <action.icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-sm font-bold ${idx === selectedIndex ? 'text-white' : 'text-slate-300'}`}>
                                                        {action.title}
                                                    </span>
                                                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                                                        {action.category}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1">{action.description}</p>
                                            </div>
                                            {idx === selectedIndex && (
                                                <div className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded border border-white/10">
                                                     <Command className="w-3 h-3 text-slate-400" />
                                                     <span className="text-[10px] font-mono text-slate-400">↵</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-3 bg-black/40 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                    <span className="p-1 px-1.5 bg-white/5 border border-white/10 rounded">↑↓</span> to navigate
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="p-1 px-1.5 bg-white/5 border border-white/10 rounded">enter</span> to select
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Bot className="w-3 h-3" /> AILCC Command Bridge
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
