import React from 'react';
import Head from 'next/head';
import NexusLayout from '../components/NexusLayout';
import { Network, Activity, Info, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../src/contexts/AuthContext';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef, useCallback } from 'react';

// ForceGraph requires window context, cannot be SSR'd
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

interface GraphData {
    nodes: any[];
    links: any[];
}

export default function Mapping() {
  const { hasAccess } = useAuth();
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [isLive, setIsLive] = useState(false);
  const [hoverNode, setHoverNode] = useState<any>(null);
  const fgRef = useRef<any>(null);

  const fetchGraph = useCallback(async () => {
    try {
        // Point to internal Nexus API instead of lost Python port
        const response = await fetch('/api/system/graph');
        if (response.ok) {
            const data = await response.json();
            setGraphData(data);
            setIsLive(true);
        } else {
            setIsLive(false);
        }
    } catch (e) {
        setIsLive(false);
    }
  }, []);

  useEffect(() => {
     fetchGraph();
     const interval = setInterval(fetchGraph, 15000);
     return () => clearInterval(interval);
  }, [fetchGraph]);

  // Premium Node Rendering
  const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    // Safety check for finite coordinates during initial simulation frames
    const x = Number.isFinite(node.x) ? node.x : 0;
    const y = Number.isFinite(node.y) ? node.y : 0;

    const label = node.label || 'Unknown';
    const fontSize = 12 / globalScale;
    ctx.font = `${fontSize}px "Inter", sans-serif`;
    const textWidth = ctx.measureText(label).width;
    const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

    // Node Glow
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, node.val * 1.5);
    let color = '#6366f1'; // Default Indigo
    if (node.type === 'agent') color = '#8b5cf6'; // Purple
    if (node.type === 'host') color = '#06b6d4'; // Cyan
    if (node.type === 'storage') color = '#10b981'; // Emerald
    if (node.type === 'memory') color = '#f59e0b'; // Amber
    if (node.type === 'external') color = '#f43f5e'; // Rose

    gradient.addColorStop(0, `${color}44`);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, node.val * 1.5, 0, 2 * Math.PI, false);
    ctx.fill();

    // Node Core
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, node.val / 2, 0, 2 * Math.PI, false);
    ctx.fill();

    // Node Label Background (on hover or host)
    if (hoverNode === node || node.type === 'host') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(x - bckgDimensions[0] / 2, y - bckgDimensions[1] / 2 - node.val - 2, bckgDimensions[0] as number, bckgDimensions[1] as number);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        ctx.fillText(label, x, y - node.val - 5);
    }
  }, [hoverNode]);

  if (!hasAccess('mapping')) return null;

  return (
    <NexusLayout>
      <Head>
        <title>Mapping | Topology Grid</title>
      </Head>
      
      <div className="w-full h-[calc(100vh-4rem)] flex flex-col p-4 lg:p-6 gap-6 max-w-[1600px] mx-auto animate-in fade-in duration-700">
        {/* Header Ribbon */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="group cursor-default">
                <h1 className="text-4xl font-black tracking-tighter text-white flex items-center gap-3 italic">
                    <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30 group-hover:scale-110 transition-transform">
                        <Network className="w-8 h-8 text-indigo-400" />
                    </div>
                    TOPOLOGY GRID
                </h1>
                <p className="font-mono text-[10px] text-slate-500 tracking-[0.4em] uppercase mt-1 pl-1">
                    Neural Node Network & Architecture Matrix
                </p>
            </div>
            <div className={`flex items-center gap-4 bg-slate-950/60 p-3 rounded-2xl border backdrop-blur-xl transition-all ${isLive ? 'border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.1)]'}`}>
               <div className="flex flex-col items-end">
                   <span className="text-[9px] font-black font-mono tracking-widest uppercase text-slate-500">Uplink Status</span>
                   <span className={`text-xs font-bold uppercase tracking-tighter flex items-center gap-2 ${isLive ? "text-emerald-400" : "text-rose-400"}`}>
                       {isLive ? <Zap className="w-3 h-3 fill-current" /> : <Activity className="w-3 h-3" />}
                       {isLive ? 'Link Established' : 'Telemetry Lost'}
                   </span>
               </div>
               <div className="w-px h-8 bg-white/10" />
               <div className="flex flex-col items-start">
                   <span className="text-[9px] font-black font-mono tracking-widest uppercase text-slate-500">Active Nodes</span>
                   <span className="text-lg font-black text-white leading-none">{graphData.nodes.length}</span>
               </div>
            </div>
        </div>

        {/* Neural Map Canvas Shell */}
        <div className="flex-1 min-h-[500px] w-full bg-[#020617] rounded-3xl border border-white/5 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col pt-8 px-8">
            
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent" />

            <div className="flex flex-wrap items-center justify-between mb-6 border-b border-white/5 pb-6 z-10">
                 <div>
                    <h2 className="text-sm font-black tracking-[0.2em] uppercase text-indigo-400/80 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" /> Vanguard Architecture Map
                    </h2>
                    <p className="text-[10px] font-mono text-slate-500 mt-1 uppercase">Live Recursive Visualization // Sync Mode: Active</p>
                 </div>
                 <div className="flex gap-4 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                     <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Compute</span>
                     <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/5 border border-indigo-500/10"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" /> Agent</span>
                     <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/5 border border-rose-500/10"><div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> External</span>
                 </div>
            </div>

            {/* Topology Graph Engine view */}
            <div className="flex-1 w-full h-full absolute inset-0 pt-24 -z-0">
               {isLive && graphData.nodes.length > 0 ? (
                   <ForceGraph2D
                       ref={fgRef}
                       graphData={graphData}
                       backgroundColor="#020617"
                       nodeCanvasObject={paintNode}
                       onNodeHover={setHoverNode}
                       linkColor={() => 'rgba(99,102,241,0.15)'}
                       linkWidth={1}
                       enableZoomInteraction={true}
                       cooldownTicks={100}
                       onEngineStop={() => { 
                           if (fgRef.current && typeof (fgRef.current as any).zoomToFit === 'function') {
                               (fgRef.current as any).zoomToFit(600, 100); 
                           }
                       }}
                   />
               ) : (
                   <div className="flex-1 flex flex-col items-center justify-center select-none h-full pt-16">
                        <div className="relative">
                            <Network className="w-48 h-48 text-indigo-500/5 mb-4 animate-pulse" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Activity className="w-12 h-12 text-rose-500/20 animate-ping" />
                            </div>
                        </div>
                        <div className="text-center flex flex-col items-center">
                            <h3 className="font-black text-2xl tracking-tighter uppercase text-white/20">Nexus Offline</h3>
                            <p className="font-mono text-[10px] tracking-[0.5em] uppercase text-rose-500/50 mt-2">Awaiting Vanguard Sync Sequence</p>
                        </div>
                   </div>
               )}
            </div>

            {/* Vanguard Detail HUD (Floating) */}
            <AnimatePresence>
                {hoverNode && (
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="absolute top-32 left-8 w-64 bg-slate-950/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 z-20 shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">{hoverNode.type} Node</span>
                            <div className={`w-2 h-2 rounded-full ${hoverNode.status === 'ONLINE' || hoverNode.status === 'ACTIVE' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'}`} />
                        </div>
                        <h4 className="text-lg font-black text-white leading-tight mb-1">{hoverNode.label}</h4>
                        <p className="text-[11px] text-slate-400 font-mono italic mb-4">{hoverNode.role}</p>
                        <div className="grid grid-cols-2 gap-2">
                             <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                                 <span className="text-[8px] font-bold text-slate-500 uppercase block mb-1">Status</span>
                                 <span className="text-[10px] font-black text-white uppercase">{hoverNode.status}</span>
                             </div>
                             <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                                 <span className="text-[8px] font-bold text-slate-500 uppercase block mb-1">Priority</span>
                                 <span className="text-[10px] font-black text-indigo-400 uppercase">{hoverNode.val > 30 ? 'High' : 'Normal'}</span>
                             </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Action Overlay */}
             <div className="absolute bottom-8 right-8 flex gap-3 z-10">
                 <button 
                    onClick={() => { 
                        fetchGraph(); 
                        if (fgRef.current && typeof (fgRef.current as any).zoomToFit === 'function') {
                            (fgRef.current as any).zoomToFit(600, 100); 
                        }
                    }}
                    className="group bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-tighter px-6 py-3 rounded-xl transition-all shadow-[0_8px_20px_rgba(99,102,241,0.4)] flex items-center gap-2"
                 >
                     <Zap className="w-4 h-4 fill-white group-hover:scale-125 transition-transform" />
                     Force Grid Re-Scan
                 </button>
                 <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-xl p-3 flex items-center gap-3">
                     <Info className="w-4 h-4 text-slate-500" />
                     <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest leading-none">Vanguard Topology // v2.0-Alpha</span>
                 </div>
             </div>
        </div>
      </div>
    </NexusLayout>
  );
}
