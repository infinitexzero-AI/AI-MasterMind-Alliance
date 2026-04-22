import React from 'react';

export const Card: React.FC<{
  children: React.ReactNode,
  className?: string,
  padding?: 'none' | 'sm' | 'md' | 'lg',
  border?: boolean,
  hover?: boolean,
  onClick?: () => void
}> = ({ children, className = '', padding = 'md', border = true, hover = false, onClick }) => {
  const paddings = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div 
      onClick={onClick}
      className={`
      bg-slate-900/40 rounded-xl
      ${border ? 'border border-slate-700/50 shadow-sm' : ''}
      ${hover ? 'transition-all hover:bg-slate-800/40 hover:border-cyan-500/30 hover:shadow-[0_0_15px_rgba(6,182,212,0.1)] cursor-pointer' : ''}
      ${paddings[padding]}
      ${className}
    `}>
      {children}
    </div>
  );
};
