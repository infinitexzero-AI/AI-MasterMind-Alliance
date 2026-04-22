import React, { useState, useEffect, useRef } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import { DashboardCard } from '../ui/DashboardCard';
import { Brain, Maximize2, RotateCcw } from 'lucide-react';
import { useNeuralSync } from '../NeuralSyncProvider';

export const DataMaterialization3D = ({ _dataInfo }: { _dataInfo?: any }) => {
    const { telemetry } = useNeuralSync();
    const [graphData, setGraphData] = useState<{ nodes: any[], links: any[] }>({ nodes: [], links: [] });
    const [isFullscreen, setIsFullscreen] = useState(false);
    const fgRef = useRef<any>(null);

    useEffect(() => {
        // Map real Redis namespaces to graph nodes
        const namespaces = telemetry?.namespaces || { "core": 1, "task": 1, "vault": 1 };
        const nsKeys = Object.keys(namespaces);

        const nodes = [
            { id: "nexus", name: "The Nexus", val: 15, group: 0, color: "#8b5cf6" },
            ...nsKeys.map((ns, i) => ({
                id: ns,
                name: ns.toUpperCase(),
                val: Math.log2(namespaces[ns] + 1) * 5 + 5,
                group: 1,
                color: i % 2 === 0 ? "#10b981" : "#3b82f6"
            }))
        ];

        const links = nsKeys.map(ns => ({
            source: ns,
            target: "nexus"
        }));

        setGraphData({ nodes, links });
    }, [telemetry]);

    const resetCamera = () => {
        if (fgRef.current) {
            fgRef.current.cameraPosition({ x: 0, y: 0, z: 250 }, { x: 0, y: 0, z: 0 }, 1000);
        }
    };

    return (
        <DashboardCard
            title={
                <span className="flex items-center">
                    <Brain className="mr-2 h-4 w-4 text-indigo-400" />
                    HIPPOCAMPUS 3D MATERIALIZATION
                </span>
            }
            headerAction={
                <div className="flex space-x-2">
                    <button
                        onClick={resetCamera}
                        className="p-1 hover:bg-zinc-800 rounded transition-colors"
                        title="Reset Gravity/Camera"
                    >
                        <RotateCcw className="h-4 w-4 text-zinc-400" />
                    </button>
                    <button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="p-1 hover:bg-zinc-800 rounded transition-colors"
                        title="Toggle Fullscreen"
                    >
                        <Maximize2 className="h-4 w-4 text-zinc-400" />
                    </button>
                </div>
            }
            className={isFullscreen ? 'fixed inset-4 z-50 shadow-2xl shadow-indigo-500/20' : 'h-[500px]'}
        >
            <div className="p-0 h-full w-full absolute inset-0 cursor-crosshair mt-12 bg-black">
                {typeof window !== "undefined" && (
                    <ForceGraph3D
                        ref={fgRef}
                        graphData={graphData}
                        backgroundColor="#000000"
                        nodeRelSize={6}
                        nodeResolution={16}
                        linkWidth={1}
                        linkOpacity={0.3}
                        linkColor={() => '#4b5563'} // zinc-600
                        nodeColor={node => (node as any).color}
                        enableNodeDrag={false}
                        showNavInfo={false}
                        onNodeHover={node => {
                            // Optional: Show tooltips
                            if (document.body.style) {
                                document.body.style.cursor = node ? 'pointer' : 'crosshair';
                            }
                        }}
                    />
                )}
            </div>
        </DashboardCard>
    );
};
