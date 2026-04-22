import React, { useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import * as THREE from 'three';

// Dynamic import to avoid SSR issues with ForceGraph
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), { 
    ssr: false,
    loading: () => <div className="w-full h-full flex items-center justify-center bg-slate-900/40 rounded-3xl animate-pulse">
        <span className="text-cyan-500/50 font-mono text-xs uppercase tracking-widest">Initializing Neural 3D Graph...</span>
    </div>
});

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface GraphNode {
    id: string;
    label: string;
    type: string;
    val: number;
    timestamp?: string;
    x?: number;
    y?: number;
    z?: number;
}

interface GraphLink {
    source: string;
    target: string;
    type: string;
}

export const AilccGraph = () => {
    const { data, error, isLoading } = useSWR<{ nodes: GraphNode[], links: GraphLink[] }>('/api/system/graph', fetcher);
    const fgRef = useRef<any>(null);

    // Memoize graph data with temporal Z-axis calculation
    const graphData = useMemo(() => {
        if (!data || !data.nodes) return { nodes: [], links: [] };

        const now = new Date().getTime();
        const DayMs = 24 * 60 * 60 * 1000;

        const nodes = data.nodes.map(node => {
            let z = 0;
            if (node.timestamp) {
                const ts = new Date(node.timestamp).getTime();
                // Map time to Z axis: younger nodes are closer (Z > 0), older are deeper (Z < 0)
                z = (ts - now) / (DayMs * 0.1); // 10 units per day
            } else if (node.type === 'agent') {
                z = 100; // Agents are the most "current" / frontal layer
            }

            return {
                ...node,
                z: node.z || z,
                color: node.type === 'agent' ? '#06b6d4' : node.type === 'mission' ? '#a855f7' : '#ffffff'
            };
        });

        // Filter valid links
        const nodeIds = new Set(nodes.map(n => n.id));
        const links = (data.links || []).filter(l => 
            nodeIds.has(typeof l.source === 'string' ? l.source : (l.source as any).id) && 
            nodeIds.has(typeof l.target === 'string' ? l.target : (l.target as any).id)
        );

        return { nodes, links };
    }, [data]);

    const handleNodeClick = useCallback((node: any) => {
        // Aim at node from outside it
        const distance = 40;
        const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);

        fgRef.current.cameraPosition(
            { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new pos
            node, // lookAt property
            3000  // transition ms
        );
    }, [fgRef]);

    if (error) return (
        <div className="w-full h-full flex items-center justify-center bg-red-950/20 rounded-3xl border border-red-500/20 p-8">
            <p className="text-red-400 font-mono text-sm uppercase">Telemetry Offline: Failed to synchronize temporal mapping.</p>
        </div>
    );

    return (
        <div className="w-[1920px] h-[1080px] bg-slate-950/40 rounded-3xl border border-white/5 overflow-hidden relative shadow-2xl">
            {/* Header Overlay */}
            <div className="absolute top-8 left-8 z-10 pointer-events-none">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-3 h-3 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_15px_rgba(6,182,212,0.8)]" />
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Temporal KI Graph</h2>
                        <p className="text-cyan-500/60 font-mono text-[10px] uppercase tracking-widest">3D Knowledge Evolution Mapping (Ω Convergence)</p>
                    </div>
                </div>
                
                <div className="flex flex-col gap-2 mt-8">
                    <LegendItem colorClass="bg-cyan-500" label="Swarm Agents" />
                    <LegendItem colorClass="bg-purple-500" label="Historical Missions" />
                    <LegendItem colorClass="bg-white" label="System Roots" />
                </div>
            </div>

            {/* Controls Info */}
            <div className="absolute bottom-8 right-8 z-10 pointer-events-none text-right">
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest leading-loose">
                    DRAG TO ROTATE<br />
                    SCROLL TO ZOOM<br />
                    CLICK NODE TO FOCUS<br />
                    Z-AXIS: TEMPORALITY
                </p>
            </div>

            {!isLoading && data && (
                <ForceGraph3D
                    ref={fgRef}
                    graphData={graphData}
                    nodeLabel={(node: any) => `${node.type.toUpperCase()}: ${node.label || node.id}`}
                    nodeColor={(node: any) => node.color}
                    nodeVal={(node: any) => node.type === 'agent' ? 2 : 1}
                    nodeRelSize={4}
                    linkColor={() => 'rgba(255, 255, 255, 0.2)'}
                    linkWidth={1}
                    linkDirectionalParticles={2}
                    linkDirectionalParticleSpeed={0.005}
                    backgroundColor="rgba(0,0,0,0)"
                    onNodeClick={handleNodeClick}
                    enableNodeDrag={false}
                    showNavInfo={false}
                />
            )}
        </div>
    );
};

const LegendItem = ({ colorClass, label }: { colorClass: string, label: string }) => (
    <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${colorClass}`} />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</span>
    </div>
);
