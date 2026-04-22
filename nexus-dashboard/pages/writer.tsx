import React from 'react';
import Head from 'next/head';
import NexusLayout from '../components/NexusLayout';
import { Panel } from '../components/ui/Panel';
import { BookOpen, Sparkles, Clock, FileText, ChevronRight } from 'lucide-react';
import useSWR from 'swr';
import ReactMarkdown from 'react-markdown';

export default function WriterCanvas() {
  const fetcher = (url: string) => fetch(url).then(res => res.json());
  const { data: documents, error } = useSWR('/api/system/vault/ghostwriter', fetcher, { refreshInterval: 5000 });
  const [selectedDoc, setSelectedDoc] = React.useState<any>(null);

  return (
    <NexusLayout>
      <Head>
        <title>Spectral Canvas | AILCC</title>
      </Head>
      
      <div className="w-full flex flex-col gap-6 max-w-7xl mx-auto p-4 lg:p-6 h-[calc(100vh-6rem)]">
        {/* Header Ribbon */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tighter text-white flex items-center gap-3">
                    <BookOpen className="w-8 h-8 text-cyan-400" /> The Spectral Canvas
                </h1>
                <p className="font-mono text-[10px] text-slate-400 tracking-widest uppercase mt-1">
                    Autonomous Ghostwriter & Document Synthesis Hub
                </p>
            </div>
            <div className="flex items-center gap-3 bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
                <span className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest font-bold flex items-center gap-2">
                    <Sparkles className="w-3 h-3 animate-pulse" /> Reading Live Vault State
                </span>
            </div>
        </div>

        {/* Main Interface Layout */}
        <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0 overflow-hidden">
            
            {/* Left Rail: Document Ledger */}
            <div className="w-full lg:w-1/3 flex flex-col h-full bg-black/60 border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                    <span className="font-mono text-xs text-slate-300 uppercase tracking-widest font-bold flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan-500" /> Synthesized Codex
                    </span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                        {documents ? documents.length : 0} Files
                    </span>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                    {!documents ? (
                        <div className="h-full flex items-center justify-center font-mono text-[10px] uppercase tracking-widest text-slate-500">
                            Loading Vanguard Constructs...
                        </div>
                    ) : documents.length === 0 ? (
                         <div className="h-full flex flex-col items-center justify-center text-center p-6 gap-3">
                            <BookOpen className="w-8 h-8 text-slate-700" />
                            <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                                Ghostwriter queue empty. Deploy an Architect swarm to begin synthesis.
                            </span>
                        </div>
                    ) : (
                        documents.map((doc: any, i: number) => (
                            <button 
                                key={i}
                                onClick={() => setSelectedDoc(doc)}
                                className={`w-full text-left p-4 rounded-lg flex items-start gap-4 transition-all duration-300 ${selectedDoc?.path === doc.path ? 'bg-cyan-900/20 border-cyan-500/50' : 'bg-slate-900/30 border-slate-800 hover:bg-slate-900 hover:border-slate-700'} border`}>
                                <div className={`p-2 rounded-lg ${selectedDoc?.path === doc.path ? 'bg-cyan-500/20' : 'bg-slate-800'}`}>
                                    <FileText className={`w-4 h-4 ${selectedDoc?.path === doc.path ? 'text-cyan-400' : 'text-slate-400'}`} />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <h3 className={`text-sm tracking-wide font-sans truncate ${selectedDoc?.path === doc.path ? 'text-cyan-300 font-bold' : 'text-slate-300'}`}>
                                        {doc.title || doc.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1.5 opacity-80">
                                        <Clock className="w-3 h-3 text-slate-500" />
                                        <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500">
                                            {doc.modified}
                                        </span>
                                    </div>
                                </div>
                                <ChevronRight className={`w-4 h-4 mt-2 transition-transform ${selectedDoc?.path === doc.path ? 'text-cyan-500 translate-x-1' : 'text-slate-700'}`} />
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Right Pane: Markdown Renderer */}
            <div className="w-full lg:w-2/3 flex flex-col h-full bg-black/80 border border-slate-800 rounded-xl overflow-hidden relative">
                {selectedDoc ? (
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-12 relative">
                        <div className="max-w-3xl mx-auto prose prose-invert prose-cyan prose-h1:text-4xl prose-h1:font-sans prose-h1:tracking-tighter prose-h2:font-sans prose-h3:font-sans prose-a:text-cyan-400 prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800">
                            <ReactMarkdown>{selectedDoc.content}</ReactMarkdown>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center p-12 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#083344_1px,transparent_1px),linear-gradient(to_bottom,#083344_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] opacity-20" />
                        <Sparkles className="w-16 h-16 text-cyan-500/30 mb-6" />
                        <h2 className="text-xl font-bold font-sans tracking-wide text-slate-300 bg-clip-text">Awaiting Synthesis Matrix</h2>
                        <p className="font-mono text-xs text-slate-500 uppercase tracking-widest mt-4 max-w-sm">
                            Select a document from the left rail to observe the Vanguard's physical literature output.
                        </p>
                    </div>
                )}
            </div>
            
        </div>
      </div>
    </NexusLayout>
  );
}
