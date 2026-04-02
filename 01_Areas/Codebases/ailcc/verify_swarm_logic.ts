import { SwarmOrchestrator } from './automations/mode6/swarm/orchestrator';

async function verify() {
    console.log('--- Swarm Orchestrator Verification ---');
    const orchestrator = new SwarmOrchestrator();

    console.log('1. Initiating Swarm...');
    const goal = 'Optimize system registry and implement monitoring';
    const session = await orchestrator.initiateSwarm(goal);

    console.log(`Session ID: ${session.id}`);
    console.log(`Status: ${session.status}`);
    console.log(`Steps Generated: ${session.steps.length}`);
    session.steps.forEach((s, i) => {
        console.log(`  Step ${i + 1}: ${s.description} (Agent: ${s.targetAgent}, HITL: ${s.requiresApproval})`);
    });

    if (session.status === 'AWAITING_REVIEW') {
        console.log('\n2. Simulating Human Approval for Implementation Step...');
        const implementationStep = session.steps.find(s => s.requiresApproval);
        if (implementationStep) {
            const updated = await orchestrator.provideReview(session.id, {
                stepId: implementationStep.id,
                approved: true,
                comment: 'Plan approved. Execute.'
            });
            console.log(`Updated Step Status: ${updated.steps.find(s => s.id === implementationStep.id)?.status}`);
            console.log(`Session Status: ${updated.status}`);
        }
    }

    console.log('\n--- Verification Complete ---');
}

verify().catch(console.error);
