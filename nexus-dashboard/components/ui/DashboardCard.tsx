import React, { ReactNode } from 'react';
// Actually, let's keep it simple and dependency-free for now to avoid errors if utils missing.

interface DashboardCardProps {
    title: string | ReactNode;
    subtitle?: string;
    children: ReactNode;
    className?: string;
    headerAction?: ReactNode;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
    title,
    subtitle,
    children,
    className = "",
    headerAction
}) => {
    return (
        <div className={`
      glass-card
      flex flex-col
      ${className}
    `}>
            {/* Glass Gloss Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="relative p-4 border-b border-white/5 bg-white/5 flex justify-between items-start z-10">
                <div>
                    <h3 className="text-sm font-bold text-cyan-400 font-mono tracking-wider uppercase drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">
                        {title}
                    </h3>
                    {subtitle && (
                        <p className="text-[10px] text-slate-400 mt-1">{subtitle}</p>
                    )}
                </div>
                {headerAction && (
                    <div>{headerAction}</div>
                )}
            </div>

            {/* Content */}
            <div className="relative p-4 flex-1 z-10 overflow-auto">
                {children}
            </div>
        </div>
    );
};
