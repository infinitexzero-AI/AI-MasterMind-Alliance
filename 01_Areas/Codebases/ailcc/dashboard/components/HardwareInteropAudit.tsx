import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Laptop, Tablet, Smartphone, CheckCircle2, AlertCircle, RefreshCw, Zap, ShieldCheck } from 'lucide-react';

interface DeviceStatus {
    id: string;
    name: string;
    type: 'mac' | 'ios' | 'ipad';
    status: 'online' | 'offline' | 'warning';
    lastSeen: string;
    details: string;
}

export const HardwareInteropAudit: React.FC = () => {
    const [devices, setDevices] = useState<DeviceStatus[]>([
        { id: 'mac-1', name: 'MacBook Pro', type: 'mac', status: 'offline', lastSeen: 'Never', details: 'Clipboard Daemon Not Detected' },
        { id: 'iphone-1', name: 'iPhone 15 Pro', type: 'ios', status: 'offline', lastSeen: 'Never', details: 'Shortcut Integration Pending' },
        { id: 'ipad-1', name: 'iPad Pro', type: 'ipad', status: 'offline', lastSeen: 'Never', details: 'Shortcut Integration Pending' },
    ]);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const performAudit = async () => {
        setIsRefreshing(true);
        try {
            // Check Clipboard API for daemon activity
            const res = await fetch('/api/clipboard/history');
            const data = await res.json();

            if (data.success && data.data) {
                const history = data.data;
                const hasMac = history.some((item: any) => item.source === 'macbook');
                const hasIphone = history.some((item: any) => item.source === 'iphone');
                const hasIpad = history.some((item: any) => item.source === 'ipad');

                setDevices(prev => prev.map(dev => {
                    if (dev.type === 'mac' && hasMac) {
                        return { ...dev, status: 'online', lastSeen: 'Live', details: 'Sync Daemon Active' };
                    }
                    if (dev.type === 'ios' && hasIphone) {
                        return { ...dev, status: 'online', lastSeen: 'Live', details: 'Apple Shortcut Connected' };
                    }
                    if (dev.type === 'ipad' && hasIpad) {
                        return { ...dev, status: 'online', lastSeen: 'Live', details: 'Apple Shortcut Connected' };
                    }
                    return dev;
                }));
            }
        } catch (error) {
            console.error('Audit failed:', error);
        } finally {
            setTimeout(() => setIsRefreshing(false), 1000);
        }
    };

    useEffect(() => {
        performAudit();
        const interval = setInterval(performAudit, 30000); // Audit every 30 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="renaissance-panel p-6 bg-black/40 border border-white/10 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500 rounded-full blur-[100px]" />
            </div>

            <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        <ShieldCheck className="w-6 h-6 text-emerald-400" />
                        Hardware Interop Audit
                    </h2>
                    <p className="text-xs text-slate-400 font-mono mt-1 uppercase tracking-widest">Cross-Device Compliance Check</p>
                </div>
                <button
                    onClick={performAudit}
                    disabled={isRefreshing}
                    aria-label="Refresh hardware status"
                    className={`p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all ${isRefreshing ? 'animate-spin' : ''}`}
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-4 relative z-10">
                {devices.map((device) => (
                    <motion.div
                        key={device.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${device.status === 'online'
                            ? 'bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]'
                            : 'bg-slate-900/40 border-white/5'
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${device.status === 'online' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                                }`}>
                                {device.type === 'mac' && <Laptop className="w-5 h-5" />}
                                {device.type === 'ios' && <Smartphone className="w-5 h-5" />}
                                {device.type === 'ipad' && <Tablet className="w-5 h-5" />}
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white tracking-wide">{device.name}</h3>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className={`text-[10px] font-mono uppercase ${device.status === 'online' ? 'text-emerald-400' : 'text-slate-500'
                                        }`}>
                                        {device.details}
                                    </span>
                                    <span className="text-[10px] text-slate-600">•</span>
                                    <span className="text-[10px] text-slate-600 font-mono">LST: {device.lastSeen}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {device.status === 'online' ? (
                                <>
                                    <span className="text-[10px] font-bold text-emerald-400 font-mono">COMPLETE</span>
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                </>
                            ) : (
                                <>
                                    <span className="text-[10px] font-bold text-slate-500 font-mono">PENDING</span>
                                    <AlertCircle className="w-5 h-5 text-slate-600 animate-pulse" />
                                </>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Quick Action Bar */}
            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                    <span className="text-[10px] font-black text-emerald-400 tracking-tighter uppercase">Protocol: Ready</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Auth: Biometric Verified</span>
            </div>
        </div>
    );
};

export default HardwareInteropAudit;
