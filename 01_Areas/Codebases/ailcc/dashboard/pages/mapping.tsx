import React from 'react';
import Head from 'next/head';
import NexusLayout from '../components/NexusLayout';
import { Network, Server, Globe2, Activity } from 'lucide-react';
import { useAuth } from '../src/contexts/AuthContext';
import dynamic from 'next/dynamic';
import { useEffect, useState, useRef } from 'react';

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
  const fgRef = useRef<any>(null);

  useEffect(() => {
     // Initial Fetch
     const fetchGraph = async () => {
         try {
             // Port 8000 belongs to the Python System Core
             const response = await fetch('http://localhost:8000/system/graph');
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
     };

     fetchGraph();

     // Pole for topology shifts every 15s
     const interval = setInterval(fetchGraph, 15000);
     return () => clearInterval(interval);
  }, []);

  if (!hasAccess('mapping')) return null;

  return (
    <NexusLayout>
      <Head>
        <title>Mapping | Topology Grid</title>
      </Head>
      
      <div className="w-full h-[calc(100vh-4rem)] flex flex-col p-4 lg:p-6 gap-6 max-w-7xl mx-auto">
        {/* Header Ribbon */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tighter text-white flex items-center gap-3">
                    <Network className="w-8 h-8 text-indigo-500" /> Topology Grid
                </h1>
                <p className="font-mono text-[10px] text-slate-400 tracking-widest uppercase mt-1">
                    Node Network Mapping & Asset Tracking
                </p>
            </div>
            <div className={`flex items-center gap-3 bg-slate-900/50 p-2 rounded-lg border border-slate-700/50 ${isLive ? 'border-emerald-500/50' : 'border-rose-500/50'}`}>
               <span className="text-[10px] font-mono text-indigo-400 tracking-widest uppercase px-2">
                   <span className={isLive ? "text-emerald-400" : "text-rose-400"}>{isLive ? 'Link Active' : 'Link Offline'} | </span> 
                   <span className="text-white">Nodes:</span> {graphData.nodes.length}
               </span>
            </div>
        </div>

        {/* Neural Map Canvas Shell */}
        <div className="flex-1 min-h-[500px] w-full bg-[#030712] rounded-xl border border-indigo-500/20 shadow-[inset_0_0_100px_rgba(99,102,241,0.05)] relative overflow-hidden flex flex-col pt-6 px-6">
            
            <div className="flex flex-wrap items-center justify-between mb-4 border-b border-indigo-500/20 pb-4 z-10">
                 <h2 className="text-sm font-mono tracking-widest uppercase text-indigo-300">Live Architecture Map</h2>
                 <div className="flex gap-2 text-[10px] font-mono tracking-widest text-slate-500">
                     <span className="flex items-center gap-1"><Server className="w-3 h-3 text-emerald-500"/> MCP</span> //
                     <span className="flex items-center gap-1"><Globe2 className="w-3 h-3 text-cyan-500"/> Relay</span>
                 </div>
            </div>

            {/* Topology Graph Engine view */}
            <div className="flex-1 w-full h-full absolute inset-0 pt-16 -z-0">
               {isLive && graphData.nodes.length > 0 ? (
                   <ForceGraph2D
                       ref={fgRef}
                       graphData={graphData}
                       // Clean dark mode styling
                       backgroundColor="#030712"
                       nodeColor={(node: any) => node.type === 'agent' ? '#8b5cf6' : node.type === 'memory' ? '#10b981' : '#6366f1'}
                       nodeVal={(node: any) => node.val || 5}
                       nodeLabel={(node: any) => `${node.label} (${node.role || node.type})`}
                       linkColor={() => 'rgba(99,102,241,0.2)'}
                       linkWidth={1}
                       enableZoomInteraction={true}
                       // Cooldown limits to stop infinite jitter
                       cooldownTicks={100}
                       onEngineStop={() => { 
                           if (fgRef.current && typeof (fgRef.current as any).zoomToFit === 'function') {
                               (fgRef.current as any).zoomToFit(400, 50); 
                           }
                       }}
                   />
               ) : (
                   <div className="flex-1 flex flex-col items-center justify-center opacity-30 select-none h-full pt-16">
                       <Network className="w-64 h-64 text-indigo-500/10 mb-4" />
                       <div className="text-center flex flex-col items-center">
                           <Activity className="w-6 h-6 text-rose-500 animate-pulse mb-2" />
                           <p className="font-mono text-sm tracking-widest uppercase text-rose-400">Telemetry Lost</p>
                           <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-slate-600 mt-2">Awaiting Python Core Re-link (Port 8000)</p>
                       </div>
                   </div>
               )}
            </div>

            {/* Action Overlay */}
             <div className="absolute bottom-6 right-6 flex gap-2 z-10">
                 <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[10px] uppercase tracking-widest px-4 py-2 rounded-lg transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                     Re-Scan Grid
                 </button>
             </div>
        </div>
      </div>
    </NexusLayout>
  );
}
