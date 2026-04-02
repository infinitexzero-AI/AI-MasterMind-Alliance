import { SwarmOrchestrator } from '../automations/mode6/swarm/orchestrator';

describe('SwarmOrchestrator', () => {
    let orchestrator: SwarmOrchestrator;

    beforeEach(() => {
        orchestrator = new SwarmOrchestrator();
    });

    it('should initiate a swarm session with planning status', async () => {
        const goal = 'Implement a weather component';
        const session = await orchestrator.initiateSwarm(goal);

        expect(session).toBeDefined();
        expect(session.goal).toBe(goal);
        expect(session.status).toBe('AWAITING_REVIEW');
        expect(session.steps.length).toBeGreaterThan(0);
    });

    it('should handle human approval and advance session status', async () => {
        const goal = 'Code review task';
        const session = await orchestrator.initiateSwarm(goal);
        const stepId = session.steps[1].id; // The implementation step that requires approval

        const updatedSession = await orchestrator.provideReview(session.id, {
            stepId,
            approved: true,
            comment: 'Looks good, proceed.'
        });

        expect(updatedSession.steps.find(s => s.id === stepId)?.status).toBe('pending');
    });

    it('should handle rejection and halt session', async () => {
        const goal = 'Security audit';
        const session = await orchestrator.initiateSwarm(goal);
        const stepId = session.steps[1].id;

        const updatedSession = await orchestrator.provideReview(session.id, {
            stepId,
            approved: false,
            comment: 'Too risky.'
        });

        expect(updatedSession.status).toBe('FAILED');
    });
});
