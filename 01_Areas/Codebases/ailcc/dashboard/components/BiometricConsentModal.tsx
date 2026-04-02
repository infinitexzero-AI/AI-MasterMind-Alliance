import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, ShieldAlert, X, LockKeyhole } from 'lucide-react';

interface BiometricConsentModalProps {
    isOpen: boolean;
    command: string;
    onConsent: () => void;
    onCancel: () => void;
}

export const BiometricConsentModal: React.FC<BiometricConsentModalProps> = ({ isOpen, command, onConsent, onCancel }) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setPin('');
            setError(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handlePinSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin === '0000') {
            onConsent();
        } else {
            setError(true);
            setPin('');
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-red-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 custom-scrollbar"
                        style={{ cursor: 'url(/target.png) 12 12, auto' }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            className="relative w-full max-w-sm bg-slate-900 border-2 border-red-500/50 rounded-2xl shadow-[0_0_80px_rgba(239,68,68,0.4)] overflow-hidden"
                        >
                            {/* Scanline Effect */}
                            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
                                <div className="w-full h-1 bg-red-500/50 shadow-[0_0_10px_rgba(239,68,68,1)] animate-scanline" />
                            </div>

                            <div className="p-6 text-center space-y-6 relative z-10">
                                <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/50 animate-pulse">
                                    <ShieldAlert className="w-8 h-8 text-red-500" />
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-white tracking-wider mb-2 uppercase">High-Risk Operation</h2>
                                    <p className="text-sm text-red-300/80 font-mono">
                                        System command <span className="text-white bg-red-500/20 px-1 rounded">'{command}'</span> requires immediate biometric or master PIN authorization.
                                    </p>
                                </div>

                                <form onSubmit={handlePinSubmit} className="space-y-4">
                                    <div className="relative w-3/4 mx-auto">
                                        <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            ref={inputRef}
                                            type="password"
                                            value={pin}
                                            onChange={(e) => {
                                                setPin(e.target.value);
                                                setError(false);
                                            }}
                                            maxLength={4}
                                            placeholder="ENTER PIN (0000)"
                                            className={`w-full bg-slate-950 border ${error ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-shake' : 'border-slate-800 focus:border-red-500'} rounded-lg py-3 pl-10 pr-4 text-center text-white tracking-[0.5em] font-mono focus:outline-none transition-all`}
                                        />
                                    </div>

                                    {error && <p className="text-xs text-red-500 animate-pulse font-mono tracking-widest">ACCESS DENIED. INCORRECT PIN.</p>}

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={onCancel}
                                            className="flex-1 py-3 px-4 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-mono text-sm uppercase tracking-wider"
                                        >
                                            Abort
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={pin.length < 4}
                                            className="flex-1 py-3 px-4 rounded-lg bg-red-500/20 border border-red-500 text-red-400 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)]"
                                        >
                                            Authorize
                                        </button>
                                    </div>
                                </form>

                                <div className="mt-6 pt-4 border-t border-slate-800">
                                    <div className="flex items-center justify-center gap-2 text-slate-400">
                                        <Fingerprint className="w-4 h-4" />
                                        <span className="text-[10px] uppercase tracking-widest font-mono">Touch ID Equivalent Active</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={onCancel}
                                aria-label="Close"
                                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
