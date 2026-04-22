import React from 'react';
import { motion } from 'framer-motion';
import styles from '../styles/components.module.css';

const CapabilityGraph: React.FC = () => {
    // A more complex visualization for the full page view
    return (
        <div className={styles.graphContainer}>
             
             {/* Central Hub */}
             <Node x="50%" y="50%" label="NEXUS CORE" type="core" scale={1.5} />

             {/* Orbital Ring 1: Interface */}
             <OrbitalRing radius={150} duration={20} />
             <Satellite angle={0} radius={150} label="Omni-Bar" type="interface" />
             <Satellite angle={120} radius={150} label="Dashboard" type="interface" />
             <Satellite angle={240} radius={150} label="VS Code" type="interface" />

             {/* Orbital Ring 2: Automation */}
             <OrbitalRing radius={300} duration={35} reverse />
             <Satellite angle={45} radius={300} label="Mode 6 Loop" type="automation" />
             <Satellite angle={135} radius={300} label="n8n Pipelines" type="automation" />
             <Satellite angle={225} radius={300} label="GitHub Actions" type="automation" />
             <Satellite angle={315} radius={300} label="MCP Bridge" type="automation" />

             {/* Orbital Ring 3: Intelligence */}
             <OrbitalRing radius={450} duration={50} />
             <Satellite angle={30} radius={450} label="Intent Router" type="intelligence" />
             <Satellite angle={90} radius={450} label="Memory Manager" type="intelligence" />
             <Satellite angle={150} radius={450} label="xAI API" type="intelligence" />
             <Satellite angle={210} radius={450} label="Code Expert" type="intelligence" />
             <Satellite angle={270} radius={450} label="Research Unit" type="intelligence" />
             <Satellite angle={330} radius={450} label="Strategist" type="intelligence" />

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
        core: 'bg-white text-slate-900 shadow-[0_0_50px_rgba(255,255,255,0.5)]',
        interface: 'bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)]',
        automation: 'bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)]',
        intelligence: 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]'
    };

    const dynamicStyle = { 
        '--node-x': x, 
        '--node-y': y, 
        '--node-scale': scale 
    } as React.CSSProperties;

    return (
        <motion.div 
            style={dynamicStyle} 
            className={styles.nodeContainer}
        >
            <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 10 }}
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xs ${colors[type]}`}
            >
                {label.charAt(0)}
            </motion.div>
            <span className={styles.nodeLabel}>
                {label}
            </span>
        </motion.div>
    );
};

interface OrbitalRingProps {
    radius: number;
    duration: number;
    reverse?: boolean;
}

const OrbitalRing = ({ radius, duration, reverse }: OrbitalRingProps) => {
    return (
        <motion.div 
            style={{ width: radius * 2, height: radius * 2 }}
            animate={{ rotate: reverse ? -360 : 360 }}
            transition={{ duration, repeat: Infinity, ease: "linear" }}
            className={styles.orbitalRing}
        >
        </motion.div>
    );
};

interface SatelliteProps {
    angle: number;
    radius: number;
    label: string;
    type: 'core' | 'interface' | 'automation' | 'intelligence';
}

const Satellite = ({ angle, radius, label, type }: SatelliteProps) => {
   const rad = (angle * Math.PI) / 180;
   const x = `calc(50% + ${Math.cos(rad) * radius}px)`;
   const y = `calc(50% + ${Math.sin(rad) * radius}px)`;

   return <Node x={x} y={y} label={label} type={type} />;
};

export default CapabilityGraph;
