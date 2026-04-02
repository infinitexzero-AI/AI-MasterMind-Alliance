import React from 'react';
import { CheckCircle, Lock } from 'lucide-react';

interface HumanApprovalGateProps {
    taskId: string;
    isApproving: boolean;
    onApprove: () => void;
}

export default function HumanApprovalGate({ taskId, isApproving, onApprove }: HumanApprovalGateProps) {
    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                onApprove();
            }}
            disabled={isApproving}
            className={`mt-1 px-3 py-1 rounded text-[10px] uppercase font-bold tracking-wider w-fit flex items-center gap-2 transition-all ${isApproving
                    ? 'bg-emerald-500/10 text-emerald-500/50 cursor-not-allowed border border-emerald-500/10'
                    : 'bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 border border-emerald-500/30'
                }`}
        >
            {isApproving ? (
                <>
                    <div className="w-2 h-2 rounded-full border border-emerald-500/50 border-t-emerald-500 animate-spin" /> Processing...
                </>
            ) : (
                <>
                    <CheckCircle className="w-3 h-3" /> Approve Task
                </>
            )}
        </button>
    );
}
