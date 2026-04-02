import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import dynamic from 'next/dynamic';

const ReactDiffViewer = dynamic(() => import('react-diff-viewer-continued'), { ssr: false });

interface ChatMarkdownProps {
    content: string;
}

const Mermaid = ({ chart }: { chart: string }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current) {
            import('mermaid').then((mermaid) => {
                mermaid.default.initialize({ startOnLoad: true, theme: 'dark', securityLevel: 'loose' });
                mermaid.default.render(`mermaid-${Math.random().toString(36).substr(2, 9)}`, chart).then(({ svg }) => {
                    if (ref.current) ref.current.innerHTML = svg;
                });
            });
        }
    }, [chart]);

    return <div ref={ref} className="my-4 flex justify-center bg-slate-900/50 p-4 rounded-lg border border-slate-700/30 overflow-x-auto" />;
};

const parseDiffBlock = (code: string) => {
    const lines = code.split('\n');
    let oldValue = '';
    let newValue = '';

    lines.forEach(line => {
        if (line.startsWith('-')) {
            oldValue += line.substring(1) + '\n';
        } else if (line.startsWith('+')) {
            newValue += line.substring(1) + '\n';
        } else {
            oldValue += line + '\n';
            newValue += line + '\n';
        }
    });

    return { oldValue, newValue };
};

export const ChatMarkdown: React.FC<ChatMarkdownProps> = ({ content }) => {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                code({ inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeText = String(children).replace(/\n$/, '');

                    if (!inline && match && match[1] === 'mermaid') {
                        return <Mermaid chart={codeText} />;
                    }

                    if (!inline && match && match[1] === 'diff') {
                        const { oldValue, newValue } = parseDiffBlock(codeText);
                        return (
                            <div className="my-4 overflow-hidden rounded-md border border-slate-700">
                                <ReactDiffViewer
                                    oldValue={oldValue}
                                    newValue={newValue}
                                    splitView={false}
                                    useDarkTheme={true}
                                />
                            </div>
                        );
                    }

                    return !inline && match ? (
                        <div className="my-3 rounded-md bg-slate-950 p-3 overflow-x-auto border border-slate-800">
                            <pre className={className} {...props}>{children}</pre>
                        </div>
                    ) : (
                        <code className="bg-slate-800 px-1 py-0.5 rounded text-cyan-300 font-mono text-[11px] sm:text-xs" {...props}>
                            {children}
                        </code>
                    );
                },
                p: ({ children }) => <p className="mb-3 whitespace-pre-wrap">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
                h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-white">{children}</h1>,
                h2: ({ children }) => <h2 className="text-md font-bold mb-2 text-slate-100">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-bold mb-2 text-slate-200">{children}</h3>,
                table: ({ children }) => (
                    <div className="my-4 overflow-x-auto border border-slate-700 rounded-lg">
                        <table className="w-full text-left border-collapse text-xs sm:text-sm">
                            {children}
                        </table>
                    </div>
                ),
                thead: ({ children }) => <thead className="bg-slate-800 text-slate-300">{children}</thead>,
                th: ({ children }) => <th className="p-2 border-b border-slate-700 font-mono tracking-tighter">{children}</th>,
                td: ({ children }) => <td className="p-2 border-b border-slate-800 text-slate-400">{children}</td>,
            }}
        >
            {content}
        </ReactMarkdown>
    );
};
