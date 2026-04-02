import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const hexChars = '0123456789ABCDEF';
const scholarStrings = [
  'DOI: 10.1038/s41398',
  'REB: 2025-080',
  'HDC: LIVING_WAGE',
  'SDoH: RURAL_NB',
  'rTMS: CLINICAL_V2',
  'PLOS_ONE: 0304620',
  'MCGILL: MICROGLIA',
  'JMIR: TELEHEALTH'
];

export const DataStream = () => {
  const [lines, setLines] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      const isScholar = Math.random() > 0.7;
      const newLine = isScholar
        ? scholarStrings[Math.floor(Math.random() * scholarStrings.length)] + ' // ' + Array(4).fill(0).map(() => hexChars[Math.floor(Math.random() * 16)]).join('')
        : Array(8).fill(0).map(() =>
          '0x' + Array(4).fill(0).map(() => hexChars[Math.floor(Math.random() * 16)]).join('')
        ).join(' ');

      setLines(prev => [newLine, ...prev.slice(0, 20)]);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="font-mono text-[10px] text-cyan-900 overflow-hidden h-full flex flex-col justify-end opacity-50 relative pointer-events-none">
      {lines.map((line, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1 - (i * 0.05), x: 0 }}
          className="whitespace-nowrap"
        >
          <span className="text-cyan-600 mr-2">[{mounted ? new Date().toISOString().split('T')[1].split('.')[0] : '--:--:--'}]</span>
          {line}
        </motion.div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
    </div>
  );
};
