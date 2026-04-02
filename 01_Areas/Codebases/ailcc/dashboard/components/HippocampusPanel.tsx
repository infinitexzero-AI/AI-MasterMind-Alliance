import React, { useEffect, useState } from 'react';
import { Brain, HardDrive, Activity } from 'lucide-react';

const HippocampusPanel: React.FC = () => {
  const [memoryStats, setMemoryStats] = useState<any>(null);
  const [activeContext, setActiveContext] = useState<any>(null);
  const [vaultStatus, setVaultStatus] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Stats
        const statsRes = await fetch('http://localhost:8090/memory/stats');
        const statsData = await statsRes.json();
        setMemoryStats(statsData);

        // Fetch Vault Status
        const vaultRes = await fetch('http://localhost:8090/vault/status');
        const vaultData = await vaultRes.json();
        setVaultStatus(vaultData);

        // Fetch Active Context (Tasks)
        const contextRes = await fetch('http://localhost:8090/memory/get/project:tasks');
        const contextData = await contextRes.json();
        if (contextData.phases) {
          setActiveContext(contextData.phases);
        }
      } catch (error) {
        console.error('Failed to fetch Hippocampus data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stats Card */}
        <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-lg p-6 text-white shadow-xl border border-indigo-700">
          <div className="flex items-center space-x-3 mb-4">
            <Brain className="w-8 h-8 text-pink-400" />
            <h2 className="text-xl font-bold">Hippocampus Core</h2>
          </div>
          {memoryStats ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white/10 p-3 rounded">
                <span>Active Synapses (Keys)</span>
                <span className="font-mono text-xl text-green-400">{memoryStats.keys_count}</span>
              </div>
              <div className="flex justify-between items-center bg-white/10 p-3 rounded">
                <span>Used Memory</span>
                <span className="font-mono text-xl text-blue-400">{memoryStats.used_memory_human}</span>
              </div>
            </div>
          ) : (
            <div className="animate-pulse flex space-x-2">
              <div className="h-4 w-4 bg-white/20 rounded-full"></div>
              <div className="h-4 w-4 bg-white/20 rounded-full"></div>
            </div>
          )}
        </div>

        {/* Vault Status */}
        <div className="bg-gray-900 rounded-lg p-6 text-white shadow-xl border border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <HardDrive className="w-8 h-8 text-cyan-400" />
            <h2 className="text-xl font-bold">Storage Vaults</h2>
          </div>
          <div className="space-y-3">
            {vaultStatus.map((v) => (
              <div key={v.id} className="flex justify-between items-center bg-gray-800 p-3 rounded border border-gray-600">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${v.online ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="font-medium">{v.id}</span>
                </div>
                <span className="text-sm text-gray-400">{v.storage_status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Context Monitor */}
      <div className="bg-gray-800 rounded-lg p-6 shadow-xl border border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <Activity className="w-6 h-6 text-yellow-400" />
          <h2 className="text-xl font-bold text-white">Active Working Memory (Project Context)</h2>
        </div>
        {activeContext ? (
          <div className="space-y-6 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
            {activeContext.map((phase: any, idx: number) => (
              <div key={idx} className="bg-gray-900/60 p-6 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-xl text-indigo-300 tracking-tight">{phase.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${phase.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      phase.status === 'in-progress' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-gray-700/50 text-gray-400 border border-white/5'
                    }`}>{phase.status}</span>
                </div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {phase.items.map((item: any, i: number) => (
                    <li key={i} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg text-sm text-gray-300 border border-transparent hover:border-white/10 transition-colors">
                      <div className={`w-2 h-2 rounded-full ${item.status === 'completed' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' :
                          item.status === 'in-progress' ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'bg-gray-600'
                        }`} />
                      <span className={item.status === 'completed' ? 'line-through opacity-40 text-gray-500' : ''}>{item.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 italic p-4 text-center border border-dashed border-gray-600 rounded">
            No active context loaded in Synapse.
          </div>
        )}
      </div>
    </div>
  );
};

export default HippocampusPanel;
