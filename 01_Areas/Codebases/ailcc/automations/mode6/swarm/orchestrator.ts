// [AILCC_SYNC_VERIFIED_V2]
import { randomUUID } from 'crypto';

import { SwarmSession, SwarmStep, SwarmFeedback } from './types';
import { Mode6Orchestrator } from '../index';
import { TaskIntent } from '../intent-router/types';

export class SwarmOrchestrator {
    private sessions: Map<string, SwarmSession> = new Map();
    private core: Mode6Orchestrator;

    constructor() {
        this.core = new Mode6Orchestrator();
    }

    /**
     * Start a new Swarm integration session
     */
    async initiateSwarm(goal: string): Promise<SwarmSession> {
        const sessionId = randomUUID();
        const session: SwarmSession = {
            id: sessionId,
            goal,
            status: 'PLANNING',
            steps: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            metrics: {
                totalCost: 0,
                dailyBudget: 10,
                agentCosts: [],
                workloads: []
            },
            errors: []
        };

        this.sessions.set(sessionId, session);

        // Initial planning phase
        await this.generatePlan(sessionId);

        return session;
    }

    /**
     * Use a primary agent to decompose the goal into steps
     */
    private async generatePlan(sessionId: string): Promise<void> {
        const session = this.sessions.get(sessionId);
        if (!session) return;

        console.log(`[Swarm] Planning session ${sessionId}: ${session.goal}`);

        // Construct planning intent
        const planningIntent: TaskIntent = {
            id: `plan-${sessionId}`,
            description: `Decompose this goal into a sequence of actionable steps for a multi-agent swarm. 
            Goal: "${session.goal}"
            
            Return ONLY a valid JSON array of objects:
            [{ "description": string, "agent": "claude"|"grok"|"openai"|"comet", "requiresApproval": boolean }]`,
            priority: 'high',
            mode: 'mode-6',
            createdAt: new Date().toISOString()
        };

        try {
            const result = await this.core.processTask(planningIntent);

            // Extract and parse steps from result.output
            let rawOutput = result.output;
            if (typeof rawOutput === 'string') {
                // Handle potential markdown wrapping
                const jsonMatch = rawOutput.match(/\[[\s\S]*\]/);
                if (jsonMatch) rawOutput = jsonMatch[0];
                rawOutput = JSON.parse(rawOutput);
            }

            if (Array.isArray(rawOutput)) {
                session.steps = rawOutput.map((s: any) => ({
                    id: randomUUID(),
                    description: s.description,
                    targetAgent: s.agent,
                    status: 'pending',
                    requiresApproval: s.requiresApproval || false,
                    dependencies: []
                }));
                session.status = 'AWAITING_REVIEW';
            } else {
                throw new Error('Invalid plan format received');
            }

            session.updatedAt = new Date().toISOString();

        } catch (error) {
            session.status = 'FAILED';
            console.error('[Swarm] Planning failed:', error);
        }
    }

    /**
     * Execute the swarm steps in sequence
     */
    async executeSwarm(sessionId: string): Promise<void> {
        const session = this.sessions.get(sessionId);
        if (!session || session.status === 'FAILED') return;

        session.status = 'EXECUTING';

        for (const step of session.steps) {
            if (step.status === 'completed') continue;

            if (step.requiresApproval && step.status !== 'approved') {
                session.status = 'AWAITING_REVIEW';
                session.updatedAt = new Date().toISOString();
                return; // Pause execution for HITL
            }

            step.status = 'executing';
            session.updatedAt = new Date().toISOString();

            try {
                const intent: TaskIntent = {
                    id: step.id,
                    description: step.description,
                    priority: 'medium',
                    mode: 'mode-6',
                    createdAt: new Date().toISOString()
                };

                const result = await this.core.processTask(intent);
                step.status = result.status === 'completed' ? 'completed' : 'failed';
                step.output = result.output;

                if (step.status === 'failed') {
                    session.status = 'FAILED';
                    break;
                }
            } catch (error) {
                step.status = 'failed';
                session.status = 'FAILED';
                console.error(`[Swarm] Step execution failed: ${step.id}`, error);
                break;
            }
        }

        if (session.status !== 'FAILED' && session.steps.every(s => s.status === 'completed')) {
            session.status = 'COMPLETED';
        }

        session.updatedAt = new Date().toISOString();
    }

    /**
     * Submit human review for a pending step
     */
    async provideReview(sessionId: string, feedback: SwarmFeedback): Promise<SwarmSession> {
        const session = this.sessions.get(sessionId);
        if (!session) throw new Error('Session not found');

        const step = session.steps.find(s => s.id === feedback.stepId);
        if (!step) throw new Error('Step not found');

        if (feedback.approved) {
            step.status = 'approved';
            console.log(`[Swarm] Step ${step.id} approved.`);
            // Resume execution
            this.executeSwarm(sessionId).catch(e => console.error(e));
        } else {
            step.status = 'failed';
            session.status = 'FAILED';
            console.log(`[Swarm] Step ${step.id} rejected: ${feedback.comment}`);
        }

        session.updatedAt = new Date().toISOString();
        return session;
    }

    getSession(sessionId: string): SwarmSession | undefined {
        return this.sessions.get(sessionId);
    }
}
