import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import NexusLayout from '../components/NexusLayout';
import { BookOpen, Search, ShieldAlert, FileText, FileJson, FileCode, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../src/contexts/AuthContext';
import { useSwarmTelemetry } from '../hooks/useSwarmTelemetry';

interface VaultFile {
  id: string;
  title: string;
  type: string;
  size: number;
  updatedAt: string;
  status: string;
}

export default function IntelligenceVault() {
  const { hasAccess } = useAuth();
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { isConnected } = useSwarmTelemetry();

  const fetchVault = async () => {
      try {
          const res = await fetch('http://localhost:5005/api/system/vault');
          if (res.ok) {
              const data = await res.json();
              setFiles(data);
          }
      } catch (err) {
          console.error("Failed to hydrate vault", err);
      }
  };

  useEffect(() => {
     fetchVault();
     // Fast polling as fallback, but rely on telemetry for instant updates
     const interval = setInterval(fetchVault, 5000);
     return () => clearInterval(interval);
  }, []);

  const filteredFiles = files.filter(f => f.title.toLowerCase().includes(searchQuery.toLowerCase()) || f.type.toLowerCase().includes(searchQuery.toLowerCase()));

  const getFileIcon = (type: string) => {
      switch(type.toLowerCase()) {
          case 'json': return <FileJson className="w-8 h-8 text-yellow-500 group-hover:scale-110 transition-transform" />;
          case 'md': case 'txt': return <FileText className="w-8 h-8 text-emerald-400 group-hover:scale-110 transition-transform" />;
          default: return <FileCode className="w-8 h-8 text-indigo-400 group-hover:scale-110 transition-transform" />;
      }
  };

  if (!hasAccess('vault')) {
      return (
          <NexusLayout>
              <div className="flex h-full items-center justify-center p-20">
                  <div className="text-center space-y-4">
                      <ShieldAlert className="w-16 h-16 text-red-500 mx-auto opacity-50 mb-2" />
                      <h1 className="text-xl font-bold tracking-widest text-red-400 uppercase">Clearance Denied</h1>
                      <p className="font-mono text-slate-500 text-xs uppercase tracking-widest">You lack clearance for the Intelligence Vault.</p>
                  </div>
              </div>
          </NexusLayout>
      );
  }

  return (
    <NexusLayout>
      <Head>
        <title>Intelligence Vault | AILCC</title>
      </Head>
      
      <div className="w-full flex flex-col gap-8 max-w-[90rem] mx-auto p-4 lg:p-8 min-h-[calc(100vh-4rem)]">
        {/* Header Ribbon */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-emerald-500/10 border-2 border-emerald-500/50 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                    <BookOpen className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-white bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500">
                        Intelligence Vault
                    </h1>
                    <p className="font-mono text-[10px] text-emerald-400/80 tracking-[0.2em] uppercase mt-2">
                        Live Data Ingress // Sovereign Document Index
                    </p>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
               {isConnected ? (
                   <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center gap-2">
                       <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                       <span className="font-mono text-[9px] text-emerald-400 tracking-widest uppercase">Sync Active</span>
                   </div>
               ) : (
                   <div className="px-3 py-1 bg-rose-500/10 border border-rose-500/30 rounded-full flex items-center gap-2 animate-pulse">
                       <ShieldAlert className="w-3 h-3 text-rose-400" />
                       <span className="font-mono text-[9px] text-rose-400 tracking-widest uppercase">Link Offline</span>
                   </div>
               )}
               <div className="relative group">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/50 group-focus-within:text-emerald-400 transition-colors" />
                   <input 
                      type="text" 
                      placeholder="Query Neural DB..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-slate-900/50 border border-slate-700/50 focus:border-emerald-500/50 rounded-xl py-3 pl-10 pr-4 text-sm font-mono text-white focus:outline-none w-64 lg:w-80 transition-all shadow-inner placeholder:text-slate-600" 
                   />
               </div>
            </div>
        </div>

        {/* Dynamic Grid Layout */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 auto-rows-max">
            {filteredFiles.map((file) => (
                <div key={file.id} className="group relative bg-[#070b14] border border-slate-700/50 hover:border-emerald-500/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_10px_40px_rgba(16,185,129,0.1)] hover:-translate-y-1 overflow-hidden cursor-pointer flex flex-col gap-4">
                    {/* Glassmorphic Background Shine */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-cyan-500/10 transition-colors" />
                    
                    <div className="flex items-start justify-between z-10">
                        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 shadow-inner">
                            {getFileIcon(file.type)}
                        </div>
                        <span className="font-mono text-[9px] uppercase tracking-widest bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20">
                            {file.type}
                        </span>
                    </div>
                    
                    <div className="z-10 mt-2">
                        <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2 leading-tight">
                            {file.title.replace(/[-_]/g, ' ')}
                        </h3>
                    </div>

                    <div className="mt-auto pt-4 border-t border-slate-800/50 flex items-center justify-between z-10">
                        <span className="font-mono text-[10px] text-slate-500 tracking-wider">
                            {(file.size / 1024).toFixed(1)} KB
                        </span>
                        <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500">
                            {new Date(file.updatedAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            ))}

            {filteredFiles.length === 0 && (
                <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-40">
                    <Search className="w-16 h-16 text-slate-500 mb-4" />
                    <p className="font-mono text-sm tracking-widest uppercase text-slate-400">No telemetry matches found</p>
                </div>
            )}
        </div>
      </div>
    </NexusLayout>
  );
}
