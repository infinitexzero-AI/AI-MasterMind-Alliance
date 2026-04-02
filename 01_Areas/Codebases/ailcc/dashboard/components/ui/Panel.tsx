import React from 'react';

export const Panel: React.FC<{ 
  children: React.ReactNode, 
  title?: string, 
  icon?: React.ReactNode, 
  className?: string, 
  headerAction?: React.ReactNode
}> = ({ children, title, icon, className = '', headerAction }) => (
  <div className={`bg-slate-900/50 rounded-xl border border-slate-700/50 shadow-sm flex flex-col overflow-hidden ${className}`}>
    {(title || icon || headerAction) && (
      <div className="flex items-center justify-between text-slate-400 border-b border-slate-700/50 p-4 bg-slate-950/30">
        <div className="flex items-center gap-2">
          {icon}
          {title && <h2 className="text-xs font-mono tracking-[0.2em] uppercase font-bold text-slate-300">{title}</h2>}
        </div>
        {headerAction}
      </div>
    )}
    <div className="flex-1 overflow-auto custom-scrollbar p-6 relative">
      {children}
    </div>
  </div>
);
