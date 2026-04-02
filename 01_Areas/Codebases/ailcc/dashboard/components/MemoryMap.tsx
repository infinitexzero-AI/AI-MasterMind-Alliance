import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Target, Info, Search } from 'lucide-react';
import dynamic from 'next/dynamic';

const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), { ssr: false });

export interface MemoryNode {
    id: string;
    text: string;
    category: string;
    x: number;
    y: number;
    importance: number;
}

export interface ClusterInfo {
    name: string;
    color: string;
}

export default function MemoryMap({
    memories,
    clusters,
    searchQuery
}: {
    memories: MemoryNode[];
    clusters: ClusterInfo[];
    searchQuery: string;
}) {
    const [hoveredNode, setHoveredNode] = useState<any | null>(null);

    const getCategoryColor = (category: string) => {
        return clusters.find(c => c.name === category)?.color || '#94a3b8';
    };

    const filteredMemories = useMemo(() => {
        if (!searchQuery) return memories;
        return memories.filter(m =>
            m.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [memories, searchQuery]);

    // Construct 3D Graph Model
    const graphData = useMemo(() => {
        const nodes = filteredMemories.map(m => ({
            id: m.id,
            name: m.text,
            group: m.category,
            val: Math.max(2, m.importance * 10),
            color: getCategoryColor(m.category)
        }));

        // Map D3 physics links to bridge items within the same biological category
        const links: any[] = [];
        const categoryMap = new Map<string, string[]>();
        
        nodes.forEach(n => {
            if (!categoryMap.has(n.group)) categoryMap.set(n.group, []);
            categoryMap.get(n.group)!.push(n.id);
        });

        categoryMap.forEach((nodeIds) => {
            for (let i = 0; i < nodeIds.length - 1; i++) {
                links.push({ source: nodeIds[i], target: nodeIds[i + 1] });
            }
        });

        return { nodes, links };
    }, [filteredMemories, clusters]);

    return (
        <div className="relative w-full h-[600px] bg-slate-950/40 rounded-3xl border border-white/5 overflow-hidden backdrop-blur-xl group">

            {/* Background Grid / Starfield */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:40px_40px]" />
            </div>

            {/* 120FPS WebGL 3D Galaxy Map */}
            <div className="absolute inset-0 z-10 cursor-move">
                {filteredMemories.length > 0 ? (
                    <ForceGraph3D
                        graphData={graphData}
                        nodeColor={node => (node as any).color}
                        nodeVal={node => (node as any).val}
                        nodeLabel={node => ""}
                        linkColor={() => "rgba(255, 255, 255, 0.1)"}
                        linkWidth={1}
                        backgroundColor="rgba(0,0,0,0)"
                        onNodeHover={node => setHoveredNode(node)}
                        enableNodeDrag={false}
                        warmupTicks={100}
                        cooldownTicks={0}
                    />
                ) : null}
            </div>

            {/* Floating Detail Tooltip */}
            <AnimatePresence>
                {hoveredNode && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute bottom-8 right-8 pointer-events-none z-[100] renaissance-panel p-5 bg-slate-900/95 border border-white/20 rounded-2xl shadow-2xl max-w-sm backdrop-blur-xl"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <style>{`.dynamic-hover { background-color: ${hoveredNode.color}; color: ${hoveredNode.color}; }`}</style>
                            <span className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor] dynamic-hover" />
                            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">
                                {hoveredNode.group} | Synapse {hoveredNode.id.substring(0, 8)}
                            </span>
                        </div>
                        <p className="text-sm text-slate-100 leading-relaxed italic border-l-2 pl-3 border-purple-500/30">
                            "{hoveredNode.name}"
                        </p>
                        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                            <div className="flex items-center gap-1.5 text-[10px] text-cyan-400 font-mono">
                                <Target className="w-3.5 h-3.5" />
                                <span>PHYSICS MASS: {hoveredNode.val.toFixed(2)}</span>
                            </div>
                            <Info className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Legend HUD */}
            <div className="absolute top-6 left-6 p-5 bg-black/60 border border-white/10 rounded-2xl backdrop-blur-xl z-[50]">
                <h5 className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-purple-400" /> 3D Semantic Clusters
                </h5>
                <div className="space-y-2.5">
                    {clusters.map((cluster, i) => (
                        <div key={cluster.name} className="flex items-center gap-3">
                            <style>{`.dynamic-cluster-${i} { background-color: ${cluster.color}; color: ${cluster.color}; }`}</style>
                            <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor] dynamic-cluster-${i}`} />
                            <span className="text-[11px] font-mono text-slate-200 tracking-wider">
                                {cluster.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Empty State Navigation Hint */}
            {filteredMemories.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 z-50">
                    <Search className="w-12 h-12 mb-4 opacity-20" />
                    <span className="font-mono text-xs uppercase tracking-widest">No matching memory vectors in active synapse</span>
                </div>
            )}
        </div>
    );
}
