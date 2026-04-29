import React, { useEffect, useRef } from 'react';

interface SkillMapFrameProps {
    telemetry?: {
        activeStep?: string;
        agents?: any[];
        focusNode?: string;
    };
}

export function SkillMapFrame({ telemetry }: SkillMapFrameProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        if (iframeRef.current && telemetry) {
            iframeRef.current.contentWindow?.postMessage({
                type: 'TELEMETRY_SYNC',
                payload: telemetry
            }, '*');
        }
    }, [telemetry]);

    return (
        <div className="w-full h-full bg-slate-950 rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 z-10" />
            <iframe 
                ref={iframeRef}
                src="/maps/life-skill-map.html" 
                className="w-full h-full border-none"
                title="Antigravity Life Skill Map"
            />
        </div>
    );
}
