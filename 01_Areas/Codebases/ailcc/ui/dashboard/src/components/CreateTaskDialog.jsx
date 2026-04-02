import { useState, useEffect } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { cortexAPI } from '../services/cortexAPI';

export const CreateTaskDialog = ({ isOpen, onClose, onTaskCreated }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 2,
        teamId: '',
        projectId: '',
        assigneeId: '',
        labelIds: []
    });

    const [metadata, setMetadata] = useState({
        teams: [],
        projects: [],
        labels: [],
        users: []
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Load metadata when dialog opens
    useEffect(() => {
        if (isOpen) {
            loadMetadata();
        }
    }, [isOpen]);

    // Load projects when team changes
    useEffect(() => {
        if (formData.teamId) {
            loadTeamData(formData.teamId);
        }
    }, [formData.teamId]);

    const loadMetadata = async () => {
        try {
            const teams = await cortexAPI.getLinearTeams();
            setMetadata(prev => ({ ...prev, teams: teams.teams || [] }));

            // Auto-select first team if only one
            if (teams.teams && teams.teams.length === 1) {
                setFormData(prev => ({ ...prev, teamId: teams.teams[0].id }));
            }
        } catch (err) {
            console.error('Failed to load metadata:', err);
            setError('Failed to load Linear metadata');
        }
    };

    const loadTeamData = async (teamId) => {
        try {
            const [projects, labels, users] = await Promise.all([
                cortexAPI.getLinearProjects(teamId),
                cortexAPI.getLinearLabels(teamId),
                cortexAPI.getLinearUsers(teamId)
            ]);

            setMetadata(prev => ({
                ...prev,
                projects: projects.projects || [],
                labels: labels.labels || [],
                users: users.users || []
            }));
        } catch (err) {
            console.error('Failed to load team data:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            setError('Title is required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await cortexAPI.createLinearIssue(formData);

            if (result.status === 'success') {
                onTaskCreated(result.issue);
                handleClose();
            } else {
                setError(result.message || 'Failed to create task');
            }
        } catch (err) {
            setError(err.message || 'Failed to create task');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            title: '',
            description: '',
            priority: 2,
            teamId: '',
            projectId: '',
            assigneeId: '',
            labelIds: []
        });
        setError('');
        onClose();
    };

    const handleLabelToggle = (labelId) => {
        setFormData(prev => ({
            ...prev,
            labelIds: prev.labelIds.includes(labelId)
                ? prev.labelIds.filter(id => id !== labelId)
                : [...prev.labelIds, labelId]
        }));
    };

    const priorityOptions = [
        { value: 0, label: 'None', color: 'text-slate-500' },
        { value: 1, label: 'Low', color: 'text-blue-400' },
        { value: 2, label: 'Medium', color: 'text-yellow-400' },
        { value: 3, label: 'High', color: 'text-orange-400' },
        { value: 4, label: 'Urgent', color: 'text-red-400' }
    ];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Dialog */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-[#0a0a10] border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/10">
                        <h2 className="text-xl font-bold font-orbitron text-green-400">CREATE TASK</h2>
                        <button
                            onClick={handleClose}
                            className="text-slate-500 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                        {/* Error Alert */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Title */}
                        <div className="mb-4">
                            <label className="block text-xs text-slate-400 font-mono mb-2">
                                TITLE *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter task title..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-slate-600 focus:border-green-500/50 focus:outline-none"
                                autoFocus
                            />
                        </div>

                        {/* Description */}
                        <div className="mb-4">
                            <label className="block text-xs text-slate-400 font-mono mb-2">
                                DESCRIPTION (Markdown supported)
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Enter task description..."
                                rows={4}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-slate-600 focus:border-green-500/50 focus:outline-none resize-none"
                            />
                        </div>

                        {/* Priority */}
                        <div className="mb-4">
                            <label className="block text-xs text-slate-400 font-mono mb-2">
                                PRIORITY
                            </label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-green-500/50 focus:outline-none"
                            >
                                {priorityOptions.map(opt => (
                                    <option key={opt.value} value={opt.value} className="bg-[#0a0a10]">
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Team */}
                        <div className="mb-4">
                            <label className="block text-xs text-slate-400 font-mono mb-2">
                                TEAM
                            </label>
                            <select
                                value={formData.teamId}
                                onChange={(e) => setFormData({ ...formData, teamId: e.target.value, projectId: '', assigneeId: '', labelIds: [] })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-green-500/50 focus:outline-none"
                            >
                                <option value="" className="bg-[#0a0a10]">Select team...</option>
                                {metadata.teams.map(team => (
                                    <option key={team.id} value={team.id} className="bg-[#0a0a10]">
                                        {team.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Project */}
                        {formData.teamId && (
                            <div className="mb-4">
                                <label className="block text-xs text-slate-400 font-mono mb-2">
                                    PROJECT (Optional)
                                </label>
                                <select
                                    value={formData.projectId}
                                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-green-500/50 focus:outline-none"
                                >
                                    <option value="" className="bg-[#0a0a10]">No project</option>
                                    {metadata.projects.filter(p => p.state !== 'archived').map(project => (
                                        <option key={project.id} value={project.id} className="bg-[#0a0a10]">
                                            {project.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Assignee */}
                        {formData.teamId && (
                            <div className="mb-4">
                                <label className="block text-xs text-slate-400 font-mono mb-2">
                                    ASSIGNEE (Optional)
                                </label>
                                <select
                                    value={formData.assigneeId}
                                    onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-green-500/50 focus:outline-none"
                                >
                                    <option value="" className="bg-[#0a0a10]">Unassigned</option>
                                    {metadata.users.map(user => (
                                        <option key={user.id} value={user.id} className="bg-[#0a0a10]">
                                            {user.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Labels */}
                        {formData.teamId && metadata.labels.length > 0 && (
                            <div className="mb-4">
                                <label className="block text-xs text-slate-400 font-mono mb-2">
                                    LABELS (Optional)
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {metadata.labels.map(label => (
                                        <button
                                            key={label.id}
                                            type="button"
                                            onClick={() => handleLabelToggle(label.id)}
                                            className={clsx(
                                                "px-3 py-1 text-xs rounded-full font-mono transition-all",
                                                formData.labelIds.includes(label.id)
                                                    ? "bg-green-500/20 text-green-400 border border-green-500/50"
                                                    : "bg-white/5 text-slate-400 border border-white/10 hover:border-white/20"
                                            )}
                                        >
                                            {label.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </form>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-mono text-slate-400 hover:text-white transition-colors"
                        >
                            CANCEL
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !formData.title.trim()}
                            className={clsx(
                                "px-6 py-2 rounded-lg text-sm font-mono font-bold transition-all flex items-center gap-2",
                                loading || !formData.title.trim()
                                    ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                                    : "bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30"
                            )}
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
                                    CREATING...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    CREATE TASK
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
