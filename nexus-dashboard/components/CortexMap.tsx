import React, { useEffect, useState, useRef, useCallback } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

const NODE_META: Record<string, any> = {
    'FORGE': { role: 'Code Execution Engine', prompt: 'Write highly optimized, scalable code.', confidenceTarget: '95%' },
    'SCOUT': { role: 'Deep Research Agent', prompt: 'Scan public web for semantic connections.', confidenceTarget: '90%' },
    'ARCHITECT': { role: 'System Orchestrator', prompt: 'Design complex architectural patterns.', confidenceTarget: '99%' },
    'MEMORY': { role: 'Vault Synthesizer', prompt: 'Connect vector embeddings to user tasks.', confidenceTarget: '85%' },
    'NEXUS': { role: 'General Director', prompt: 'Route tasks based on classification logic.', confidenceTarget: '95%' }
};

export default function CortexMap() {
    const [data, setData] = useState({ nodes: [], links: [] });
    const [loading, setLoading] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const fgRef = useRef<any>(null);
    const [selectedNode, setSelectedNode] = useState<any>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, node: any } | null>(null);
    const [quarantinedAgents, setQuarantinedAgents] = useState<Set<string>>(new Set());
    const [heatmapMode, setHeatmapMode] = useState(false);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/system/cortex-map');
                const json = await res.json();
                setData(json);
            } catch (e) {
                console.error('Failed to fetch Cortex Map data', e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 30000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (containerRef.current) {
            setDimensions({
                width: containerRef.current.clientWidth,
                height: containerRef.current.clientHeight
            });
        }

        const handleResize = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight
                });
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleClick = useCallback((node: any) => {
        setContextMenu(null);
        if (fgRef.current) {
            // Aim at node from outside it
            const distance = 40;
            const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

            fgRef.current.cameraPosition(
                { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
                node, // lookAt ({ x, y, z })
                3000  // ms transition duration
            );
        }
        setSelectedNode(node);
    }, [fgRef]);

    if (loading) return (
        <div className="flex items-center justify-center h-full bg-slate-900/50 animate-pulse rounded-xl border border-white/5">
            <span className="text-cyan-400 font-mono tracking-widest uppercase text-sm">Initializing 3D Orbital Mesh...</span>
        </div>
    );

    return (
        <div
            ref={containerRef}
            className="w-full h-full relative rounded-xl border border-white/10 overflow-hidden bg-[radial-gradient(circle_at_center,_#0f172a_0%,_#000000_100%)]"
        >
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                <h3 className="text-cyan-400 font-mono text-xs font-bold tracking-[0.3em] bg-black/60 px-3 py-1.5 rounded border border-cyan-500/30 backdrop-blur-md">
                    CORTEX_ORBITAL_V2.0
                </h3>
                <button
                    onClick={() => setHeatmapMode(!heatmapMode)}
                    className={`text-[10px] font-mono tracking-widest uppercase px-3 py-1 border rounded transition-all w-fit backdrop-blur-md ${heatmapMode ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-slate-800/80 text-slate-400 border-slate-600 hover:text-cyan-400 hover:border-cyan-500/50'}`}
                >
                    {heatmapMode ? 'Heatmap: ON' : 'Heatmap: OFF'}
                </button>
            </div>

            <ForceGraph3D
                ref={fgRef}
                graphData={data}
                width={dimensions.width}
                height={dimensions.height}
                backgroundColor="rgba(0,0,0,0)"
                nodeLabel="label"
                nodeColor={(node: any) => {
                    const isQuarantined = quarantinedAgents.has(node.label);
                    if (isQuarantined) return 'rgba(239, 68, 68, 0.8)'; // Red for quarantined

                    if (heatmapMode) {
                        const score = node.complexity || 0;
                        if (score < 100) return 'rgba(34, 211, 238, 0.8)'; // Cyan
                        if (score < 400) return 'rgba(245, 158, 11, 0.8)'; // Amber
                        return 'rgba(239, 68, 68, 0.8)'; // Red
                    }

                    switch (node.group) {
                        case 1: return 'rgba(34, 211, 238, 0.9)'; // Agents (Cyan)
                        case 2: return 'rgba(168, 85, 247, 0.9)'; // Services (Purple)
                        case 3: return 'rgba(245, 158, 11, 0.9)'; // Storage (Amber)
                        default: return 'rgba(148, 163, 184, 0.8)';
                    }
                }}
                nodeRelSize={6}
                nodeVal={(node: any) => node.size * 0.5}
                linkDirectionalArrowLength={3.5}
                linkDirectionalArrowRelPos={1}
                linkColor={() => 'rgba(255, 255, 255, 0.15)'}
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={0.005}
                linkDirectionalParticleWidth={1.5}
                onNodeClick={handleClick}
                onNodeRightClick={(node, event) => {
                    setContextMenu({ x: event.clientX, y: event.clientY, node });
                }}
                onBackgroundClick={() => {
                    setContextMenu(null);
                    setSelectedNode(null);
                }}
            />

            {/* Legend */}
            <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm p-3 rounded-lg border border-white/10 space-y-2 z-10 pointer-events-none">
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                    <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">Master Agents</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                    <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">Core Services</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                    <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">Intel Vault</span>
                </div>

                {selectedNode && (
                    <div className="absolute bottom-0 right-48 bg-slate-900/95 backdrop-blur-md border border-cyan-500/30 p-4 rounded-xl shadow-2xl z-10 w-64 pointer-events-auto transition-all animate-in fade-in slide-in-from-right-4">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-mono text-cyan-400 font-bold uppercase tracking-wider">{selectedNode.label}</h3>
                            <button onClick={() => setSelectedNode(null)} className="text-slate-500 hover:text-white">x</button>
                        </div>
                        {NODE_META[selectedNode.label] ? (
                            <div className="space-y-3 font-mono text-xs">
                                <div>
                                    <div className="text-slate-500 mb-0.5">ROLE</div>
                                    <div className="text-slate-200">{NODE_META[selectedNode.label].role}</div>
                                </div>
                                <div>
                                    <div className="text-slate-500 mb-0.5">PRIMARY DIRECTIVE</div>
                                    <div className="text-slate-300 italic line-clamp-3 leading-relaxed">{NODE_META[selectedNode.label].prompt}</div>
                                </div>
                                <div>
                                    <div className="text-slate-500 mb-0.5">CONFIDENCE TARGET</div>
                                    <div className="text-emerald-400 font-bold">{NODE_META[selectedNode.label].confidenceTarget}</div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-slate-400 font-mono text-xs">
                                3D Orbital Metrics:<br />
                                <br />Type Group: {selectedNode.group}
                                <br />Mass: {selectedNode.size}
                                {selectedNode.complexity !== undefined && (
                                    <><br />Logic Density: <span className={selectedNode.complexity > 400 ? 'text-red-400 font-bold' : 'text-cyan-400'}>{selectedNode.complexity}</span></>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Quarantine Context Menu */}
            {contextMenu && (
                <div
                    ref={(el) => {
                        if (el) {
                            el.style.left = `${contextMenu.x}px`;
                            el.style.top = `${contextMenu.y}px`;
                        }
                    }}
                    className="absolute bg-slate-900/95 backdrop-blur-md border border-slate-700 p-2 rounded-lg shadow-2xl z-50 flex flex-col gap-1 min-w-[200px]"
                >
                    <div className="px-2 pb-2 mb-1 border-b border-slate-700/50 flex justify-between items-center">
                        <span className="text-xs font-mono text-slate-400">Node: {contextMenu.node.label}</span>
                        <button onClick={() => setContextMenu(null)} className="text-slate-500 hover:text-white">x</button>
                    </div>

                    <button
                        className={`flex items-center gap-2 px-3 py-2 text-xs font-mono uppercase tracking-wider rounded transition-colors ${quarantinedAgents.has(contextMenu.node.label)
                            ? 'text-emerald-400 hover:bg-emerald-500/10'
                            : 'text-red-400 hover:bg-red-500/10'
                            }`}
                        onClick={() => {
                            const newSet = new Set(quarantinedAgents);
                            if (newSet.has(contextMenu.node.label)) {
                                newSet.delete(contextMenu.node.label);
                            } else {
                                newSet.add(contextMenu.node.label);
                            }
                            setQuarantinedAgents(newSet);
                            setContextMenu(null);
                        }}
                    >
                        {quarantinedAgents.has(contextMenu.node.label) ? (
                            <><ShieldCheck className="w-3 h-3" /> Lift Quarantine</>
                        ) : (
                            <><ShieldAlert className="w-3 h-3" /> Execute Quarantine</>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
