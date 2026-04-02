/* eslint-disable */
/**
 * DelegationManager.js
 * 
 * Orchestrates task distribution among the Swarm agents.
 * Connects to:
 * - Local Task Queue (JSON/Redis)
 * - Agent APIs (Comet, Claude, OpenAI)
 */

const fs = require('fs');
const path = require('path');

class DelegationManager {
    constructor() {
        this.agents = {
            'Claude Desktop': { capability: ['ARCHITECT', 'CODE', 'ANALYSIS'], load: 0 },
            'ChatGPT': { capability: ['CODE', 'ORCHESTRATION', 'GENERATION'], load: 0 },
            'Comet (Perplexity)': { capability: ['RESEARCH', 'SEARCH'], load: 0 },
            'Grok': { capability: ['STRATEGY', 'LOGIC'], load: 0 }
        };
        this.queuePath = path.join(__dirname, '../../dashboard/public/data/task_queue.json');
    }

    /**
     * Assigns a task to the most suitable agent based on capability and load.
     * @param {Object} task - { id, title, type, priority }
     */
    delegate(task) {
        // Simple Round-Robin / Capability match logic
        const suitableAgents = Object.entries(this.agents).filter(([_name, profile]) => 
            profile.capability.includes(task.type)
        );

        if (suitableAgents.length === 0) {
            console.warn(`No suitable agent found for task type: ${task.type}`);
            return null;
        }

        // Sort by load (ascending)
        suitableAgents.sort((a, b) => a[1].load - b[1].load);
        
        const selectedAgent = suitableAgents[0][0];
        this.agents[selectedAgent].load++;
        
        return {
            taskId: task.id,
            assignedTo: selectedAgent,
            timestamp: new Date().toISOString(),
            status: 'ASSIGNED'
        };
    }

    loadQueue() {
        if (fs.existsSync(this.queuePath)) {
            return JSON.parse(fs.readFileSync(this.queuePath, 'utf8'));
        }
        return [];
    }
}

module.exports = DelegationManager;
