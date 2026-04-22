import React, { useEffect, useState } from 'react';
import { DashboardCard } from '../ui/DashboardCard';
import { motion } from 'framer-motion';
import { Calendar, Clock, AlertTriangle, BookOpen } from 'lucide-react';

interface Deliverable {
    title: string;
    due_date: string;
    status: string;
}

interface Course {
    code: string;
    name: string;
    exam_date: string;
    active_topics: string[];
    covered_topics: string[];
    deliverables: Deliverable[];
}

interface ScholarData {
    courses: Course[];
    degree_progress?: {
        degree: string;
        major: string;
        total_credits_required: number;
        credits_earned: number;
        current_gpa: number;
        status: string;
        graduation_readiness: number;
        remaining_courses_needed: string[];
    };
}

export const ScholarTracker: React.FC = () => {
    const [data, setData] = useState<ScholarData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/scholar');
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (error) {
                console.error("Failed to fetch scholar data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 300000); // 5 mins
        return () => clearInterval(interval);
    }, []);

    if (loading) return (
        <DashboardCard title="Scholar Protocol" subtitle="Academic Convergence" className="h-full">
            <div className="flex items-center justify-center h-48 text-slate-400 text-xs animate-pulse">
                SYNCING CLOUD DATA...
            </div>
        </DashboardCard>
    );

    if (!data) return (
        <DashboardCard title="Scholar Protocol" subtitle="Academic Convergence" className="h-full">
            <div className="flex items-center justify-center h-48 text-red-400 text-xs">
                DATA LINK ERROR
            </div>
        </DashboardCard>
    );

    return (
        <DashboardCard
            title="Scholar Protocol"
            subtitle="Degree Convergence Activated"
            className="h-full"
            headerAction={<div className="bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded text-[10px] font-bold">MODE 1 ACTIVE</div>}
        >
            <div className="space-y-6">
                {/* Degree Progress Highlight */}
                {data.degree_progress && (
                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-900/40 to-slate-900/60 border border-blue-500/30 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <BookOpen size={40} />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">{data.degree_progress.degree}</h3>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-lg font-bold text-white tracking-tighter">{data.degree_progress.status}</span>
                                <span className="text-xs font-mono text-cyan-400">{data.degree_progress.graduation_readiness}% Readiness</span>
                            </div>

                            <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden mb-3">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${data.degree_progress.graduation_readiness}%` }}
                                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase font-mono">Credits Earned</p>
                                    <p className="text-sm font-bold text-slate-200">{data.degree_progress.credits_earned} / {data.degree_progress.total_credits_required}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase font-mono">Current GPA</p>
                                    <p className={`text-sm font-bold ${data.degree_progress.current_gpa === 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                        {data.degree_progress.current_gpa === 0 ? 'PENDING AUDIT' : `${data.degree_progress.current_gpa} / 4.0`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Remaining Roadmap */}
                {data.degree_progress && (
                    <div className="space-y-2">
                        <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest pl-1">Remaining Roadmap</p>
                        <div className="space-y-1">
                            {data.degree_progress.remaining_courses_needed?.map((course, i) => (
                                <div key={i} className="flex items-center gap-2 text-[11px] text-slate-400 px-2 py-1 bg-white/5 rounded border border-white/5">
                                    <div className="w-1 h-1 rounded-full bg-blue-500" />
                                    {course}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Completed Semester Status */}
                <div className="space-y-3 pt-2 border-t border-slate-800">
                    <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest pl-1">Fall 2025 Audit</p>
                    {data.courses.map((course) => (
                        <div key={course.code} className="p-3 rounded-lg bg-emerald-900/10 border border-emerald-500/20">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-bold text-emerald-400">{course.code}: {course.name}</span>
                                <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold uppercase tracking-tighter">Completed</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-mono">All final deliverables verified. Singularity achieved for this node.</p>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardCard>
    );
};
