import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export interface GoalBubbleProps {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  owner: string; // Agent name
  status: 'pending' | 'active' | 'completed' | 'blocked';
  x?: number;
  y?: number;
  onDragEnd?: (id: string, x: number, y: number) => void;
  onClick?: () => void;
}

const PRIORITY_SIZES = {
  high: 120, // px
  medium: 90,
  low: 70,
};

const AGENT_COLORS: Record<string, string> = {
  'Orchestrator': 'bg-blue-500/20 border-blue-400',
  'Researcher': 'bg-emerald-500/20 border-emerald-400',
  'Writer': 'bg-purple-500/20 border-purple-400',
  'Reviewer': 'bg-amber-500/20 border-amber-400',
  'default': 'bg-gray-500/20 border-gray-400',
};

export const GoalBubble: React.FC<GoalBubbleProps> = ({
  id,
  title,
  priority,
  owner,
  status,
  x = 0,
  y = 0,
  onDragEnd,
  onClick
}) => {
  const size = PRIORITY_SIZES[priority] || PRIORITY_SIZES.medium;
  const colorClass = AGENT_COLORS[owner] || AGENT_COLORS.default;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ x, y, scale: 0 }}
      animate={{ 
        x, 
        y: [y, y + (Math.random() * 10 - 5)], // Subtle float offset
        scale: 1,
        boxShadow: isHovered 
          ? '0 0 20px rgba(255,255,255,0.3), inset 0 0 10px rgba(255,255,255,0.1)' 
          : '0 0 10px rgba(0,0,0,0.2), inset 0 0 0px rgba(0,0,0,0)'
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onDragEnd={(_, info) => onDragEnd?.(id, info.point.x, info.point.y)}
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`absolute rounded-full backdrop-blur-md border-2 
                 flex flex-col items-center justify-center p-2 text-center cursor-pointer 
                 select-none transition-colors duration-300 ${colorClass}`}
      style={{
        width: size,
        height: size,
        zIndex: isHovered ? 50 : 10,
      }}
    >
      <span className="text-xs font-bold text-white/90 drop-shadow-md line-clamp-2">
        {title}
      </span>
      {isHovered && (
        <span className="absolute -bottom-6 text-[10px] bg-black/60 px-2 py-1 rounded text-white">
          {owner}
        </span>
      )}
      
      {/* Pulse effect for active status */}
      {status === 'active' && (
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full border border-white/50"
        />
      )}
    </motion.div>
  );
};
