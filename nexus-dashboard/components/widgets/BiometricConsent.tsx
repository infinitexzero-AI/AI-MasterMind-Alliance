import React, { useState, useEffect } from 'react';
import { Shield, Fingerprint, X, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BiometricConsentProps {
    isOpen: boolean;
    onClose: () => void;
    onApprove: () => void;
    actionName: string;
    riskLevel: 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export const BiometricConsent: React.FC<BiometricConsentProps> = ({
    isOpen,
    onClose,
    onApprove,
    actionName,
    riskLevel
}) => {
    const [verifying, setVerifying] = useState(false);
    const [complete, setComplete] = useState(false);

    const handleApprove = () => {
        setVerifying(true);
        // Simulate biometric scan
        setTimeout(() => {
            setVerifying(false);
            setComplete(true);
            setTimeout(() => {
                onApprove();
                onClose();
            }, 1000);
        }, 2000);
    };

    if (!isOpen) return null;

    const riskColors = {
        MEDIUM: 'text-amber-400 border-amber-500/30',
        HIGH: 'text-orange-400 border-orange-500/30',
        CRITICAL: 'text-rose-500 border-rose-500/30'
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className={`w-full max-w-md renaissance-panel p-8 border-2 ${riskColors[riskLevel]}`}
                >
                    <div className="flex flex-col items-center text-center space-y-6">
                        <div className={`p-4 rounded-full bg-white/5 border ${riskColors[riskLevel]} animate-pulse-glow`}>
                            {complete ? <CheckCircle className="w-12 h-12 text-emerald-400" /> : <Shield className="w-12 h-12" />}
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-xl font-black uppercase tracking-widest text-white">Biometric Authorization</h2>
                            <p className="text-xs text-slate-400 uppercase tracking-widest font-mono">
                                Action: <span className="text-white font-bold">{actionName}</span>
                            </p>
                        </div>

                        {!verifying && !complete && (
                            <div className="flex flex-col gap-4 w-full">
                                <button
                                    onClick={handleApprove}
                                    className="w-full py-4 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 hover:border-white/40 transition-all flex items-center justify-center gap-3 group"
                                >
                                    <Fingerprint className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-bold uppercase tracking-widest">Verify Identity</span>
                                </button>
                                <button
                                    onClick={onClose}
                                    className="text-xs text-slate-500 hover:text-white transition-colors uppercase font-mono"
                                >
                                    Cancel Request
                                </button>
                            </div>
                        )}

                        {verifying && (
                            <div className="flex flex-col items-center space-y-4">
                                <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ x: '-100%' }}
                                        animate={{ x: '100%' }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                                        className="w-full h-full bg-cyan-400"
                                    />
                                </div>
                                <p className="text-[10px] font-mono text-cyan-400 animate-pulse">ANALYZING NEURAL SIGNATURE...</p>
                            </div>
                        )}

                        {complete && (
                            <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">Authorization Granted</p>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
