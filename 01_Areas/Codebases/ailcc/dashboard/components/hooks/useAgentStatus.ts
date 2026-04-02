import { useNeuralSync } from '../NeuralSyncProvider';

export function useAgentStatus() {
  const { agents, isConnected } = useNeuralSync();

  return {
    agents,
    loading: agents.length === 0 && !isConnected,
    error: !isConnected ? 'Neural Relay Disconnected' : null
  };
}
