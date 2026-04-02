import React, { useState, useCallback } from 'react';
import { Upload, CheckCircle, AlertCircle, FileText, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NeuralDropzoneProps {
    onSuccess?: () => void;
}

export const NeuralDropzone: React.FC<NeuralDropzoneProps> = ({ onSuccess }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [fileName, setFileName] = useState<string | null>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length === 0) return;

        await processFiles(files);
    }, []);

    const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        await processFiles(files);
    }, []);

    const processFiles = async (files: File[]) => {
        setStatus('uploading');
        setFileName(files[0].name);

        try {
            const formData = new FormData();
            files.forEach(file => formData.append('files', file));

            const res = await fetch('/api/vault/ingest', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                setStatus('success');
                onSuccess?.();
                setTimeout(() => setStatus('idle'), 3000);
            } else {
                setStatus('error');
                setTimeout(() => setStatus('idle'), 3000);
            }
        } catch {
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    return (
        <motion.div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 p-8 text-center cursor-pointer group ${
                isDragging
                    ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_30px_rgba(6,182,212,0.2)]'
                    : status === 'success'
                    ? 'border-emerald-500/50 bg-emerald-500/5'
                    : status === 'error'
                    ? 'border-red-500/50 bg-red-500/5'
                    : 'border-white/10 bg-white/[0.02] hover:border-cyan-500/30 hover:bg-cyan-500/5'
            }`}
        >
            <input
                type="file"
                multiple
                accept=".md,.txt,.json,.pdf,.csv"
                onChange={handleFileInput}
                aria-label="File upload"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />

            <AnimatePresence mode="wait">
                {status === 'uploading' ? (
                    <motion.div
                        key="uploading"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex flex-col items-center gap-3"
                    >
                        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                        <p className="text-sm font-mono text-cyan-400 uppercase tracking-widest">
                            Ingesting {fileName}...
                        </p>
                    </motion.div>
                ) : status === 'success' ? (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex flex-col items-center gap-3"
                    >
                        <CheckCircle className="w-8 h-8 text-emerald-400" />
                        <p className="text-sm font-mono text-emerald-400 uppercase tracking-widest">
                            Neural Ingestion Complete
                        </p>
                    </motion.div>
                ) : status === 'error' ? (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex flex-col items-center gap-3"
                    >
                        <AlertCircle className="w-8 h-8 text-red-400" />
                        <p className="text-sm font-mono text-red-400 uppercase tracking-widest">
                            Ingestion Failed — Retry
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-3"
                    >
                        <div className="relative">
                            <Upload className="w-8 h-8 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                            <FileText className="w-4 h-4 text-slate-600 absolute -right-2 -bottom-1" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors uppercase tracking-wide">
                                Drop Intelligence Here
                            </p>
                            <p className="text-[10px] font-mono text-slate-500 mt-1 uppercase tracking-widest">
                                MD · TXT · JSON · PDF · CSV — Neural Ingestion Pipeline
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default NeuralDropzone;
