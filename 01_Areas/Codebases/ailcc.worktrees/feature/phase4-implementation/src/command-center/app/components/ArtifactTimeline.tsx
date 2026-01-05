'use client';

import React, { useEffect, useState } from 'react';
import { Terminal, Calendar, Activity, ChevronRight } from 'lucide-react';

interface ChronicleEvent {
  title: string;
  date: string;
  description: string;
}

export default function ArtifactTimeline() {
  const [events, setEvents] = useState<ChronicleEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/chronicle.md')
      .then((res) => res.text())
      .then((text) => {
        const parsedEvents: ChronicleEvent[] = [];
        const cycles = text.split('## Cycle');
        cycles.shift(); // Remove intro

        cycles.forEach((cycle) => {
          const lines = cycle.trim().split('\n');
          const titleLine = lines[0]; // e.g. "1: The Awakening..."
          // Extract title (everything after colon or just the text)
          const title = "Cycle " + titleLine.trim();
          
          let date = "Unknown Date";
          let description = "";

          // Simple parsing loop
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
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load chronicle", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-cyan-900 animate-pulse">Loading History...</div>;

  return (
    <div className="border border-cyan-900/30 bg-slate-900/50 rounded-lg p-4">
      <h2 className="text-lg font-bold text-cyan-100 mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-cyan-400" />
        CHRONICLE_LOG
      </h2>
      <div className="space-y-4">
        {events.map((event, idx) => (
          <div key={idx} className="relative pl-6 border-l border-cyan-900/50">
            <div className="absolute -left-[5px] top-0 w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
            <div className="mb-1 text-xs text-cyan-500 font-mono flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                {event.date}
            </div>
            <h3 className="text-cyan-200 font-bold text-sm mb-1">{event.title}</h3>
            <p className="text-cyan-400/70 text-xs leading-relaxed font-mono">
              {event.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
