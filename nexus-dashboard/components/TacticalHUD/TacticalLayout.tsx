import React from 'react';
import { motion } from 'framer-motion';
import { DataStream } from './DataStream';

export const TacticalLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-cyan-500 overflow-hidden font-mono relative selection:bg-cyan-500/30 selection:text-white">
        
        {/* Background Grid - Perspective Plane */}
        <div className="absolute inset-0 perspective-[1000px] pointer-events-none opacity-20">
            <div className="w-[200vw] h-[200vh] -translate-x-[50%] -translate-y-[20%] rotate-x-[60deg] bg-[linear-gradient(rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:40px_40px] animate-[grid-scroll_20s_linear_infinite]" />
        </div>

        {/* Decorative HUD Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
            {/* Top Bar */}
            <div className="absolute top-0 left-0 w-full h-16 border-b border-cyan-900/50 bg-slate-900/50 backdrop-blur-sm flex justify-between items-center px-8">
                <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-cyan-500 animate-ping"></div>
                    <h1 className="text-2xl font-bold tracking-[0.2em] text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">SCORPION // OS</h1>
                </div>
                <div className="flex gap-8 text-xs text-cyan-700">
                    <div>NET: <span className="text-cyan-400">SECURE</span></div>
                    <div>FPS: <span className="text-cyan-400">60.0</span></div>
                    <div>MEM: <span className="text-cyan-400">12GB</span></div>
                </div>
            </div>

            {/* Corner Brackets */}
            <svg className="absolute top-20 left-10 w-32 h-32 opacity-50" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                <path d="M0 20 V0 H20" strokeWidth="2" />
            </svg>
            <svg className="absolute bottom-10 right-10 w-32 h-32 opacity-50 rotate-180" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                <path d="M0 20 V0 H20" strokeWidth="2" />
            </svg>

            {/* Side Data Streams */}
            <div className="absolute top-32 left-8 w-64 bottom-32 hidden lg:flex flex-col border-l border-cyan-900/30 pl-4 mask-image-gradient">
                <DataStream />
            </div>
             <div className="absolute top-32 right-8 w-64 bottom-32 hidden lg:flex flex-col border-r border-cyan-900/30 pr-4 text-right mask-image-gradient">
                <DataStream />
            </div>
        </div>

        {/* Main Viewport */}
        <main className="relative z-20 w-full h-screen pt-20 pb-10 px-0 lg:px-80 flex items-center justify-center">
            {children}
        </main>
        
        {/* Scanlines Effect */}
        <div className="absolute inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%] pointer-events-none"></div>
    </div>
  );
};
