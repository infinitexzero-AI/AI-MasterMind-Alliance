"use client";

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNeuralSync } from '../../../components/NeuralSyncProvider';

export const HealthMetrics: React.FC = () => {
  const { telemetry } = useNeuralSync();
  const [bioState, setBioState] = useState<{ sleep_hours: number, hrv_ms: number, readiness_score: number } | null>(null);

  useEffect(() => {
    // If telemetry sends a BIOLOGICAL_STATE signal, capture it
    if (telemetry.type === 'BIOLOGICAL_STATE' && telemetry.metadata) {
       setBioState(telemetry.metadata);
    }
  }, [telemetry]);

  useEffect(() => {
    // Mock initial data if no live signal yet to show the new UI layout
    if (!bioState) {
        setBioState({
            sleep_hours: 7.2,
            hrv_ms: 45,
            readiness_score: 82
        });
    }
  }, [bioState]);

  return (
    <div className="glass-card p-6 h-[250px] relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors" />
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <h3 className="text-lg font-bold text-white tracking-widest uppercase flex items-center gap-2">
            Biological State
        </h3>
        <div className="flex items-center gap-2 px-2 py-1 bg-slate-900 border border-emerald-500/30 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-[pulse_2s_ease-in-out_infinite]" />
          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">Live Sync</span>
        </div>
      </div>

      {bioState && (
          <div className="grid grid-cols-3 gap-4 relative z-10">
              <div className="col-span-1 flex flex-col items-center justify-center p-4 bg-black/40 border border-white/5 rounded-2xl shadow-inner">
                  <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-2">Readiness</span>
                  <div className={`text-4xl font-black ${bioState.readiness_score > 80 ? 'text-emerald-400' : bioState.readiness_score > 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {bioState.readiness_score}<span className="text-lg text-slate-500">%</span>
                  </div>
              </div>

              <div className="col-span-2 flex flex-col gap-3">
                  <div className="flex items-center justify-between p-3 bg-black/30 border border-white/5 rounded-xl">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Sleep Duration</span>
                      <span className="text-sm font-bold text-white">{bioState.sleep_hours.toFixed(1)} hrs</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-black/30 border border-white/5 rounded-xl">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">HRV Baseline</span>
                      <span className="text-sm font-bold text-white">{bioState.hrv_ms.toFixed(0)} ms</span>
                  </div>
              </div>
          </div>
      )}

      <div className="absolute bottom-4 left-6 right-6 flex justify-between items-center pt-4 border-t border-white/5">
        <span className="text-[9px] text-slate-600 font-mono uppercase tracking-widest">Source: Apple Health / iCloud</span>
        <span className="text-[9px] text-emerald-500/50 font-mono uppercase tracking-widest">Connected</span>
      </div>
    </div>
  );
};
