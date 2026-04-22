import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    Stethoscope,
    Calendar,
    BookOpen,
    Target,
    AlertTriangle,
    Zap,
    Download,
    CheckCircle2,
    MessageSquare
} from 'lucide-react';

export default function MedicalPathway() {
    // Simulated live state pulled from telemetry and hippocampus logic
    const [pathwayData, setPathwayData] = useState<any>(null);
    const [generatingAnki, setGeneratingAnki] = useState(false);
    const [ankiStatus, setAnkiStatus] = useState<string | null>(null);

    // CASPer Simulator State
    const [casperScenario, setCasperScenario] = useState<string | null>(null);
    const [casperResponse, setCasperResponse] = useState<string>('');
    const [casperGrade, setCasperGrade] = useState<any>(null);
    const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
    const [isGeneratingScenario, setIsGeneratingScenario] = useState<boolean>(false);

    // Initial load: fetch the local matrix file (in a real app this is an API call; we'll mock the JSON structure here)
    useEffect(() => {
        // Fetch simulated data from our JSON schema
        const fetchMatrix = async () => {
            setPathwayData({
                pathway_id: "MD_CANADA_2028",
                status: "PREMED_PREP",
                target_institutions: [
                    { name: "McMaster University", gpa_cutoff: 3.0, mcat_requirements: "129 CARS", casper_weight: "High" },
                    { name: "University of Toronto", gpa_cutoff: 3.6, mcat_requirements: "Thresholds Only", essay_required: true },
                    { name: "Dalhousie University", gpa_cutoff: 3.3, maritime_residency_required: true }
                ],
                standardized_testing: {
                    mcat: { target_score: 515, sections: { chem_phys: 128, cars: 129, bio_biochem: 129, psych_soc: 129 } }
                },
                omsas_live_data: {
                    application_cycle: "2027",
                    portal_open: "First week of July 2027",
                    submission_deadline: "October 1, 2027",
                    last_scraped: new Date().toISOString()
                }
            });
        };
        fetchMatrix();
    }, []);

    const triggerAnkiGenerator = () => {
        setGeneratingAnki(true);
        setAnkiStatus("Extracting high-yield concepts via LLM...");
        
        // Simulating the backend hook execution for mcat_anki_generator.py
        setTimeout(() => {
            setAnkiStatus("Formatting CSV...");
            setTimeout(() => {
                setGeneratingAnki(false);
                setAnkiStatus("✅ Cell_Biology_Intro_Anki_2026.csv generated in OneDrive Vault.");
                setTimeout(() => setAnkiStatus(null), 5000);
            }, 1000);
        }, 2000);
    };

    const triggerCasperScenario = () => {
        setIsGeneratingScenario(true);
        setCasperGrade(null);
        setCasperResponse('');
        // Simulated API call to casper_mmi_simulator.py
        setTimeout(() => {
            setCasperScenario("You are a medical student shadowing a resident. You notice the resident is slurring their words and smells faintly of alcohol before entering a patient's room. What do you do?");
            setIsGeneratingScenario(false);
        }, 1500);
    };

    const submitCasperResponse = () => {
        if (!casperResponse) return;
        setIsEvaluating(true);
        // Simulated API Eval
        setTimeout(() => {
            setCasperGrade({
                Empathy: 8,
                Professionalism: 9,
                Communication: 8,
                Feedback: "Solid response. You addressed the immediate safety concern while remaining professional and non-confrontational with your superior."
            });
            setIsEvaluating(false);
        }, 2000);
    };

    if (!pathwayData) return <div className="min-h-screen bg-[#0a0f16] flex items-center justify-center"><Activity className="w-8 h-8 text-blue-500 animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-[#0a0f16] text-slate-300 font-sans selection:bg-blue-500/30">
            <Head>
                <title>Nexus | Medical Pathway</title>
            </Head>

            <main className="max-w-7xl mx-auto px-6 py-8 mt-16 space-y-8">
                {/* Header Sequence */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="flex flex-col md:flex-row md:items-end justify-between border-b border-indigo-500/20 pb-6 gap-4"
                >
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Stethoscope className="w-8 h-8 text-teal-400" />
                            <h1 className="text-4xl font-light tracking-tight text-white">
                                Med School <span className="font-medium text-teal-400">Trajectory</span>
                            </h1>
                        </div>
                        <p className="text-slate-400 font-mono text-sm max-w-xl">
                            AILCC Pathway Tracking: OMSAS monitoring, MCAT standardization, and automated high-yield retention loops.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 bg-teal-900/20 px-4 py-2 rounded-lg border border-teal-500/30">
                        <Activity className="w-4 h-4 text-teal-400" />
                        <span className="text-teal-400 font-mono text-xs font-bold uppercase tracking-wider">{pathwayData.status.replace('_', ' ')}</span>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left Column: Tracking & Cycle Data */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* OMSAS Cycle Alert Box */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className="bg-gradient-to-br from-indigo-900/30 to-slate-900/50 rounded-xl border border-indigo-500/30 p-6 overflow-hidden relative"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
                            
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl text-white font-medium flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-indigo-400" />
                                    OMSAS {pathwayData.omsas_live_data.application_cycle} Cycle
                                </h3>
                                <span className="text-xs text-slate-500 font-mono">Last Scraped: {new Date(pathwayData.omsas_live_data.last_scraped).toLocaleTimeString()}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#0f1520] rounded border border-slate-700/50 p-4">
                                    <span className="text-slate-400 text-xs uppercase tracking-wider block mb-1">Portal Opens</span>
                                    <span className="text-white font-medium">{pathwayData.omsas_live_data.portal_open}</span>
                                </div>
                                <div className="bg-[#0f1520] rounded border border-rose-900/40 p-4 relative overflow-hidden">
                                     <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
                                    <span className="text-rose-400 text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        Hard Deadline
                                    </span>
                                    <span className="text-white font-medium">{pathwayData.omsas_live_data.submission_deadline}</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Target Institutions Panel */}
                        <motion.div 
                             initial={{ opacity: 0, y: 10 }}
                             animate={{ opacity: 1, y: 0 }}
                             transition={{ delay: 0.2 }}
                             className="bg-[#0e141f] border border-slate-800 rounded-xl p-6"
                        >
                            <h3 className="text-lg text-white font-medium mb-4 flex items-center gap-2">
                                <Target className="w-5 h-5 text-amber-500" />
                                Tier 1 Target Universities
                            </h3>
                            <div className="space-y-3">
                                {pathwayData.target_institutions.map((inst: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-slate-900/50 hover:bg-slate-800/60 transition duration-200 border border-transparent hover:border-slate-700">
                                        <div>
                                            <h4 className="text-slate-200 font-medium">{inst.name}</h4>
                                            <div className="flex gap-3 text-xs text-slate-400 mt-1 font-mono">
                                                <span>Cutoff: {inst.gpa_cutoff}</span>
                                                {inst.mcat_requirements && <span>MCAT: {inst.mcat_requirements}</span>}
                                                {inst.casper_weight && <span className="text-amber-400/80">CASPer: {inst.casper_weight}</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: MCAT Engine & Anki */}
                    <div className="space-y-6">
                        
                        {/* MCAT Goal Tracker */}
                        <motion.div 
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-[#0e141f] border border-slate-800 rounded-xl p-6"
                        >
                             <h3 className="text-lg text-white font-medium mb-4 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-emerald-400" />
                                MCAT Velocity
                            </h3>

                            <div className="mb-6 flex justify-between items-end border-b border-slate-800 pb-4">
                                <div>
                                    <span className="text-sm text-slate-400 block mb-1">Target Score</span>
                                    <span className="text-4xl text-emerald-400 font-light">{pathwayData.standardized_testing.mcat.target_score}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-slate-500 font-mono">CHEM: {pathwayData.standardized_testing.mcat.sections.chem_phys}</span><br/>
                                    <span className="text-xs text-slate-500 font-mono">CARS: {pathwayData.standardized_testing.mcat.sections.cars}</span><br/>
                                    <span className="text-xs text-slate-500 font-mono">BIO: {pathwayData.standardized_testing.mcat.sections.bio_biochem}</span><br/>
                                    <span className="text-xs text-slate-500 font-mono">PSYC: {pathwayData.standardized_testing.mcat.sections.psych_soc}</span>
                                </div>
                            </div>

                            {/* Automated Anki Generator Trigger */}
                            <div className="bg-emerald-900/10 rounded-lg p-4 border border-emerald-500/20">
                                <h4 className="text-sm font-medium text-emerald-300 mb-2 flex items-center gap-2">
                                    <Zap className="w-4 h-4" />
                                    AILCC Anki Generator
                                </h4>
                                <p className="text-xs text-slate-400 mb-4">
                                    Parse the active textbook PDF in OneDrive via the Multi-Shot LLM Gateway to generate high-yield MCAT flashcards.
                                </p>
                                
                                <button 
                                    onClick={triggerAnkiGenerator}
                                    disabled={generatingAnki}
                                    className={`w-full py-2.5 rounded text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2
                                        ${generatingAnki 
                                            ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700' 
                                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'}
                                    `}
                                >
                                    {generatingAnki ? (
                                        <><Activity className="w-4 h-4 animate-spin" /> Deep Extracting...</>
                                    ) : (
                                        <><Download className="w-4 h-4" /> Execute Deck Generation</>
                                    )}
                                </button>

                                <AnimatePresence>
                                    {ankiStatus && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-3 text-xs font-mono text-emerald-400 flex items-start gap-1 p-2 bg-black/30 rounded border border-emerald-500/20"
                                        >
                                            <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                            <span>{ankiStatus}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>

                        {/* CASPer Behavioral Simulator */}
                        <motion.div 
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-[#0e141f] border border-slate-800 rounded-xl p-6"
                        >
                            <h3 className="text-lg text-white font-medium mb-4 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-purple-400" />
                                CASPer Simulator
                            </h3>
                            
                            {!casperScenario ? (
                                <div className="text-center py-6">
                                    <button 
                                        onClick={triggerCasperScenario}
                                        disabled={isGeneratingScenario}
                                        className="px-4 py-2 bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg transition-all text-sm font-medium"
                                    >
                                        {isGeneratingScenario ? "Forging Scenario..." : "Start Ethical Dilemma"}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 text-sm text-slate-300 italic border-l-2 border-l-purple-500">
                                        "{casperScenario}"
                                    </div>

                                    {!casperGrade ? (
                                        <div className="space-y-3">
                                            <textarea 
                                                value={casperResponse}
                                                onChange={(e) => setCasperResponse(e.target.value)}
                                                placeholder="Type your response or trigger Voice Mode (Beta)..."
                                                className="w-full bg-[#0a0f16] border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors h-24 custom-scrollbar"
                                            />
                                            <button 
                                                onClick={submitCasperResponse}
                                                disabled={isEvaluating || !casperResponse}
                                                className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isEvaluating ? "Evaluating Rubric..." : "Submit Response"}
                                            </button>
                                        </div>
                                    ) : (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-purple-900/10 border border-purple-500/20 p-4 rounded-lg space-y-3"
                                        >
                                            <div className="flex justify-between items-center text-xs font-mono text-purple-300 pb-2 border-b border-purple-500/20">
                                                <span>Empathy: {casperGrade.Empathy}/10</span>
                                                <span>Prof: {casperGrade.Professionalism}/10</span>
                                                <span>Comm: {casperGrade.Communication}/10</span>
                                            </div>
                                            <p className="text-sm text-slate-300">
                                                <span className="text-purple-400 font-medium">Feedback: </span>
                                                {casperGrade.Feedback}
                                            </p>
                                            <button 
                                                onClick={() => setCasperScenario(null)}
                                                className="text-xs text-purple-400 hover:text-purple-300 font-medium tracking-wide uppercase"
                                            >
                                                Next Scenario →
                                            </button>
                                        </motion.div>
                                    )}
                                </div>
                            )}
                        </motion.div>

                    </div>
                </div>
            </main>
        </div>
    );
}
