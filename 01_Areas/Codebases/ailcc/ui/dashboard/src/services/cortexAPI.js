// API Service for Cortex Backend
const API_BASE = 'http://localhost:8000';

export const cortexAPI = {
    // Get system status
    async getStatus() {
        const response = await fetch(`${API_BASE}/`);
        return response.json();
    },

    // Get analytics data
    async getAnalytics() {
        const response = await fetch(`${API_BASE}/api/analytics`);
        return response.json();
    },

    // Get recent activity
    async getRecentActivity(limit = 20) {
        const response = await fetch(`${API_BASE}/api/activity/recent?limit=${limit}`);
        return response.json();
    },

    // Agent chat
    async sendMessage(message) {
        const response = await fetch(`${API_BASE}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        return response.json();
    },

    // Get recent files
    async getRecentFiles(limit = 10) {
        const response = await fetch(`${API_BASE}/api/files/recent?limit=${limit}`);
        return response.json();
    },

    // Navigate (existing)
    async navigate(payload) {
        const response = await fetch(`${API_BASE}/navigate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'BROWSE', target: 'USER_CMD', payload })
        });
        return response.json();
    },

    // --- AGENT REGISTRY ---
    async getAgents() {
        const response = await fetch(`${API_BASE}/api/agents/`);
        return response.json();
    },

    async getAgent(agentId) {
        const response = await fetch(`${API_BASE}/api/agents/${agentId}`);
        return response.json();
    },

    async getAgentsByPlatform(platform) {
        const response = await fetch(`${API_BASE}/api/agents/platform/${platform}`);
        return response.json();
    },

    async getAgentsByStatus(status) {
        const response = await fetch(`${API_BASE}/api/agents/status/${status}`);
        return response.json();
    },

    // --- LINEAR INTEGRATION ---
    async getLinearData() {
        const response = await fetch(`${API_BASE}/api/linear/extract`);
        return response.json();
    },

    // --- AGENT HEALTH ---
    async getAgentHealth() {
        const response = await fetch(`${API_BASE}/api/agents/health/all`);
        return response.json();
    },

    async getAgentHealthById(agentId) {
        const response = await fetch(`${API_BASE}/api/agents/health/agent/${agentId}`);
        return response.json();
    },

    async pingAgent(agentId) {
        const response = await fetch(`${API_BASE}/api/agents/${agentId}/ping`, {
            method: 'POST'
        });
        return response.json();
    },

    async getUnhealthyAgents() {
        const response = await fetch(`${API_BASE}/api/agents/unhealthy/list`);
        return response.json();
    },

    // --- LINEAR TASK CREATION ---
    async createLinearIssue(taskData) {
        const response = await fetch(`${API_BASE}/api/linear/issues/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });
        return response.json();
    },

    async getLinearTeams() {
        const response = await fetch(`${API_BASE}/api/linear/teams`);
        return response.json();
    },

    async getLinearProjects(teamId) {
        const url = teamId
            ? `${API_BASE}/api/linear/projects?team_id=${teamId}`
            : `${API_BASE}/api/linear/projects`;
        const response = await fetch(url);
        return response.json();
    },

    async getLinearLabels(teamId) {
        const url = teamId
            ? `${API_BASE}/api/linear/labels?team_id=${teamId}`
            : `${API_BASE}/api/linear/labels`;
        const response = await fetch(url);
        return response.json();
    },

    async getLinearUsers(teamId) {
        const url = teamId
            ? `${API_BASE}/api/linear/users?team_id=${teamId}`
            : `${API_BASE}/api/linear/users`;
        const response = await fetch(url);
        return response.json();
    },

    // --- AGENT ANALYTICS ---
    async getAnalytics(days = 7) {
        const response = await fetch(`${API_BASE}/api/analytics/all?days=${days}`);
        return response.json();
    },

    async getAgentAnalytics(agentId, days = 7) {
        const response = await fetch(`${API_BASE}/api/analytics/agent/${agentId}?days=${days}`);
        const data = await response.json();
        return data.analytics;
    },

    async getAnalyticsTrends(agentId = null, days = 7) {
        const url = agentId
            ? `${API_BASE}/api/analytics/trends?agent_id=${agentId}&days=${days}`
            : `${API_BASE}/api/analytics/trends?days=${days}`;
        const response = await fetch(url);
        return response.json();
    },

    async recordTaskCompletion(agentId, taskType, durationMs, success = true) {
        const response = await fetch(`${API_BASE}/api/analytics/record`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                agent_id: agentId,
                task_type: taskType,
                duration_ms: durationMs,
                success
            })
        });
        return response.json();
    },

    // --- TASK ASSIGNMENTS ---
    async assignTask(taskId, taskTitle, agentId, taskUrl = null, priority = 2) {
        const response = await fetch(`${API_BASE}/api/assignments/assign`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                task_id: taskId,
                task_title: taskTitle,
                agent_id: agentId,
                task_url: taskUrl,
                priority
            })
        });
        return response.json();
    },

    async updateAssignmentStatus(taskId, status, notes = null) {
        const response = await fetch(`${API_BASE}/api/assignments/update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                task_id: taskId,
                status,
                notes
            })
        });
        return response.json();
    },

    async getAgentAssignments(agentId, includeCompleted = false) {
        const url = `${API_BASE}/api/assignments/agent/${agentId}?include_completed=${includeCompleted}`;
        const response = await fetch(url);
        return response.json();
    },

    async getAllAssignments(status = null) {
        const url = status
            ? `${API_BASE}/api/assignments/all?status=${status}`
            : `${API_BASE}/api/assignments/all`;
        const response = await fetch(url);
        return response.json();
    },

    async getAgentWorkload(agentId = null) {
        const url = agentId
            ? `${API_BASE}/api/assignments/workload?agent_id=${agentId}`
            : `${API_BASE}/api/assignments/workload`;
        const response = await fetch(url);
        return response.json();
    },

    async unassignTask(taskId) {
        const response = await fetch(`${API_BASE}/api/assignments/unassign/${taskId}`, {
            method: 'DELETE'
        });
        return response.json();
    },

    // --- CHAT HISTORY ---
    async saveChatMessage(agentId, message, role = 'user', metadata = null) {
        const response = await fetch(`${API_BASE}/api/chat/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                agent_id: agentId,
                message,
                role,
                metadata
            })
        });
        return response.json();
    },

    async getAgentChat(agentId, limit = 100, offset = 0) {
        const url = `${API_BASE}/api/chat/agent/${agentId}?limit=${limit}&offset=${offset}`;
        const response = await fetch(url);
        return response.json();
    },

    async getAllChat(limit = 100, offset = 0, agentId = null) {
        let url = `${API_BASE}/api/chat/all?limit=${limit}&offset=${offset}`;
        if (agentId) url += `&agent_id=${agentId}`;
        const response = await fetch(url);
        return response.json();
    },

    async searchChat(query, agentId = null, limit = 50) {
        let url = `${API_BASE}/api/chat/search?query=${encodeURIComponent(query)}&limit=${limit}`;
        if (agentId) url += `&agent_id=${agentId}`;
        const response = await fetch(url);
        return response.json();
    },

    async getChatStats() {
        const response = await fetch(`${API_BASE}/api/chat/stats`);
        return response.json();
    },

    async exportChat(agentId = null, format = 'json') {
        let url = `${API_BASE}/api/chat/export?format=${format}`;
        if (agentId) url += `&agent_id=${agentId}`;
        const response = await fetch(url);
        return response.blob();
    },

    async deleteAgentChat(agentId) {
        const response = await fetch(`${API_BASE}/api/chat/agent/${agentId}`, {
            method: 'DELETE'
        });
        return response.json();
    },

    // --- BULK OPERATIONS ---
    async bulkPingAgents(agentIds) {
        const response = await fetch(`${API_BASE}/api/bulk/ping`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agent_ids: agentIds })
        });
        return response.json();
    },

    async bulkUpdateStatus(agentIds, status) {
        const response = await fetch(`${API_BASE}/api/bulk/update-status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agent_ids: agentIds, status })
        });
        return response.json();
    },

    async bulkResetErrors(agentIds) {
        const response = await fetch(`${API_BASE}/api/bulk/reset-errors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agent_ids: agentIds })
        });
        return response.json();
    }
};
