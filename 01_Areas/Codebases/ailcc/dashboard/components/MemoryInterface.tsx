import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, Code, CheckCircle, Command } from 'lucide-react';

interface SearchResult {
    id: string;
    title: string;
    type: 'task' | 'doc' | 'code';
    path?: string;
}

// Mock Data for Prototype
const MEMORY_BANK: SearchResult[] = [
    { id: '1', title: 'Phase 5: Hippocampus Implementation', type: 'task' },
    { id: '2', title: 'brain_architecture.md', type: 'doc', path: 'brain_architecture.md' },
    { id: '3', title: 'SystemHUD.tsx', type: 'code', path: 'components/SystemHUD.tsx' },
    { id: '4', title: 'FocusTimer.tsx', type: 'code', path: 'components/widgets/FocusTimer.tsx' },
    { id: '5', title: 'One-Click Deployment Strategy', type: 'doc' },
];

export const MemoryInterface: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>(MEMORY_BANK);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (!query) {
            setResults(MEMORY_BANK);
        } else {
            setResults(MEMORY_BANK.filter(item => 
                item.title.toLowerCase().includes(query.toLowerCase())
            ));
        }
    }, [query]);

    return (
        <>
            {/* Floating Trigger Hint */}
            <div 
                className="absolute bottom-6 right-6 z-40 bg-slate-900/50 backdrop-blur border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2 text-[10px] text-slate-400 cursor-pointer hover:bg-slate-800/80 transition-colors"
                onClick={() => setIsOpen(true)}
            >
                <Command size={10} />
                <span>K</span>
                <span className="ml-1 opacity-50">Recall</span>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                            onClick={() => setIsOpen(false)}
                        />
                        
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            className="relative w-full max-w-lg bg-slate-900 border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-900/20 overflow-hidden"
                        >
                            <div className="flex items-center gap-3 p-4 border-b border-white/5">
                                <Search className="text-cyan-500" size={18} />
                                <input 
                                    autoFocus
                                    type="text" 
                                    placeholder="Search neural memory..." 
                                    className="flex-1 bg-transparent border-none outline-none text-slate-200 placeholder:text-slate-400 text-sm font-light"
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                />
                                <button onClick={() => setIsOpen(false)} className="text-[10px] bg-white/5 px-2 py-1 rounded text-slate-400 hover:text-white">ESC</button>
                            </div>

                            <div className="max-h-[60vh] overflow-y-auto p-2">
                                {results.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400 text-xs italic">
                                        No memory trails found.
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {results.map(item => (
                                            <button 
                                                key={item.id}
                                                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-cyan-500/10 hover:border-cyan-500/20 border border-transparent transition-all group text-left"
                                            >
                                                {item.type === 'task' && <CheckCircle className="text-emerald-500" size={14} />}
                                                {item.type === 'doc' && <FileText className="text-amber-500" size={14} />}
                                                {item.type === 'code' && <Code className="text-blue-500" size={14} />}
                                                
                                                <div className="flex-1">
                                                    <div className="text-xs text-slate-300 group-hover:text-cyan-200 font-medium">
                                                        {item.title}
                                                    </div>
                                                    {item.path && (
                                                        <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                                                            {item.path}
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            <div className="p-2 bg-slate-950/50 border-t border-white/5 text-[10px] text-slate-400 flex justify-between px-4">
                                <span>Hippocampus v1.0</span>
                                <span>{results.length} records</span>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};
