import React from 'react';
import { motion } from 'framer-motion';
import styles from '../../styles/components.module.css';

export const ReactorCore = () => {
    return (
        <div className={styles.reactorContainer}>
            {/* Outer Rings */}
            {[1, 2, 3].map((i) => (
                <motion.div
                    key={i}
                    className={styles.reactorRing}
                    style={{ 
                        width: `${100 - (i * 15)}%`, 
                        height: `${100 - (i * 15)}%`,
                        /* keeping dynamic width/height inline as it depends on loop variable 'i' */
                    }}
                    animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                    transition={{ duration: 10 + (i * 5), repeat: Infinity, ease: "linear" }}
                />
            ))}

            {/* Core Pulse */}
            <motion.div 
                className="w-32 h-32 bg-cyan-500/10 rounded-full blur-xl absolute"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
            />
            
            <div className="relative z-10 w-40 h-40 bg-slate-900 rounded-full border border-cyan-500 flex items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.4)]">
                <div className="text-center">
                    <div className="text-[10px] text-cyan-600 tracking-widest mb-1">SYSTEM STATUS</div>
                    <div className="text-3xl font-bold text-white tracking-widest">ONLINE</div>
                    <div className="text-[10px] text-cyan-400 mt-1 animate-pulse">100% CAPACITY</div>
                </div>
            </div>

            {/* Orbiting Satellites */}
            {[0, 120, 240].map((angle) => (
                <motion.div
                    key={angle}
                    className="absolute w-full h-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                    {(() => {
                        const satelliteStyle = { '--angle': `${angle}deg` } as React.CSSProperties;
                        return (
                            <motion.div 
                                className={styles.satelliteContainer}
                                style={satelliteStyle}
                            >
                                <div className="w-1 h-1 bg-white rounded-full"></div>
                            </motion.div>
                        );
                    })()}
                </motion.div>
            ))}
        </div>
    );
};
