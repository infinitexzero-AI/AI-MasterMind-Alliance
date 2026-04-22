import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
    ssr: false,
    loading: () => <div className="text-xs text-slate-400 font-mono">Loading Neural Map...</div>
});

const FileSystemGraph = () => {
    const [data, setData] = useState({ nodes: [], links: [] });
    const graphRef = useRef<any>(null);

    useEffect(() => {
        fetch('/api/system/graph')
            .then(res => res.json())
            .then(gData => {
                setData(gData);
            })
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="w-full h-full relative border border-slate-800 rounded-lg overflow-hidden bg-black/50">
            <ForceGraph2D
                ref={graphRef}
                graphData={data}
                width={400} // Parent container width (approx for sidebar)
                height={300}
                nodeRelSize={4}
                nodeColor={node => {
                    const n = node as any;
                    return n.group === 1 ? '#22d3ee' : n.group === 0 ? '#ef4444' : '#64748b';
                }}
                linkColor={() => 'rgba(255,255,255,0.1)'}
                backgroundColor="transparent"
                onNodeClick={(node: any) => {
                    // Zoom to node
                    graphRef.current?.centerAt(node.x, node.y, 1000);
                    graphRef.current?.zoom(4, 2000);
                }}
            />
        </div>
    );
};

export default FileSystemGraph;
