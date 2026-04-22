'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Globe, Server, Zap, ServerCrash } from 'lucide-react';
import { io } from 'socket.io-client';

interface MeshNode {
  id: string;
  hostname: string;
  ip: string;
  status: 'online' | 'offline' | 'provisioning';
  role: 'origin' | 'shard';
  load: number;
}

export default function GlobalMeshMap() {
  const [nodes, setNodes] = useState<MeshNode[]>([
    { id: 'node-0', hostname: 'MacBook-Prime', ip: '127.0.0.1', status: 'online', role: 'origin', load: 45 }
  ]);
  const [synapseLog, setSynapseLog] = useState<string>('Listening to NEURAL_SYNAPSE...');

  useEffect(() => {
    // Connect to the central Socket.IO relay for mesh topography tracking
    const socket = io('http://localhost:3001');
    
    socket.on('NEURAL_SYNAPSE', (data) => {
      try {
        if (data.intent === 'SWARM_SCALING_PROPOSED') {
           setSynapseLog(`LEGION ALERT: ${data.details?.action || 'Scaling'} | Const: ${data.details?.cost || 0}`);
           // Simulate a node being provisioned
           setNodes(prev => {
              if(prev.find(n => n.id === 'node-1')) return prev;
              return [...prev, {
                  id: 'node-1', 
                  hostname: 'do-sfo3-01', 
                  ip: '104.236.x.x', 
                  status: 'provisioning',
                  role: 'shard',
                  load: 0
              }];
           });
        }
      } catch (e) {
        // ignore parse errors
      }
    });

    return () => { socket.disconnect(); };
  }, []);

  return (
    <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-white/10 text-white shadow-2xl relative overflow-hidden h-full flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">
            <Globe className="w-5 h-5" />
            Global Mesh Topography
          </h2>
          <p className="text-sm text-gray-400 mt-1">{synapseLog}</p>
        </div>
      </div>
      
      <div className="flex-1 min-h-[150px] relative flex justify-center items-center rounded-lg border border-white/5 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black">
        {/* Simple visual representation of nodes */}
        <div className="flex gap-8 items-center flex-wrap justify-center p-4">
            {nodes.map(node => (
                <motion.div 
                    key={node.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`flex flex-col items-center p-4 rounded-xl border ${node.role === 'origin' ? 'border-cyan-500/50 bg-cyan-900/20' : 'border-purple-500/50 bg-purple-900/20'}`}
                >
                   <div className="relative">
                       {node.status === 'online' ? (
                           <Server className={`w-8 h-8 ${node.role === 'origin' ? 'text-cyan-400' : 'text-purple-400'}`} />
                       ) : node.status === 'provisioning' ? (
                           <Zap className="w-8 h-8 text-yellow-400 animate-pulse" />
                       ) : (
                           <ServerCrash className="w-8 h-8 text-red-500" />
                       )}
                       
                       {/* Pulsing indicator for online nodes */}
                       {node.status === 'online' && (
                           <span className="absolute -top-1 -right-1 flex h-3 w-3">
                             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                             <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                           </span>
                       )}
                   </div>
                   <span className="mt-3 font-semibold text-sm">{node.hostname}</span>
                   <span className="text-xs text-gray-500">{node.ip}</span>
                   {node.status === 'provisioning' ? (
                       <span className="mt-1 text-xs text-yellow-400">INIT CLOUD SCRIPT...</span>
                   ) : (
                       <div className="w-full bg-gray-800 rounded-full h-1.5 mt-2 overflow-hidden">
                         <motion.div 
                           className="bg-cyan-500 h-1.5 rounded-full" 
                           animate={{ width: `${node.load}%` }} 
                           transition={{ duration: 0.5 }} 
                         />
                       </div>
                   )}
                </motion.div>
            ))}
        </div>
      </div>
    </div>
  );
}
