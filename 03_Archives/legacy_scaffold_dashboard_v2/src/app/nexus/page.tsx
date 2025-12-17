import NexusLayout from '@/components/layout/NexusLayout';
import Link from 'next/link';

export default function NexusPage() {
    return (
        <NexusLayout>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Antigravity Forge Access Card */}
                <Link href="/nexus/forge" className="group">
                    <div className="glass-card p-8 h-64 flex flex-col justify-between hover:bg-white/5 transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-30 group-hover:opacity-100 transition-opacity">
                            <div className="w-16 h-16 rounded-full bg-cyan-500/20 blur-xl animate-pulse"></div>
                        </div>
                        <div>
                            <h2 className="text-3xl font-display font-bold text-white mb-2">FORGE</h2>
                            <p className="text-slate-400">Antigravity Agent Orchestration Interface</p>
                        </div>
                        <div className="flex items-center text-cyan-400 group-hover:translate-x-2 transition-transform">
                            <span className="mr-2">ACCESS SYSTEM</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                        </div>
                    </div>
                </Link>

                {/* Placeholder for other modules */}
                <div className="glass-card p-8 h-64 flex flex-col justify-between opacity-50 cursor-not-allowed">
                    <div>
                        <h2 className="text-3xl font-display font-bold text-slate-500 mb-2">SCHOLAR</h2>
                        <p className="text-slate-600">Locked: Awaiting Protocol v2</p>
                    </div>
                    <div className="flex items-center text-slate-600">
                        <span className="mr-2">OFFLINE</span>
                    </div>
                </div>
            </div>
        </NexusLayout>
    );
}
