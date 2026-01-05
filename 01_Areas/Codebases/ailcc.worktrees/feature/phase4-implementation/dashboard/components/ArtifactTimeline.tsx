import React, { useEffect, useState } from 'react';
import { Calendar, Activity } from 'lucide-react';
import { ChronicleEvent } from '../types/ui';

export default function ArtifactTimeline() {
  const [events, setEvents] = useState<ChronicleEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try fetch, default to empty if not found
    fetch('/chronicle.md')
      .then((res) => {
          if(!res.ok) throw new Error("Chronicle not found");
          return res.text();
      })
      .then((text) => {
        const parsedEvents: ChronicleEvent[] = [];
        const cycles = text.split('## Cycle');
        cycles.shift(); 

        cycles.forEach((cycle) => {
          const lines = cycle.trim().split('\n');
          const title = "Cycle " + lines[0].trim();
          let date = "Unknown Date";
          let description = "";

          for (let i = 1; i < lines.length; i++) {
            if (lines[i].includes('*Date:')) {
                date = lines[i].replace('*Date:', '').replace('*', '').trim();
            } else if (lines[i].trim() && !lines[i].startsWith('#') && !lines[i].startsWith('*')) {
                description += lines[i] + " ";
            }
          }
          parsedEvents.push({ title, date, description: description.slice(0, 150) + "..." });
        });
        setEvents(parsedEvents);
      })
      .catch(err => {
        console.warn("Chronicle load failed, showing placeholder", err);
        // Placeholder data for visual verification if file missing
        setEvents([
            { title: "Cycle 1: Genesis", date: "2024-10-01", description: "System initialization sequence started." }
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
      <div className="glass-panel p-4 flex items-center justify-center text-xs font-mono text-cyan-500 animate-pulse">
          LOADING HISTORY...
      </div>
  );

  return (
    <div className="glass-panel p-6">
      <h3 className="panel-header mb-6">
        <Activity className="w-4 h-4 text-cyan-400" />
        CHRONICLE_LOG
      </h3>
      <div className="space-y-6 pl-2">
        {events.map((event, idx) => (
          <div key={idx} className="relative pl-6 border-l border-cyan-500/20">
            <div className={`absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full border border-slate-900 shadow-[0_0_10px_currentColor] ${idx === 0 ? 'bg-cyan-400 text-cyan-400' : 'bg-slate-600 text-slate-600'}`} />
            
            <div className="mb-1 text-[10px] text-cyan-500/70 font-mono uppercase flex items-center gap-2 tracking-wider">
                <Calendar className="w-3 h-3" />
                {event.date}
            </div>
            
            <h4 className="text-slate-200 font-bold text-sm mb-2">{event.title}</h4>
            <p className="text-slate-400 text-xs leading-relaxed font-mono opacity-80">
              {event.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
