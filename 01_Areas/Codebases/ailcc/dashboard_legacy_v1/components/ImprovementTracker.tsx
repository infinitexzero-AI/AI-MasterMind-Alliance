import React from 'react';

export default function ImprovementTracker() {
  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-xl shadow-lg text-white h-full relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
       
      <header className="mb-6 relative z-10">
        <h2 className="text-xl font-bold">1% Better</h2>
        <p className="text-indigo-100 text-sm">Compound Growth Tracker</p>
      </header>
      
      <div className="grid grid-cols-2 gap-4 relative z-10">
          <Stat label="Daily Gain" value="+1.2%" />
          <Stat label="Streak" value="12 Days" />
          <Stat label="Vectors" value="4.2k" />
          <Stat label="Efficiency" value="94%" />
      </div>

      <div className="mt-6 pt-4 border-t border-white/20 relative z-10">
          <p className="text-xs text-indigo-100 italic">
              "Consistency is the key to achieving the impossible."
          </p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string, value: string }) {
    return (
        <div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs text-indigo-200 uppercase tracking-widest">{label}</div>
        </div>
    )
}
