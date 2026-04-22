import React from 'react';
import Head from 'next/head';
import NexusLayout from '../components/NexusLayout';
import { Panel } from '../components/ui/Panel';
import { DataGrid } from '../components/ui/DataGrid';
import { StatusPill } from '../components/ui/StatusPill';
import { Activity, RadioReceiver } from 'lucide-react';
import { useAuth } from '../src/contexts/AuthContext';
import { NeuralSignalSchema } from '../types/api';

import { useSwarmTelemetry } from '../hooks/useSwarmTelemetry';

export default function Observer() {
  const { hasAccess } = useAuth();
  const { signals: liveSignals, isConnected } = useSwarmTelemetry();

  if (!hasAccess('observer')) return null;

  return (
    <NexusLayout>
      <Head>
        <title>Observer | Global Stream</title>
      </Head>
      
      <div className="w-full flex flex-col gap-6 max-w-7xl mx-auto p-4 lg:p-6 h-[calc(100vh-4rem)]">
        {/* Header Ribbon */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tighter text-white flex items-center gap-3">
                    <Activity className="w-8 h-8 text-amber-500" /> Observer Domain
                </h1>
                <p className="font-mono text-[10px] text-slate-400 tracking-widest uppercase mt-1">
                    Universal Telemetry & Event Stream
                </p>
            </div>
            
            <div className="flex items-center gap-3 bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
               <StatusPill status={isConnected ? 'online' : 'offline'} label={isConnected ? 'STREAM ACTIVE' : 'STREAM OFFLINE'} />
            </div>
        </div>

        {/* Global Event Grid */}
        <Panel title="Global Neural Bus Array" icon={<RadioReceiver className="w-4 h-4 text-amber-400" />} className="flex-1 min-h-0">
            <DataGrid 
                data={liveSignals}
                keyExtractor={s => String(s.signal_id)}
                columns={[
                    { header: 'Time', key: 'timestamp', render: s => <span className="font-mono text-xs text-slate-400">{new Date(s.timestamp!).toLocaleTimeString()}</span> },
                    { header: 'Source', key: 'source', render: s => <span className="font-mono text-[10px] text-amber-400 font-bold tracking-widest">{s.source}</span> },
                    { header: 'Severity', key: 'severity', render: s => <StatusPill status={s.severity === 'CRITICAL' ? 'failed' : s.severity === 'ROUTINE' ? 'online' : 'idle'} label={String(s.severity)} /> },
                    { header: 'Payload', key: 'payload', render: s => <span className="font-mono text-xs text-slate-300">{s.message || s.metadata?.event}</span> }
                ]}
            />
        </Panel>
      </div>
    </NexusLayout>
  );
}
