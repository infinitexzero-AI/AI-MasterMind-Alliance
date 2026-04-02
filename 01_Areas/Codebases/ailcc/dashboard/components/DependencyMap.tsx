import React, { useEffect, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), { ssr: false });
import { Loader2, RefreshCw, Target, X, FileCode, ExternalLink, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DepNode {
    id: string;
    path: string;
    group: number;
    x?: number;
    y?: number;
    z?: number;
}

interface DepLink {
    source: string;
    target: string;
}

interface DepData {
    nodes: DepNode[];
    links: DepLink[];
}

const DependencyMap: React.FC = () => {
    const [data, setData] = useState<DepData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedNode, setSelectedNode] = useState<DepNode | null>(null);
    const [codeContent, setCodeContent] = useState<string | null>(null);
    const [loadingCode, setLoadingCode] = useState(false);
    const fgRef = useRef<any>(null);

    const fetchGraph = async () => {
        setLoading(true);
        try {
            const resp = await fetch('/api/system/dependency-graph');
            if (!resp.ok) throw new Error('Failed to fetch dependency graph');
            const json = await resp.json();
            if (json) setData(json);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchCode = async (path: string) => {
        setLoadingCode(true);
        try {
            const resp = await fetch(`/api/system/view-file?filePath=${encodeURIComponent(path)}`);
            if (resp.ok) {
                const json = await resp.json();
                setCodeContent(json.content);
            } else {
                setCodeContent('// Failed to load file content.');
            }
        } catch (e) {
            setCodeContent('// Error: Connection lost.');
        } finally {
            setLoadingCode(false);
        }
    };

    useEffect(() => {
        fetchGraph();
    }, []);

    const getNodeColor = (node: any) => {
        switch (node.group) {
            case 1: return '#22d3ee'; // Pages (Cyan)
            case 2: return '#a855f7'; // Components (Purple)
            case 3: return '#f59e0b'; // Lib/Logic (Amber)
            default: return '#94a3b8';
        }
    };

    const handleNodeClick = useCallback((node: any) => {
        // Neural Flight Focus
        const distance = 150;
        const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

        fgRef.current.cameraPosition(
            { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new pos
            node, // lookAt node
            3000  // transition mb
        );

        setSelectedNode(node);
        fetchCode(node.path);
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[500px] bg-slate-900/50 rounded-xl border border-slate-800">
            <Loader2 className="w-8 h-8 text-cyan-500 animate-spin mb-4" />
            <p className="text-slate-400 font-mono text-sm">Initializing 3D Neural Cortex...</p>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center h-[500px] bg-slate-900/50 rounded-xl border border-red-900/30">
            <p className="text-red-400 font-mono text-sm mb-4">Error: {error}</p>
            <button onClick={fetchGraph} className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg text-xs hover:bg-slate-700 transition-colors">
                <RefreshCw className="w-3 h-3" /> Retry Neural Scan
            </button>
        </div>
    );

    return (
        <div className="relative w-full h-[700px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden group shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]">
            {/* Legend */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                <div className="px-3 py-1.5 bg-slate-900/80 backdrop-blur-md rounded-lg border border-slate-800 flex items-center gap-4 text-[10px] font-mono">
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]" /> Pages</div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" /> Components</div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" /> Services</div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-black/40 rounded border border-white/5 text-[9px] text-slate-500 font-mono tracking-widest uppercase">
                    <Box className="w-3 h-3" /> 3D Orbital Topology Active
                </div>
            </div>

            {/* Controls */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-0 group-hover:translate-y-0">
                <button
                    onClick={() => fgRef.current?.zoomToFit(1000)}
                    className="p-2 bg-slate-900/80 rounded-lg border border-slate-800 text-slate-400 hover:text-cyan-400 transition-all hover:scale-110 shadow-lg"
                    title="Reset Camera"
                >
                    <Target className="w-4 h-4" />
                </button>
            </div>

            {/* Archi-Console Overlay */}
            <AnimatePresence>
                {selectedNode && (
                    <motion.div
                        initial={{ opacity: 0, x: 50, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 50, scale: 0.95 }}
                        className="absolute top-4 right-16 z-20 w-[500px] bottom-4 bg-slate-900/90 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
                    >
                        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                            <div className="flex items-center gap-3">
                                <FileCode className="w-5 h-5 text-cyan-400" />
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-200 truncate w-72">{selectedNode.id}</span>
                                    <span className="text-[10px] text-slate-500 font-mono truncate w-72">{selectedNode.path}</span>
                                </div>
                            </div>
                            <button onClick={() => setSelectedNode(null)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors" title="Close details" aria-label="Close details">
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                        <div className="flex-1 p-4 overflow-auto custom-scrollbar bg-slate-950/40">
                            {loadingCode ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                                </div>
                            ) : (
                                <pre className="text-[10px] text-slate-300 font-mono leading-relaxed whitespace-pre">
                                    <code>{codeContent}</code>
                                </pre>
                            )}
                        </div>
                        <div className="p-4 bg-slate-900/50 border-t border-white/5 flex justify-between items-center">
                            <span className="text-[9px] text-slate-500 font-mono">Consensus Status: STABLE</span>
                            <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600/20 text-cyan-400 rounded-lg text-[10px] font-bold hover:bg-cyan-600/30 transition-all uppercase tracking-widest border border-cyan-500/30 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                                <ExternalLink className="w-3.5 h-3.5" /> Execute Refactor
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ForceGraph3D
                ref={fgRef}
                graphData={data || { nodes: [], links: [] }}
                nodeLabel="id"
                nodeColor={getNodeColor}
                nodeOpacity={0.9}
                nodeRelSize={6}
                linkColor={(link: any) => selectedNode && (link.source.id === selectedNode.id || link.target.id === selectedNode.id) ? '#22d3ee' : '#ffffff05'}
                linkWidth={(link: any) => selectedNode && (link.source.id === selectedNode.id || link.target.id === selectedNode.id) ? 1.5 : 0.5}
                linkDirectionalParticles={(link: any) => selectedNode && (link.source.id === selectedNode.id || link.target.id === selectedNode.id) ? 4 : 0}
                linkDirectionalParticleWidth={2}
                linkDirectionalParticleSpeed={0.005}
                backgroundColor="rgba(0,0,0,0)"
                showNavInfo={false}
                onNodeClick={handleNodeClick}
                enableNodeDrag={false}
            />
        </div>
    );
};

export default DependencyMap;
