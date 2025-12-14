import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top', delay = 0.2 }) => {
  const [isVisible, setIsVisible] = useState(false);
  let timeoutId: NodeJS.Timeout;

  const show = () => {
    timeoutId = setTimeout(() => setIsVisible(true), delay * 1000);
  };

  const hide = () => {
    clearTimeout(timeoutId);
    setIsVisible(false);
  };

  // Positioning logic
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative flex items-center justify-center" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: position === 'top' ? 10 : 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className={`absolute ${positionClasses[position]} z-50 w-max max-w-xs`}
          >
            <div className="px-3 py-2 bg-slate-900/90 border border-cyan-500/30 rounded-lg shadow-xl backdrop-blur-md text-xs text-slate-200">
              {content}
              {/* Optional: Add a tiny arrow if needed, but keeping it clean for now */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip;
