"use client";

import React from 'react';
import { FileText, Clock, ExternalLink, ShieldAlert } from 'lucide-react';
import { useLiteratureReviews } from '../../hooks/useLiteratureReviews';

export default function SynthesisWidget() {
  const { data, status, error } = useLiteratureReviews();

  if (status === 'pending') {
    return (
      <div className="w-full h-48 bg-[#0A0A0A]/50 border border-gray-800 rounded-xl flex items-center justify-center animate-pulse">
        <span className="text-gray-500 font-mono text-sm">LOADING SYNTHESIS ARRAYS...</span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="w-full h-48 bg-[#0A0A0A]/80 border border-red-900/50 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm p-4 flex flex-col items-center justify-center">
        <ShieldAlert className="w-8 h-8 text-red-500 mx-auto mb-2 opacity-50" />
        <p className="text-red-400 font-mono text-xs uppercase tracking-widest">
          Degraded &middot; Code: {error?.code || 'FETCH_FAILED'}
        </p>
        <p className="text-gray-500 font-mono text-[10px] mt-2">{error?.message || 'Synthesis Engine offline.'}</p>
      </div>
    );
  }

  const reviews = data?.reviews || [];

  return (
    <div className="w-full bg-[#0A0A0A]/80 border border-gray-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm">
      <div className="p-4 border-b border-gray-800/60 bg-gradient-to-r from-[#0d1117] to-[#0A0A0A] flex justify-between items-center">
        <h3 className="text-emerald-400 font-bold tracking-wider text-sm flex items-center gap-2 drop-shadow-lg">
          <FileText className="w-4 h-4 text-emerald-500" />
          MASTERMIND LITERATURE SYNTHESIS
        </h3>
        <span className="text-xs font-mono text-gray-500 bg-gray-900/50 px-2 py-1 rounded-md border border-gray-800">
          {reviews.length} DRAFTS DETECTED
        </span>
      </div>

      <div className="p-4 space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
        {reviews.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 font-mono text-xs">No Automated Academic Drafts located within the Hippocampus.</p>
            <p className="text-gray-600 font-mono text-[10px] mt-1">Execute: python3 automations/integrations/scholar_academic_writer.py</p>
          </div>
        ) : (
          reviews.map((node, idx) => (
            <div key={idx} className="group relative p-3 rounded-lg border border-gray-800 bg-[#0d1117] hover:bg-[#161b22] transition-colors cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-gray-200 font-semibold text-sm drop-shadow-md pr-4">{node.title}</h4>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink className="w-4 h-4 text-gray-400 hover:text-white" />
                </div>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 italic border-l-2 border-emerald-500/30 pl-2">
                "{node.snippet}"
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Clock className="w-3 h-3 text-gray-500" />
                <span className="text-[10px] font-mono text-gray-500 uppercase">
                  {new Date(node.date).toLocaleString()}
                </span>
                <span className="text-[10px] font-mono text-indigo-400 ml-auto bg-indigo-900/20 px-1.5 rounded">
                  {node.filename}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
