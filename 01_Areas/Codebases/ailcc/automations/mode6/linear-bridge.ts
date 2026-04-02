
// @ts-ignore
import { LinearClient } from '@linear/sdk';
// @ts-ignore
import fetch from 'node-fetch';

const linear = new LinearClient({ apiKey: process.env.LINEAR_API_KEY });
const CORTEX_URL = 'http://localhost:3000/api/cortex/plan';

async function bridgeLinearToCortex() {
    console.log('🌉 Bridging Linear -> Cortex...');

    // 1. Fetch Issues tagged "UI" or "Cortex"
    const issues = await linear.issues({
        filter: {
            labels: { name: { in: ['UI', 'Cortex'] } },
            state: { name: { eq: 'Todo' } }
        },
        first: 5
    });

    if (issues.nodes.length === 0) {
        console.log('✅ No pending UI/Cortex issues found.');
        return;
    }

    // 2. Send to Cortex
    for (const issue of issues.nodes) {
        console.log(`🤖 Processing: [${issue.identifier}] ${issue.title}`);

        try {
            const response = await fetch(CORTEX_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    intent: `Fix Issue ${issue.identifier}: ${issue.title}\n\n${issue.description}`
                })
            });

            const plan = await response.json();
            console.log(`✅ Plan generated for ${issue.identifier}:`, plan);

            // Note: Auto-execution would happen here if fully autonomous
        } catch (error) {
            console.error(`❌ Failed to process ${issue.identifier}:`, error);
        }
    }
}

bridgeLinearToCortex();
