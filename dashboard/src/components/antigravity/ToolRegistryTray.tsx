import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Database, Globe, Cpu } from 'lucide-react';

export interface ActiveTool {
  id: string;
  name: string;
  agentId: string;
  args: string;
  timestamp: number;
}

interface ToolRegistryTrayProps {
  activeTools: ActiveTool[];
}

const TOOL_ICONS: Record<string, React.ReactNode> = {
  'Terminal': <Terminal size={14} />,
  'Database': <Database size={14} />,
  'WebSearch': <Globe size={14} />,
  'Cortex': <Cpu size={14} />,
};

export const ToolRegistryTray: React.FC<ToolRegistryTrayProps> = ({ activeTools }) => {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-40">
      <div className="flex justify-center gap-2">
        <AnimatePresence>
          {activeTools.map((tool) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              className="bg-black/60 backdrop-blur-md border border-white/10 rounded-lg px-3 py-2 flex items-center gap-2 shadow-lg"
            >
              <div className="text-emerald-400">
                {TOOL_ICONS[tool.name] || <Terminal size={14} />}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                  {tool.name}
                </span>
                <span className="text-[9px] text-white/50 font-mono max-w-[150px] truncate">
                   {tool.args}
                </span>
              </div>
              <div className="h-4 w-px bg-white/10 mx-1" />
              <span className="text-[9px] text-blue-300 font-bold">
                 {tool.agentId}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
