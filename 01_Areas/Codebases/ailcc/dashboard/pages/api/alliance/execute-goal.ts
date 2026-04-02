import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

    const { goal, maxSteps = 5 } = req.body;
    if (!goal) return res.status(400).json({ error: 'goal is required' });

    const results: any[] = [];
    let currentTask = goal;
    let stepCount = 0;

    while (stepCount < maxSteps) {
        stepCount++;
        console.log(`[AutonomousLoop] Step ${stepCount} for Goal: ${goal.substring(0, 50)}`);

        try {
            const dispatchRes = await fetch('http://localhost:3000/api/alliance/dispatch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    task: `GOAL: ${goal}\\nCURRENT PROGRESS: ${JSON.stringify(results)}\\nNEXT ACTION? Please describe the next specific sub-task or respond with 'GOAL_COMPLETE' if finished.`,
                    agentOverride: 'general'
                })
            });

            if (!dispatchRes.ok) throw new Error('Dispatch failed');
            const data = await dispatchRes.json();

            results.push({
                step: stepCount,
                agent: data.agentType,
                response: data.response,
                thought: data.thought
            });

            if (data.response.includes('GOAL_COMPLETE')) break;

            // In a more advanced version, we would parse structured [ACTIONS] here.
            // For Level 8, we provide the conversational trace back to the loop.
            currentTask = data.response;

        } catch (error: any) {
            results.push({ step: stepCount, error: error.message });
            break;
        }
    }

    res.status(200).json({
        goal,
        status: stepCount < maxSteps ? 'completed' : 'exhausted',
        stepsTaken: stepCount,
        history: results
    });
}
