import React from 'react';
import { motion } from 'framer-motion';

// Inline simple styles to avoid module dependency issues if css missing
const styles = {
    nodeContainer: "absolute flex items-center gap-2 transform -translate-x-1/2 -translate-y-1/2",
    nodeLabel: "text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-2 py-1 rounded backdrop-blur border border-white/10 whitespace-nowrap",
    orbitalRing: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5 pointer-events-none"
};

export const KnowledgeGraph: React.FC = () => {
    return (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
             {/* Dynamic Grid Background */}
             <div className="absolute inset-0 bg-grid-dots opacity-[0.03]" />

             {/* Central Hub */}
             <Node x="50%" y="50%" label="HIPPOCAMPUS" type="core" scale={1.2} />

             {/* Ring 1: Components */}
             <OrbitalRing radius={120} duration={40} />
             <Satellite angle={0} radius={120} label="SystemHUD" type="interface" />
             <Satellite angle={90} radius={120} label="Orchestrator" type="automation" />
             <Satellite angle={180} radius={120} label="FocusTimer" type="interface" />
             <Satellite angle={270} radius={120} label="Deployment" type="automation" />

             {/* Ring 2: Concepts */}
             <OrbitalRing radius={200} duration={60} reverse />
             <Satellite angle={45} radius={200} label="Visual Cortex" type="intelligence" />
             <Satellite angle={135} radius={200} label="Motor Cortex" type="intelligence" />
             <Satellite angle={225} radius={200} label="Prefrontal" type="intelligence" />
             <Satellite angle={315} radius={200} label="Silicon Brain" type="core" />
        </div>
    );
};

interface NodeProps {
    x: string | number;
    y: string | number;
    label: string;
    type: 'core' | 'interface' | 'automation' | 'intelligence';
    scale?: number;
}

const Node = ({ x, y, label, type, scale = 1 }: NodeProps) => {
    const colors: Record<string, string> = {
        core: 'bg-white text-slate-900 shadow-[0_0_30px_rgba(255,255,255,0.3)]',
        interface: 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]',
        automation: 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]',
        intelligence: 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
    };

    return (
        <motion.div 
            style={{ left: x, top: y, scale }} 
            className={`group ${styles.nodeContainer}`}
        >
            <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 10 }}
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] cursor-pointer hover:scale-110 transition-transform ${colors[type]}`}
            >
                {label.charAt(0)}
            </motion.div>
            <span className={styles.nodeLabel}>
                {label}
            </span>
        </motion.div>
    );
};

const OrbitalRing = ({ radius, duration, reverse }: { radius: number, duration: number, reverse?: boolean }) => {
    return (
        <motion.div 
            style={{ width: radius * 2, height: radius * 2 }}
            animate={{ rotate: reverse ? -360 : 360 }}
            transition={{ duration, repeat: Infinity, ease: "linear" }}
            className={styles.orbitalRing}
        />
    );
};

const Satellite = ({ angle, radius, label, type }: { angle: number, radius: number, label: string, type: any }) => {
   const rad = (angle * Math.PI) / 180;
   const x = `calc(50% + ${Math.cos(rad) * radius}px)`;
   const y = `calc(50% + ${Math.sin(rad) * radius}px)`;
   return <Node x={x} y={y} label={label} type={type} />;
};
