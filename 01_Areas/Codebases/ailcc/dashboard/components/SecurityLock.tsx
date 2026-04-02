import React, { useState, useEffect } from 'react';
import { Fingerprint, Lock, ShieldCheck, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SecurityLock: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLocked, setIsLocked] = useState(true);
    const [authenticating, setAuthenticating] = useState(false);
    const [authSuccess, setAuthSuccess] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
        // Skip lock if already authenticated this session
        if (sessionStorage.getItem('nexus_authenticated')) {
            setIsLocked(false);
            return;
        }
        
        // Auto-trigger simulation on mount if still locked
        const timer = setTimeout(() => {
            handleAuthenticate();
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    const handleAuthenticate = async () => {
        setAuthenticating(true);
        // Simulate a 1.5s biometric check
        await new Promise(r => setTimeout(r, 1500));
        setAuthSuccess(true);
        await new Promise(r => setTimeout(r, 800));
        // Store in sessionStorage so subsequent page navigations skip the lock
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('nexus_authenticated', 'true');
        }
        setIsLocked(false);
        setAuthenticating(false);
    };

    if (!isHydrated) return null; // Prevent flicker before hydration
    if (!isLocked) return <>{children}</>;

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-10 shadow-2xl text-center relative overflow-hidden"
            >
                {/* Background Glow */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />

                <div className="relative z-10">
                    <div className="mb-8 flex justify-center">
                        <div className="relative">
                            <AnimatePresence mode="wait">
                                {authSuccess ? (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="w-24 h-24 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center"
                                    >
                                        <ShieldCheck className="w-12 h-12 text-green-400" />
                                    </motion.div>
                                ) : authenticating ? (
                                    <motion.div
                                        key="scanning"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="w-24 h-24 rounded-full bg-cyan-500/5 border border-cyan-500/20 flex items-center justify-center"
                                    >
                                        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
                                        <div className="absolute inset-x-0 h-1 bg-cyan-400/50 blur-sm shadow-[0_0_15px_cyan] animate-[scan_2s_ease-in-out_infinite]" />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="idle"
                                        className="w-24 h-24 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center cursor-pointer hover:border-cyan-500/50 transition-colors"
                                        onClick={handleAuthenticate}
                                    >
                                        <Fingerprint className="w-12 h-12 text-slate-400" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold text-white mb-2">AILCC Secure Uplink</h1>
                    <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                        Establishing neural handshake. Biometric verification required to access the Alliance Command Center.
                    </p>

                    <div className="space-y-4">
                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: authenticating ? '60%' : authSuccess ? '100%' : '0%' }}
                                className={`h-full ${authSuccess ? 'bg-green-500' : 'bg-cyan-500'}`}
                            />
                        </div>
                        <div className="flex justify-between text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                            <span>{authSuccess ? 'Verified' : authenticating ? 'Scanning' : 'Waiting'}</span>
                            <span>Touch ID Required</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            <style jsx>{`
                @keyframes scan {
                    0%, 100% { transform: translateY(-30px); opacity: 0; }
                    50% { transform: translateY(30px); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default SecurityLock;
