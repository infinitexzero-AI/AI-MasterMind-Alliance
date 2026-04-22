import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X, Search, Terminal, Bot, Settings, Activity, HelpCircle } from 'lucide-react';

interface ShortcutCheatSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

const shortcuts = [
    { key: 'CMD + K', label: 'Universal Command Search', icon: Search },
    { key: 'CMD + /', label: 'Toggle Command Palette', icon: Terminal },
    { key: 'CMD + ?', label: 'Toggle Shortcut Guide', icon: HelpCircle },
    { key: 'CMD + B', label: 'Toggle Sidebar', icon: Activity },
    { key: 'ESC', label: 'Close Modal / Cancel', icon: X },
    { key: 'CMD + S', label: 'Voice Mode (Experimental)', icon: Bot },
    { key: 'CMD + ,', label: 'Settings', icon: Settings },
];

export const ShortcutCheatSheet: React.FC<ShortcutCheatSheetProps> = ({ isOpen, onClose }) => {
    // Focus trapping logic
    React.useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Tab') {
                const focusableElements = Array.from(document.querySelectorAll('[role="dialog"] button, [role="dialog"] [tabindex="0"]'));
                if (focusableElements.length === 0) return;

                const firstElement = focusableElements[0] as HTMLElement;
                const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

                if (e.shiftKey) { // Shift + Tab
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else { // Tab
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
            if (e.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', handleKeyDown);
        // Auto-focus the close button or first action
        setTimeout(() => {
            const firstButton = document.querySelector('[role="dialog"] button') as HTMLElement;
            firstButton?.focus();
        }, 50);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="shortcut-title">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg renaissance-panel bg-slate-900/90 border border-white/10 p-8 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500" />

                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <Keyboard className="w-6 h-6 text-cyan-400" />
                                <h2 id="shortcut-title" className="text-xl font-black tracking-tighter text-white uppercase">Nexus Sovereignty Commands</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-white/5 text-slate-400 transition-colors focus-visible:bg-white/10"
                                aria-label="Close shortcuts"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {shortcuts.map((s, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 group hover:border-cyan-500/30 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-lg bg-slate-800 text-slate-400 group-hover:text-cyan-400 transition-colors">
                                            <s.icon className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-300">{s.label}</span>
                                    </div>
                                    <kbd className="px-3 py-1 rounded bg-slate-950 border border-white/10 font-mono text-[10px] text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.1)] uppercase">
                                        {s.key}
                                    </kbd>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Master the Keyboard · Master the Swarm</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
