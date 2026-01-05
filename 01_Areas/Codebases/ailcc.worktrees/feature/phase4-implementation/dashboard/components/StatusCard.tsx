import React from 'react';

type Props = {
  title: string;
  value: string | number;
  subtitle?: string;
};

export default function StatusCard({ title, value, subtitle }: Props) {
  return (
    <div className="glass-panel p-4 flex flex-col justify-center">
      <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">{title}</div>
      <div className="text-2xl font-bold text-slate-100">{value}</div>
      {subtitle && <div className="text-[10px] text-cyan-400 font-mono mt-1">{subtitle}</div>}
    </div>
  );
}
