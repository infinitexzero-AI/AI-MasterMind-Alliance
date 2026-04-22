import React from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import NexusLayout from '../components/NexusLayout';
import TacticsHUD from '../components/TacticsHUD';
import FleetHangar from '../components/FleetHangar';
import DependencyChain from '../components/DependencyChain';
import WarRoom from '../components/WarRoom';
import { NexusAgentRegistry } from '../components/NexusUAP';
import { TaskLogViewer } from '../components/TaskLogViewer';
import SelfHealingCards from '../components/SelfHealingCards';
import SystemComparison from '../components/SystemComparison';

// Lazy load heavy visualization components
const CortexMap = dynamic(() => import('../components/CortexMap'), {
    loading: () => <div className="h-[800px] w-full bg-slate-900/50 animate-pulse rounded-xl flex items-center justify-center text-slate-400">Loading Cortex Map...</div>,
    ssr: false
});

const SynapseNetwork = dynamic(() => import('../components/SynapseNetwork'), {
    loading: () => <div className="h-96 w-full bg-slate-900/50 animate-pulse rounded-xl flex items-center justify-center text-slate-400">Loading Neural Mesh...</div>,
    ssr: false
});

const DataMaterialization = dynamic(() => import('../components/DataMaterialization'), {
    loading: () => <div className="h-96 w-full bg-slate-900/50 animate-pulse rounded-xl flex items-center justify-center text-slate-400">Loading Data Grid...</div>,
    ssr: false
});

const DependencyMap = dynamic(() => import('../components/DependencyMap'), {
    loading: () => <div className="h-[600px] w-full bg-slate-900/50 animate-pulse rounded-xl flex items-center justify-center text-slate-400">Loading Code Dependency Graph...</div>,
    ssr: false
});


export default function NexusPage() {
    return (
        <NexusLayout>
            <Head>
                <title>Nexus | Command Center</title>
            </Head>
            <div className="flex flex-col gap-8 pb-20">
                {/* Tactical HUD - Top Overlay */}
                <section className="w-full">
                    <TacticsHUD />
                </section>

                {/* Main Cortex System Map */}
                <section className="h-[800px] w-full relative rounded-xl overflow-hidden border border-slate-700/50 shadow-2xl">
                    <CortexMap />
                </section>

                {/* Strategic War Room */}
                <section className="w-full">
                    {/* New 3-Column Grid Layout for UAP Integration */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Existing War Room takes 2/3 width */}
                        <div className="lg:col-span-2">
                            <WarRoom />
                        </div>

                        {/* New UAP Sidebar takes 1/3 width */}
                        <div className="space-y-6">
                            <TaskLogViewer title="Protocol Stream (LIVE)" />
                            <NexusAgentRegistry />
                        </div>
                    </div>
                </section>

                {/* System Analysis - Comparison */}
                <section className="w-full">
                    <SystemComparison />
                </section>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Agent Fleet Hangar */}
                    <section className="w-full">
                        <h2 className="text-2xl font-bold text-white mb-4 pl-4 border-l-4 border-green-500">Fleet Hangar</h2>
                        <FleetHangar />
                    </section>

                    {/* Dependency Chain & Blockers */}
                    <section className="w-full">
                        <h2 className="text-2xl font-bold text-white mb-4 pl-4 border-l-4 border-red-500">Critical Dependencies</h2>
                        <DependencyChain />
                    </section>
                </div>

                {/* Specialized Systems - Row 1 */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <section className="w-full">
                        <h2 className="text-2xl font-bold text-white mb-4 pl-4 border-l-4 border-purple-500">Synapse Neural Mesh</h2>
                        <SynapseNetwork />
                    </section>
                    <section className="w-full">
                        <h2 className="text-2xl font-bold text-white mb-4 pl-4 border-l-4 border-orange-500">Self-Healing Infrastructure</h2>
                        <SelfHealingCards />
                    </section>
                </div>

                {/* Code Dependency Analysis - NEW Phase 10 */}
                <section className="w-full">
                    <h2 className="text-2xl font-bold text-white mb-4 pl-4 border-l-4 border-cyan-400">Code Architecture & Dependency Graph</h2>
                    <DependencyMap />
                </section>

                {/* Specialized Systems - Row 2 */}
                <section className="w-full">
                    <h2 className="text-2xl font-bold text-white mb-4 pl-4 border-l-4 border-cyan-500">Hippocampus Data Grid</h2>
                    <DataMaterialization />
                </section>
            </div>
        </NexusLayout>
    );
}
