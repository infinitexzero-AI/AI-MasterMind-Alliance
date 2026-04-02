import React, { useState, useRef, useEffect } from 'react';
import { DashboardCard } from '../ui/DashboardCard';
import { Mic, Volume2, Square, Loader2 } from 'lucide-react';

export const VoiceCommander = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [transcript, setTranscript] = useState<string>('');

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

    useEffect(() => {
        // Initialize AudioContext
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
            audioContextRef.current = new AudioContext();
        }
        return () => {
            audioContextRef.current?.close();
        };
    }, []);

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

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                await processAudio(audioBlob);

                // Cleanup stream
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setTranscript(''); // Clear previous transcript
        } catch (err) {
            console.error("Microphone access denied:", err);
            // Fallback or error state handling here
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const processAudio = async (audioBlob: Blob) => {
        setIsProcessing(true);
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.webm');

        try {
            const response = await fetch('/api/voice-command', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            // The API returns the transcription text in headers or a custom JSON envelope, 
            // but for simplicity, we assume it streams back MP3 audio directly.
            // To get both text and audio, we could parse a multipart response.
            // For this MVP, we will just play the returned audio buffer.

            const transcriptionText = response.headers.get('x-transcript') || 'Processed voice command...';
            setTranscript(transcriptionText);

            const arrayBuffer = await response.arrayBuffer();
            if (audioContextRef.current && arrayBuffer.byteLength > 0) {
                await playAudioBuffer(arrayBuffer);
            }
        } catch (error) {
            console.error("Error processing voice command:", error);
            setTranscript("Error processing audio.");
        } finally {
            setIsProcessing(false);
        }
    };

    const playAudioBuffer = async (arrayBuffer: ArrayBuffer) => {
        if (!audioContextRef.current) return;

        try {
            const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
            const sourceNode = audioContextRef.current.createBufferSource();
            sourceNode.buffer = audioBuffer;
            sourceNode.connect(audioContextRef.current.destination);
            sourceNodeRef.current = sourceNode;

            sourceNode.onended = () => {
                setIsPlaying(false);
            };

            sourceNode.start(0);
            setIsPlaying(true);
        } catch (e) {
            console.error("Error decoding/playing audio:", e);
        }
    };

    const stopAudio = () => {
        if (sourceNodeRef.current && isPlaying) {
            sourceNodeRef.current.stop();
            setIsPlaying(false);
        }
    };

    return (
        <DashboardCard
            title={
                <span className="flex items-center">
                    <Volume2 className="mr-2 h-4 w-4 text-emerald-400" />
                    FRIDAY PROTOCOL (VOICE)
                </span>
            }
            className="border-zinc-800 bg-black transition-all duration-300"
        >
            <div className="flex flex-col items-center justify-center space-y-6">

                {/* Main interactive button */}
                <div className="relative">
                    {/* Pulse effect when recording */}
                    {isRecording && (
                        <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping"></div>
                    )}

                    <button
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={isProcessing || isPlaying}
                        className={`relative flex items-center justify-center w-24 h-24 rounded-full border-4 transition-all duration-300 ${isRecording
                            ? 'border-red-500 bg-red-500/10 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]'
                            : isProcessing
                                ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                                : isPlaying
                                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]'
                                    : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isRecording ? (
                            <Square className="h-8 w-8 fill-current" />
                        ) : isProcessing ? (
                            <Loader2 className="h-8 w-8 animate-spin" />
                        ) : isPlaying ? (
                            <Volume2 className="h-8 w-8 animate-pulse" />
                        ) : (
                            <Mic className="h-8 w-8" />
                        )}
                    </button>
                </div>

                {/* Status Text */}
                <div className="h-12 flex items-center justify-center text-center">
                    <p className="font-mono text-xs text-zinc-400 max-w-[250px] truncate">
                        {isRecording
                            ? "Listening (Click to stop)..."
                            : isProcessing
                                ? "Transcribing & Synthesizing..."
                                : isPlaying
                                    ? "Friday is speaking..."
                                    : transcript
                                        ? `"${transcript}"` // Show last transcript
                                        : "Tap to initiate voice protocol."}
                    </p>
                </div>

                {/* Stop Playback Button (conditionally rendered) */}
                {isPlaying && (
                    <button
                        onClick={stopAudio}
                        className="text-xs font-mono text-red-400 hover:text-red-300 flex items-center"
                    >
                        <Square className="h-3 w-3 mr-1 fill-current" /> Interrupt
                    </button>
                )}

            </div>
        </DashboardCard>
    );
};
