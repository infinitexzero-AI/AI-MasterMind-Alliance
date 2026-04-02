import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
    duration?: number;
}

interface ToastContextType {
    showToast: (message: string, type?: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            role={toast.type === 'error' ? 'alert' : 'status'}
                            aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
                            className={`
                                pointer-events-auto
                                flex items-center gap-3 px-4 py-3 rounded-xl
                                bg-slate-900/60 backdrop-blur-2xl border
                                shadow-[0_10px_30px_rgba(0,0,0,0.5)]
                                ${toast.type === 'success' ? 'border-emerald-500/30 text-emerald-400' : ''}
                                ${toast.type === 'error' ? 'border-red-500/30 text-red-400' : ''}
                                ${toast.type === 'info' ? 'border-cyan-500/30 text-cyan-400' : ''}
                            `}
                        >
                            {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
                            {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
                            {toast.type === 'info' && <Info className="w-5 h-5" />}

                            <span className="text-sm font-medium tracking-tight pr-4">{toast.message}</span>

                            <button
                                onClick={() => removeToast(toast.id)}
                                className="ml-auto opacity-50 hover:opacity-100 transition-opacity"
                                title="Close notification"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};
