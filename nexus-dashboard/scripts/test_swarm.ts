import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000/api';
const API_KEY = 'antigravity_dev_key';

async function testSwarm() {
    console.log("Triggering Swarm Delegation...");

    try {
        const res = await fetch(`${API_BASE}/tasks/create`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-API-Key': API_KEY 
            },
            body: JSON.stringify({
                title: 'Project: SwarmAlpha',
                targetAgent: 'OmniRouter',
                priority: 'urgent',
                source: 'system'
            })
        });

        const data = await res.json();
        console.log("Task Created:", data);
        console.log("Check Dashboard for 'Research dependencies' and 'Implement core scaffold' tasks.");

    } catch (e) {
        console.error("Test Failed:", e);
    }
}

testSwarm();
