import React, { useState } from 'react';
import Head from 'next/head';
import { ShieldAlert, Fingerprint, Terminal } from 'lucide-react';
import { useAuth } from '../src/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ParticleBackground } from '../components/ParticleBackground';

export default function LoginPage() {
  const [passcode, setPasscode] = useState('');
  const [errorVisible, setErrorVisible] = useState(false);
  const { login } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;

    if (['infinite', 'vanguard', 'guest'].includes(passcode.toLowerCase())) {
        login(passcode.toLowerCase());
    } else {
        setErrorVisible(true);
        setTimeout(() => setErrorVisible(false), 3000);
        setPasscode('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden font-sans text-white">
      <Head>
        <title>AILCC | Secure Neural Uplink</title>
      </Head>
      
      <ParticleBackground />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="z-10 bg-slate-950/80 backdrop-blur-xl border border-slate-700/50 p-10 rounded-3xl w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden"
      >
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-cyan-500/20 rounded-full blur-[80px]" />
        
        <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 mb-6 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
                <Fingerprint className="w-10 h-10 text-cyan-500/80" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight uppercase">Terminal Access</h1>
            <p className="text-xs font-mono text-slate-500 tracking-widest uppercase mt-2">Vanguard Swarm Command</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="relative">
                <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                    type="password"
                    value={passcode}
                    onChange={e => setPasscode(e.target.value)}
                    placeholder="Enter Clearance Code..."
                    className="w-full bg-black/60 border border-slate-700 focus:border-cyan-500/50 rounded-xl py-4 pl-12 pr-4 text-sm font-mono tracking-[0.2em] focus:outline-none transition-all placeholder:text-slate-700 placeholder:tracking-widest"
                    autoFocus
                />
            </div>
            
            <AnimatePresence>
                {errorVisible && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center justify-center gap-2 text-red-500 text-xs font-mono bg-red-500/10 border border-red-500/20 p-2 rounded"
                    >
                        <ShieldAlert className="w-4 h-4" /> DENIED: Invalid Matrix Clearance
                    </motion.div>
                )}
            </AnimatePresence>

            <button 
                type="submit"
                className="mt-2 w-full py-4 bg-white text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all"
            >
                Initialize Handshake
            </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">
                AILCC OS v7.0.1 • Encrypted Connection
            </p>
        </div>
      </motion.div>
    </div>
  );
}
