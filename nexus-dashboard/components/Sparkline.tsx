import React from 'react';

interface SparklineProps {
    data: number[];
    width?: number;
    height?: number;
    color?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({ 
    data, 
    width = 40, 
    height = 10, 
    color = "#22d3ee" 
}) => {
    if (!data || data.length < 2) return <div style={{ width, height }} />;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={width} height={height} className="overflow-visible">
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
                className="opacity-50 group-hover:opacity-100 transition-opacity"
            />
        </svg>
    );
};
