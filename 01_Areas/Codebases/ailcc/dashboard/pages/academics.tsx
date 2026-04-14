import React from 'react';
import Head from 'next/head';
import NexusLayout from '../components/NexusLayout';
import { useAuth } from '../src/contexts/AuthContext';
import { BookOpen, Calendar, Clock, MapPin, Link as LinkIcon, ExternalLink, ShieldAlert, CheckCircle2, Circle, AlertCircle, Activity, Heart, Eye, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { SemesterSchema, CourseSchema, AssignmentSchema } from '../types/api';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

// --- MOCK DATA FOR FOUNDATIONAL UI ---

const MOCK_SEMESTER: SemesterSchema = {
    id: 'WINTER_2026',
    label: 'Winter 2026',
    start_date: '2026-01-05',
    end_date: '2026-04-30',
    gpa_snapshot: 3.8,
    courses: [
        {
            id: 'GENS2101',
            title: 'Intro to Natural Resource Management',
            instructor: 'Dr. Larry Swatuk',
            credits: 3,
            meeting_times: ['Mon 10:30', 'Wed 10:30', 'Fri 10:30'],
            room: 'Avard-Dixon 112',
            links: {
                moodle: 'https://moodle.mta.ca/course/view.php?id=1234',
                onedrive: 'https://onedrive.live.com/gens2101'
            },
            syllabus_parsed: true,
            assignments: [
                { id: 'a1', course_id: 'GENS2101', title: 'Treaty Rights Position Paper', type: 'PAPER', weight_percentage: 20, due_date: '2026-03-23T23:59:00Z', status: 'IN_PROGRESS' },
                { id: 'a2', course_id: 'GENS2101', title: 'Midterm Practical Exam', type: 'EXAM', weight_percentage: 30, due_date: '2026-04-01T10:30:00Z', status: 'TODO' },
            ]
        },
        {
            id: 'HLTH1011',
            title: 'Foundations of Health Inquiry',
            instructor: 'Dr. San Patten',
            credits: 3,
            meeting_times: ['Tue 14:30', 'Thu 14:30'],
            room: 'Flemington 220',
            links: {
                moodle: 'https://moodle.mta.ca/course/view.php?id=5678',
                self_service: 'https://selfservice.mta.ca/'
            },
            syllabus_parsed: true,
            assignments: [
                { id: 'a3', course_id: 'HLTH1011', title: 'Cortisol Measurement Lab', type: 'PROJECT', weight_percentage: 15, due_date: '2026-03-10T17:00:00Z', status: 'SUBMITTED', grade: 92 },
                { id: 'a4', course_id: 'HLTH1011', title: 'Weekly Reading Quiz 4', type: 'QUIZ', weight_percentage: 5, due_date: '2026-03-22T23:59:00Z', status: 'TODO' },
            ]
        }
    ]
};

const CANMEDS_TARGETS = [
    { role: 'Professional', key: 'Professional', target: 200, color: 'from-amber-400 to-amber-600', icon: ShieldAlert },
    { role: 'Communicator', key: 'Communicator', target: 150, color: 'from-cyan-400 to-blue-600', icon: Activity },
    { role: 'Collaborator', key: 'Collaborator', target: 300, color: 'from-emerald-400 to-emerald-600', icon: BookOpen },
    { role: 'Leader', key: 'Leader', target: 100, color: 'from-rose-400 to-rose-600', icon: Eye },
    { role: 'Health Advocate', key: 'Health Advocate', target: 200, color: 'from-fuchsia-400 to-purple-600', icon: Heart }
];

// --- COMPONENT ---

export default function AcademicTracker() {
    const { hasAccess } = useAuth();
    // Live data from AILCC Cortex API
    const { data: summerMatrix } = useSWR('http://localhost:8000/api/v1/academics/summer', fetcher, { refreshInterval: 30000 });
    useSWR('http://localhost:8000/api/v1/academics/profile', fetcher, { refreshInterval: 60000 });
    
    // Live Canonical Medical Tracker State (Local Edge-Compute)
    const { data: canmedsState } = useSWR('http://localhost:5005/api/medical/canmeds', fetcher, { refreshInterval: 5000 });
    
    // Fallback to mock if data structure isn't ready or server down
    const currentSemester = summerMatrix?.semester || MOCK_SEMESTER;
    const allAssignments = currentSemester.courses?.flatMap((c: CourseSchema) => c.assignments).sort((a: AssignmentSchema, b: AssignmentSchema) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()) || [];

    if (!hasAccess('academics')) {
        return (
            <NexusLayout>
                <div className="flex h-full items-center justify-center p-20">
                    <div className="text-center space-y-4">
                        <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto opacity-50 mb-2" />
                        <h1 className="text-xl font-bold tracking-widest text-rose-400 uppercase">Clearance Denied</h1>
                        <p className="font-mono text-slate-500 text-xs uppercase tracking-widest">You lack clearance for the Academic Core.</p>
                    </div>
                </div>
            </NexusLayout>
        );
    }

    const getStatusIcon = (status: AssignmentSchema['status']) => {
        switch(status) {
            case 'SUBMITTED': case 'GRADED': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            case 'IN_PROGRESS': return <AlertCircle className="w-4 h-4 text-amber-400" />;
            default: return <Circle className="w-4 h-4 text-slate-500" />;
        }
    };

    return (
        <NexusLayout>
            <Head>
                <title>Academic Core | NEXUS</title>
            </Head>

            <div className="w-full flex flex-col gap-8 max-w-[90rem] mx-auto p-4 lg:p-8 min-h-[calc(100vh-4rem)]">
                {/* Header Strip */}
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter text-white bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                            Academic Core
                        </h1>
                        <p className="font-mono text-[10px] text-indigo-400/80 tracking-[0.2em] uppercase mt-2">
                            Mt. Allison Sovereign Gateway // Per-Semester Tracker
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-xl border border-slate-700/50">
                        <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg flex flex-col items-center justify-center">
                            <span className="text-[9px] text-indigo-400 font-mono uppercase tracking-widest">GPA</span>
                            <span className="text-sm font-black text-white">{currentSemester.gpa_snapshot?.toFixed(2) || 'N/A'}</span>
                        </div>
                        <div className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg flex flex-col items-center justify-center">
                            <span className="text-[9px] text-slate-400 font-mono uppercase tracking-widest">Credits</span>
                            <span className="text-sm font-black text-white">{currentSemester.courses?.reduce((acc: number, c: CourseSchema) => acc + c.credits, 0) || 0}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    
                    {/* LEFT COLUMN: ACTIVE COURSES & MEDICAL MATRIX */}
                    <div className="xl:col-span-8 flex flex-col gap-6">
                        {/* THE MEDICAL CanMEDS TRACKER */}
                        <div className="bg-slate-900/40 rounded-2xl border border-white/10 p-6 flex flex-col gap-4">
                            <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-emerald-400" /> CanMEDS Medical Matrix (2027 Cycle)
                                </h2>
                                <div className="flex gap-2">
                                   <span className="text-[10px] bg-green-500/10 text-green-400 font-mono px-2 py-1 rounded border border-green-500/20">AREA</span>
                                   <span className="text-[10px] bg-slate-800 text-slate-400 font-mono px-2 py-1 rounded border border-white/10">ON-DEVICE SENSOR</span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                                {CANMEDS_TARGETS.map((medRole, idx) => {
                                    const activeHours = canmedsState?.[medRole.key] || 0;
                                    const getWidthClass = (pct: number) => {
                                        if (pct === 0) return 'w-0';
                                        if (pct < 15) return 'w-1/12';
                                        if (pct < 30) return 'w-1/4';
                                        if (pct < 45) return 'w-1/3';
                                        if (pct < 60) return 'w-1/2';
                                        if (pct < 75) return 'w-2/3';
                                        if (pct < 90) return 'w-3/4';
                                        if (pct < 100) return 'w-11/12';
                                        return 'w-full';
                                    };
                                    
                                    const percentage = Math.min(100, Math.round((activeHours / medRole.target) * 100));
                                    const widthClass = getWidthClass(percentage);
                                    const Icon = medRole.icon;
                                    
                                    return (
                                        <div key={idx} className="bg-black/40 rounded-xl p-4 border border-white/5 flex flex-col items-center text-center relative overflow-hidden group">
                                            <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${medRole.color} transition-all duration-1000 ${widthClass}`} />
                                            <Icon className="w-5 h-5 text-slate-400 mb-2 group-hover:text-white transition-colors" />
                                            <h3 className="text-[10px] font-mono tracking-widest uppercase text-slate-300 font-bold mb-1">{medRole.role}</h3>
                                            <span className="text-lg font-black text-white">{activeHours}<span className="text-[10px] text-slate-500 font-normal">/{medRole.target}h</span></span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ACTIVE ROSTER */}
                        <div className="flex flex-col gap-6 mt-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-cyan-400" /> Active Roster
                                <span className="ml-2 text-[10px] bg-blue-500/10 text-blue-400 font-mono px-2 py-0.5 rounded border border-blue-500/20">PROJECTS</span>
                            </h2>
                            <button className="text-[10px] font-mono tracking-widest uppercase text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                                <ExternalLink className="w-3 h-3" /> Open ConnectAuth
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {currentSemester.courses?.map((course: CourseSchema) => (
                                <div key={course.id} className="bg-slate-900/40 rounded-2xl border border-white/10 hover:border-indigo-500/50 transition-colors overflow-hidden flex flex-col">
                                    <div className="p-5 border-b border-white/5 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
                                        <div className="flex justify-between items-start mb-2 relative z-10">
                                            <span className="text-xs font-black font-mono text-indigo-400 tracking-widest">{course.id}</span>
                                            {course.syllabus_parsed && (
                                                <span className="text-[8px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono uppercase tracking-wider border border-indigo-500/30">
                                                    Syllabus Parsed
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-bold text-white leading-tight mb-3 relative z-10">{course.title}</h3>
                                        <div className="flex flex-col gap-2 text-xs text-slate-400 font-mono relative z-10">
                                            <div className="flex items-center gap-2"><Calendar className="w-3 h-3 text-slate-500"/> {course.meeting_times.join(', ')}</div>
                                            <div className="flex items-center gap-2"><MapPin className="w-3 h-3 text-slate-500"/> {course.room || 'TBA'}</div>
                                            <div className="flex items-center gap-2"><Clock className="w-3 h-3 text-slate-500"/> {course.instructor}</div>
                                        </div>
                                    </div>
                                    <div className="bg-black/30 p-3 grid grid-cols-2 gap-2 text-[10px] font-mono uppercase tracking-widest border-t border-white/5">
                                        {course.links.moodle && (
                                            <a href={course.links.moodle} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 py-2 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors">
                                                <LinkIcon className="w-3 h-3" /> Moodle
                                            </a>
                                        )}
                                        <Link href={`/skills?objective=Forge ${course.id} Specialized Study Agent`} className="flex items-center justify-center gap-2 py-2 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 transition-all group/forge">
                                            <Wand2 className="w-3 h-3 group-hover/forge:animate-pulse" /> Forge
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                    {/* RIGHT COLUMN: GLOBAL TASK LANE */}
                    <div className="xl:col-span-4 flex flex-col gap-6">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-rose-400" /> Operational Queue
                            </h2>
                        </div>
                        <div className="bg-slate-900/40 rounded-2xl border border-white/5 p-4 flex flex-col gap-3 h-[600px] overflow-y-auto custom-scrollbar">
                            {allAssignments.map((assignment: AssignmentSchema) => (
                                <div key={assignment.id} className="bg-black/40 rounded-xl p-4 border border-white/5 hover:border-rose-500/30 transition-colors">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(assignment.status)}
                                            <span className="text-[10px] font-mono text-cyan-400 tracking-widest">{assignment.course_id}</span>
                                        </div>
                                        <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded text-white ${
                                            assignment.type === 'EXAM' ? 'bg-rose-500' :
                                            assignment.type === 'PAPER' ? 'bg-indigo-500' :
                                            assignment.type === 'PROJECT' ? 'bg-amber-500' : 'bg-slate-700'
                                        }`}>
                                            {assignment.type}
                                        </span>
                                    </div>
                                    <h4 className="text-sm font-bold text-white mb-2 leading-snug">{assignment.title}</h4>
                                    
                                    {assignment.vault_links && assignment.vault_links.length > 0 && (
                                        <div className="mb-3">
                                            {assignment.vault_links.map((link, idx) => (
                                                <a key={idx} href={`file:///${link}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[9px] font-mono bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/40 border border-indigo-500/30 px-2 py-1 rounded transition-colors uppercase tracking-widest">
                                                    <BookOpen className="w-3 h-3" /> View AI Summary
                                                </a>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                                        <span className={`text-[10px] font-mono ${new Date(assignment.due_date).getTime() < Date.now() + 172800000 ? 'text-rose-400' : 'text-slate-500'}`}>
                                            Due: {new Date(assignment.due_date).toLocaleDateString()}
                                        </span>
                                        {assignment.weight_percentage && (
                                            <span className="text-[10px] text-slate-400 font-mono">{assignment.weight_percentage}%</span>
                                        )}
                                        {assignment.grade && (
                                            <span className="text-[10px] font-bold text-emerald-400">{assignment.grade}% Score</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </NexusLayout>
    );
}
