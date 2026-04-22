import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import dynamic from 'next/dynamic';

const ReactDiffViewer = dynamic(() => import('react-diff-viewer-continued'), { ssr: false });
import { uiAudio } from '../lib/audio';

interface DocumentPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    content: string;
    title?: string;
}

export default function DocumentPreviewModal({ isOpen, onClose, content, title = "Artifact Preview" }: DocumentPreviewModalProps) {
    useEffect(() => {
        if (isOpen) {
            uiAudio.playBlip();
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    const handleDownload = () => {
        uiAudio.playSuccess();
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/\s+/g, '_').toLowerCase()}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="fixed inset-4 md:inset-10 z-[201] flex flex-col renaissance-panel bg-slate-900/95 border border-white/20 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-800/50">
                            <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-cyan-400" />
                                <h2 className="text-sm font-mono tracking-widest text-slate-200 uppercase">{title}</h2>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleDownload}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30 transition-colors text-[10px] font-mono uppercase"
                                >
                                    <Download className="w-3 h-3" />
                                    Download
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                    title="Close preview"
                                    aria-label="Close preview"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Content Body */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#0a0f16]">
                            <article className="prose prose-invert prose-slate prose-sm md:prose-base max-w-4xl mx-auto">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        code({ inline, className, children, ...props }: any) {
                                            const match = /language-(\w+)/.exec(className || '');
                                            if (match && match[1] === 'diff') {
                                                const diffString = String(children).replace(/\n$/, '');
                                                return (
                                                    <div className="my-6 border border-white/10 rounded-xl overflow-hidden bg-[#1e1e1e]">
                                                        <div className="bg-slate-800 px-4 py-2 border-b border-white/10 text-xs font-mono text-slate-400 select-none flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                                                            Code Comparison (Diff)
                                                        </div>
                                                        <ReactDiffViewer
                                                            oldValue={''}
                                                            newValue={diffString}
                                                            splitView={false}
                                                            useDarkTheme={true}
                                                            hideLineNumbers={false}
                                                            renderContent={(source: string) => <pre className="inline">{source}</pre>}
                                                        />
                                                    </div>
                                                );
                                            }
                                            return !inline && match ? (
                                                <div className="relative group my-4 rounded-xl overflow-hidden border border-white/10">
                                                    <div className="bg-slate-800 px-4 py-1.5 text-[10px] font-mono text-slate-400 select-none uppercase tracking-widest">
                                                        {match[1]}
                                                    </div>
                                                    <pre className="!m-0 !rounded-none !bg-[#0d131f] !p-4 custom-scrollbar">
                                                        <code className={className} {...props}>
                                                            {children}
                                                        </code>
                                                    </pre>
                                                </div>
                                            ) : (
                                                <code className="px-1.5 py-0.5 rounded-md bg-white/10 text-cyan-300 font-mono text-[0.9em]" {...props}>
                                                    {children}
                                                </code>
                                            );
                                        },
                                        a({ node, children, ...props }: any) {
                                            return <a className="text-cyan-400 hover:text-cyan-300 transition-colors" target="_blank" rel="noreferrer" {...props}>{children}</a>;
                                        }
                                    }}
                                >
                                    {content}
                                </ReactMarkdown>
                            </article>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
