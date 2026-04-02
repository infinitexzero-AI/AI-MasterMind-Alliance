import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, CheckCircle2, AlertCircle } from 'lucide-react';

interface RefreshWidgetProps {
    onRefresh: () => Promise<void>;
    lastSync?: Date;
}

const GlassRefreshWidget: React.FC<RefreshWidgetProps> = ({ onRefresh }) => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleRefresh = async () => {
        setIsRefreshing(true);
        setStatus('idle');
        try {
            await onRefresh();
            setStatus('success');
            setTimeout(() => setStatus('idle'), 3000);
        } catch (error) {
            setStatus('error');
            setTimeout(() => setStatus('idle'), 5000);
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative p-1 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden group"
        >
            {/* Background Gradient Animation */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative flex items-center gap-4 px-4 py-2">
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Neural Sync</span>
                    <span className="text-xs font-medium text-white/80">
                        {status === 'success' ? 'Synchronized' : status === 'error' ? 'Sync Failed' : 'System Optimized'}
                    </span>
                </div>

                <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-95 disabled:opacity-50"
                >
                    <AnimatePresence mode="wait">
                        {isRefreshing ? (
                            <motion.div
                                key="refreshing"
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            >
                                <RefreshCcw className="w-4 h-4 text-blue-400" />
                            </motion.div>
                        ) : status === 'success' ? (
                            <motion.div key="success" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                            </motion.div>
                        ) : status === 'error' ? (
                            <motion.div key="error" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                <AlertCircle className="w-4 h-4 text-red-400" />
                            </motion.div>
                        ) : (
                            <motion.div key="idle" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                                <RefreshCcw className="w-4 h-4 text-white/60 group-hover:text-white" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </button>
            </div>

            {/* Progress Line */}
            {isRefreshing && (
                <motion.div
                    layoutId="sync-progress"
                    className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-blue-500 to-purple-500"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                />
            )}
        </motion.div>
    );
};

export default GlassRefreshWidget;
