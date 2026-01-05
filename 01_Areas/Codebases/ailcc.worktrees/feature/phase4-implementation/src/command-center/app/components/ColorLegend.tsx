'use client';

import React from 'react';

export default function ColorLegend() {
  return (
    <div className="flex items-center gap-4 text-[10px] font-mono border border-slate-800 bg-slate-950/80 px-3 py-1.5 rounded-full backdrop-blur-sm">
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="text-emerald-400">AGENT_ACTIVE</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
        <span className="text-amber-400">USER_ACTION</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-cyan-500/50"></span>
        <span className="text-cyan-400/70">SYSTEM_IDLE</span>
      </div>
    </div>
  );
}
