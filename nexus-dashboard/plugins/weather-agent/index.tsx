import React from 'react';
import { Cloud, Wind, Thermometer, MapPin } from 'lucide-react';
import { pluginRegistry, NexusPlugin } from '../../lib/plugin-registry';

const WeatherSidebarWidget: React.FC = () => (
    <div className="p-2 rounded-lg bg-white/5 border border-white/5 flex flex-col items-center justify-center gap-1 group hover:border-cyan-500/30 transition-all">
        <Cloud className="w-4 h-4 text-cyan-400" />
        <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-300">18°C</span>
    </div>
);

const WeatherActionIcon = () => <Cloud className="w-4 h-4" />;

export const WeatherPlugin: NexusPlugin = {
    metadata: {
        id: 'weather-agent-01',
        name: 'Nexus Weather Agent',
        version: '1.0.0',
        author: 'Vanguard Swarm',
        description: 'Atmospheric intelligence for the Nexus platform.',
        icon: 'Cloud'
    },
    enabled: true,
    slots: {
        sidebar: WeatherSidebarWidget
    },
    actions: [
        {
            id: 'weather_fetch_local',
            label: 'Fetch Atmospheric Intel',
            category: 'ENV',
            icon: WeatherActionIcon,
            perform: (ctx: any) => {
                console.log("Fetching weather for local coordinates...");
            }
        }
    ]
};

// Auto-register on load
if (typeof window !== 'undefined') {
    pluginRegistry.register(WeatherPlugin);
}
