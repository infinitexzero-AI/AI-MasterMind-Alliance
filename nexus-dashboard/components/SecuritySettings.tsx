import React, { useState } from 'react';
import { Shield, Fingerprint, Lock, ShieldCheck, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from './Toast';

export const SecuritySettings: React.FC = () => {
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const { showToast } = useToast();

    const handleRegister = async () => {
        setIsRegistering(true);
        // Simulate WebAuthn registration
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsEnrolled(true);
        setIsRegistering(false);
        showToast("Biometric Key Registered Successfully", "success");
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
                <Shield className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-medium text-slate-100">Biometric Sovereignty</h3>
            </div>

            <div className="grid gap-4">
                <div className="p-4 bg-slate-900/40 border border-white/5 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${isEnrolled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                            <Fingerprint className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-slate-200">Local Platform Authenticator</div>
                            <div className="text-xs text-slate-500 font-mono uppercase tracking-widest mt-0.5">
                                {isEnrolled ? "ESTABLISHED - FACEID/TOUCHID READY" : "NOT CONFIGURED"}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleRegister}
                        disabled={isRegistering || isEnrolled}
                        className={`px-4 py-2 rounded-lg text-xs font-bold tracking-widest uppercase transition-all ${isEnrolled
                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default'
                                : 'bg-cyan-500 text-black hover:bg-cyan-400 active:scale-95'
                            }`}
                    >
                        {isRegistering ? "Wait..." : isEnrolled ? "REGISTERED" : "ENROLL NOW"}
                    </button>
                </div>

                <div className="p-4 bg-slate-900/40 border border-white/5 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                        <Lock className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-medium text-slate-200">Gated Protocols</span>
                    </div>
                    <div className="space-y-2">
                        {[
                            { name: 'Sovereign Killswitch', gated: true },
                            { name: 'System Core Upgrades', gated: true },
                            { name: 'Wealth Deployment', gated: isEnrolled },
                            { name: 'Hippocampus Wipe', gated: true }
                        ].map((item) => (
                            <div key={item.name} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                <span className="text-xs text-slate-400 font-mono uppercase truncate">{item.name}</span>
                                {item.gated ? (
                                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                ) : (
                                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-cyan-500/5 border border-cyan-500/20 p-4 rounded-xl">
                <p className="text-[10px] text-cyan-400 font-mono uppercase leading-relaxed opacity-80">
                    <span className="font-bold">Security Note:</span> Passive biometric verification ensures that destructive or hazardous commands are only executed when the Commander's presence is physically established.
                </p>
            </div>
        </div>
    );
};
