import { renderHook } from '@testing-library/react';
import { useAgentStatus } from '../../components/hooks/useAgentStatus';
import { useNeuralSync } from '../../components/NeuralSyncProvider';

// Mock useNeuralSync
jest.mock('../../components/NeuralSyncProvider', () => ({
    useNeuralSync: jest.fn(),
}));

describe('useAgentStatus', () => {
    it('returns loading state when disconnected and no agents', () => {
        (useNeuralSync as jest.Mock).mockReturnValue({
            agents: [],
            isConnected: false,
        });

        const { result } = renderHook(() => useAgentStatus());
        expect(result.current.loading).toBe(true);
        expect(result.current.error).toBe('Neural Relay Disconnected');
    });

    it('returns agents when connected', () => {
        const mockAgents = [{ id: 'agent-1', name: 'Test Agent', status: 'IDLE' }];
        (useNeuralSync as jest.Mock).mockReturnValue({
            agents: mockAgents,
            isConnected: true,
        });

        const { result } = renderHook(() => useAgentStatus());
        expect(result.current.loading).toBe(false);
        expect(result.current.agents).toEqual(mockAgents);
        expect(result.current.error).toBeNull();
    });
});
