import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, Play, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { spatialAudio } from '../lib/audio-engine';
import { useToast } from './Toast';

interface VoiceRecorderProps {
    onTranscription: (text: string) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscription }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const { showToast } = useToast();

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                const url = URL.createObjectURL(audioBlob);
                setAudioUrl(url);
                handleTranscribe(audioBlob);
            };

            mediaRecorder.start();
            setIsRecording(true);
            spatialAudio.playActivity();
        } catch (err) {
            console.error("Failed to start recording", err);
            showToast("Microphone access denied", "error");
        }
    };

    useEffect(() => {
        const handleToggle = () => {
            if (isRecording) stopRecording();
            else startRecording();
        };
        window.addEventListener('NEXUS_TOGGLE_VOICE', handleToggle);
        return () => window.removeEventListener('NEXUS_TOGGLE_VOICE', handleToggle);
    }, [isRecording]);

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
            spatialAudio.playSuccess();
        }
    };

    const handleTranscribe = async (blob: Blob) => {
        setIsTranscribing(true);
        const formData = new FormData();
        formData.append('file', blob, 'audio.wav');

        try {
            const response = await fetch('/api/voice/transcribe', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                if (data.text) {
                    onTranscription(data.text);
                    showToast("Voice command processed", "success");
                }
            } else {
                throw new Error("Transcription failed");
            }
        } catch (err) {
            console.error(err);
            showToast("Transcription failed", "error");
            spatialAudio.playError();
        } finally {
            setIsTranscribing(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <AnimatePresence>
                {isRecording && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-3 px-3 py-1.5 bg-red-500/20 border border-red-500/50 rounded-full"
                    >
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest font-bold">Recording...</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isTranscribing}
                className={`p-2 rounded-full transition-all duration-300 ${isRecording
                    ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                    : 'bg-white/5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10'
                    } ${isTranscribing ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={isRecording ? "Stop Recording (CMD+S)" : "Voice Command (CMD+S)"}
            >
                {isTranscribing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : isRecording ? (
                    <Square className="w-4 h-4" />
                ) : (
                    <Mic className="w-4 h-4" />
                )}
            </button>
        </div>
    );
};
