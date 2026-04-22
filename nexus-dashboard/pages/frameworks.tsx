import Head from 'next/head';
import NexusLayout from '../components/NexusLayout';
import { ElementTable } from '../components/ElementTable';
import { BookOpen, Share2 } from 'lucide-react';

export default function FrameworksPage() {
    return (
        <NexusLayout>
            <Head>
                <title>Frameworks | Antigravity AI</title>
            </Head>

            <div className="max-w-7xl mx-auto p-6 md:p-12">
                <header className="mb-12">
                    <h1 className="text-4xl font-bold text-slate-100 mb-4">Element Framework</h1>
                    <p className="text-slate-400 max-w-2xl text-lg mb-6">
                        The foundational principles governing Swarm Intelligence and Agent behavior within the Alliance.
                        All tasks delegated via Comet must adhere to these elements.
                    </p>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg border border-white/5 text-sm text-cyan-400">
                            <BookOpen className="w-4 h-4" /> v1.0 Active
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg border border-white/5 text-sm text-purple-400">
                            <Share2 className="w-4 h-4" /> Netukulimk Aligned
                        </div>
                    </div>
                </header>

                <section className="mb-16">
                    <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center">
                        <span className="w-2 h-8 bg-cyan-500 rounded-full mr-3"></span>
                        Core Elements
                    </h2>
                    <ElementTable />
                </section>

                <section className="renaissance-panel p-8">
                    <h3 className="text-lg font-bold text-slate-100 mb-4">Integration Guidelines</h3>
                    <div className="prose prose-invert prose-sm max-w-none">
                        <p>
                            When constructing <code>AllianceTask</code> payloads, the <code>elements</code> array should reference the
                            keys defined above. This allows the Swarm Orchestrator (Comet) to inject specific
                            system prompts or validation steps corresponding to the applied elements.
                        </p>
                        <ul className="list-disc pl-5 mt-4 text-slate-400 space-y-2">
                            <li><strong>Safety & Ethics</strong> are applied by default to all tasks.</li>
                            <li><strong>Strategy & Scope</strong> must be explicitly defined for <code>research</code> tasks.</li>
                            <li><strong>Constraints</strong> are mandatory for <code>automation</code> tasks impacting external APIs.</li>
                        </ul>
                    </div>
                </section>
            </div>
        </NexusLayout>
    );
}
