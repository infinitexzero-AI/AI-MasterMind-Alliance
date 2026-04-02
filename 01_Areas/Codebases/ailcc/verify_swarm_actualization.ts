import { SwarmOrchestrator } from './automations/mode6/swarm/orchestrator';
import { SwarmFeedback } from './automations/mode6/swarm/types';
import { AgentType, TaskIntent, ExecutionResult } from './automations/mode6/intent-router/types';

async function verifySwarm() {
    console.log("--- Swarm Actualization Verification ---");
    console.log("Current working directory:", process.cwd());
    const orchestrator = new SwarmOrchestrator();

    // Mock core.processTask to avoid real API calls during verification
    // Bypassing private 'core' property for testing purposes
    (orchestrator as unknown as { core: { processTask: (intent: TaskIntent) => Promise<ExecutionResult> } }).core.processTask = async (intent: TaskIntent): Promise<ExecutionResult> => {
        console.log(`[Mock Core] Processing: ${intent.description}`);
        if (intent.id.startsWith('plan-')) {
            return {
                taskId: intent.id,
                agent: 'openai' as AgentType,
                status: 'completed',
                output: JSON.stringify([
                    { description: "Scout research on dead code", agent: "comet", requiresApproval: false },
                    { description: "Refactor identified modules", agent: "claude", requiresApproval: true }
                ]),
                timestamp: new Date().toISOString(),
                metadata: { executionTime: 100, tokensUsed: 50, errors: [] }
            };
        }
        return {
            taskId: intent.id,
            agent: 'claude' as AgentType,
            status: 'completed',
            output: "Mock execution result",
            timestamp: new Date().toISOString(),
            metadata: { executionTime: 50, tokensUsed: 20, errors: [] }
        };
    };

    // 1. Initiate Swarm with a goal
    const goal = "Analyze the codebase for dead code and propose a cleanup plan.";
    console.log(`Initiating swarm for: ${goal}`);
    const session = await orchestrator.initiateSwarm(goal);
    console.log(`Session ID: ${session.id}, Status: ${session.status}`);
    console.log(`Initial Steps: ${session.steps.length}`);

    // 2. Poll for plan generation
    if (session.status === 'AWAITING_REVIEW' && session.steps.length > 0) {
        console.log("Plan generated successfully.");
        session.steps.forEach(s => console.log(` - [${s.targetAgent}] ${s.description} (Approval: ${s.requiresApproval})`));
    } else {
        console.error("Plan generation failed or status unexpected:", session.status);
        return;
    }

    // 3. Provide approval for the NEXT step (the one that requires it)
    const stepToApprove = session.steps.find(s => s.requiresApproval);
    if (stepToApprove) {
        console.log(`Approving step: ${stepToApprove.id}`);
        const feedback: SwarmFeedback = {
            stepId: stepToApprove.id,
            approved: true,
            comment: "Proceed with research."
        };
        await orchestrator.provideReview(session.id, feedback);
    } else {
        console.log("No steps require approval. Starting execution...");
        await orchestrator.executeSwarm(session.id);
    }

    // 4. Final status check
    const finalSession = orchestrator.getSession(session.id);
    console.log(`Final Session Status: ${finalSession?.status}`);
    if (finalSession?.status === 'COMPLETED') {
        console.log("VERIFICATION SUCCESS: Swarm logic is functional.");
    } else {
        console.log(`VERIFICATION INCOMPLETE: Current status is ${finalSession?.status}`);
        // If it's EXECUTING, we might need to wait, but in our mock it should be immediate
    }
}

verifySwarm().catch(console.error);
