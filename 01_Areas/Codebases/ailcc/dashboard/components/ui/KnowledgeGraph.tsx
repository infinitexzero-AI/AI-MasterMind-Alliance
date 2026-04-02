"use client";

import React, { useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useScholarGraph } from '../../hooks/useScholarGraph';
import { ShieldAlert } from 'lucide-react';

// Next.js structural constraint: D3 Canvas cannot be Server-Side Rendered (SSR).
// We dynamically invoke the client matrix natively.
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

export default function KnowledgeGraph() {
  const { data, status, error } = useScholarGraph();
  const fgRef = useRef<any>(null);

  const handleNodeClick = useCallback((node: any) => {
    // Zoom directly into the node mathematically when clicked
    if (fgRef.current) {
      fgRef.current.centerAt(node.x, node.y, 1000);
      fgRef.current.zoom(8, 2000);
    }
  }, [fgRef]);

  if (status === 'pending') {
    return (
      <div className="flex h-96 items-center justify-center bg-[#0d1117] border border-gray-800 rounded-xl animate-pulse">
        <span className="text-blue-400 font-mono text-sm">LOADING NEURAL CONSTELLATION...</span>
      </div>
    );
  }

  if (status === 'error') {
     return (
      <div className="flex flex-col h-96 items-center justify-center bg-[#0d1117]/80 border border-red-900/50 rounded-xl p-6 text-center">
        <ShieldAlert className="w-12 h-12 text-red-500 mb-4 opacity-50" />
        <p className="text-red-400 font-mono text-sm uppercase tracking-widest">
          Degraded &middot; Code: {error?.code || 'FETCH_FAILED'}
        </p>
        <p className="text-gray-500 font-mono text-xs mt-2">{error?.message || 'Scholar Graph telemetry offline.'}</p>
      </div>
    );
  }

  const graphData = data || { nodes: [], links: [] };

  if (!graphData.nodes || graphData.nodes.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center bg-[#0d1117] border border-gray-800 rounded-xl">
        <span className="text-gray-500 font-mono text-sm text-center">
          Epoch 31 Graph Matrix is empty.<br/>
          (Awaiting the Recursive Python Crawler)
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px] bg-[#0A0A0A] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-blue-400 font-semibold text-lg drop-shadow-lg">Nexus Semantic Topology</h3>
        <p className="text-xs text-gray-500 font-mono mt-1">
          Nodes: {graphData.nodes.length} | Connections: {graphData.links.length}
        </p>
      </div>
      
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeLabel="title"
        nodeColor={(node: any) => {
          if (node.label === "paper") return "#3b82f6"; // Primary Blue for ArXiv / Zotero notes
          if (node.label === "tag") return "#10b981";   // Green for Taguette thematic groups
          if (node.label === "citation") return "#8b5cf6"; // Purple for explicitly cited works
          return "#ef4444"; // Error Red
        }}
        nodeRelSize={6}
        linkColor={() => "rgba(75, 85, 99, 0.4)"}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={(d: any) => d.value * 0.001 || 0.005}
        onNodeClick={handleNodeClick}
        backgroundColor="#0A0A0A"
      />
    </div>
  );
}
