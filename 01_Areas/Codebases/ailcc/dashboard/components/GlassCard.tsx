import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    hover?: boolean;
}

const GlassCard = ({ children, className = '', delay = 0, hover = true }: GlassCardProps) => {
    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
                className={`
                    relative overflow-hidden
                    bg-slate-900/40 backdrop-blur-xl
                    border border-white/10 rounded-2xl
                    shadow-[0_8px_32px_rgba(0,0,0,0.3)]
                    ${hover ? 'hover:border-cyan-500/30 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4),0_0_20px_hsla(var(--neon-cyan)/0.1)] hover:-translate-y-1' : ''}
                    transition-all duration-300
                    ${className}
                `}
            >
                {/* Subtle Glint Effect */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-50" />

                {/* Card Content */}
                <div className="relative z-10 p-6">
                    {children}
                </div>

                {/* Ambient Background Glow (Optional subtle interaction) */}
                <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-cyan-500/5 rounded-full blur-[60px] pointer-events-none" />
            </motion.div>
        </>
    );
};

export default GlassCard;
