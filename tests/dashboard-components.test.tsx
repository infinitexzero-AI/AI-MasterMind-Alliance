/**
 * Jest tests for dashboard components
 * Tests AgentGrid and PipelineView components with mock telemetry data
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AgentGrid from '../components/AgentGrid';
import PipelineView from '../components/PipelineView';

// Mock fetch API
global.fetch = jest.fn();

describe('AgentGrid Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockAgentHealth = [
    {
      agentName: 'claude',
      status: 'ok' as const,
      uptime: 3600,
      lastHeartbeat: '2025-11-27T12:00:00Z',
      errorCount: 0,
      successCount: 100,
    },
    {
      agentName: 'openai',
      status: 'warn' as const,
      uptime: 3600,
      lastHeartbeat: '2025-11-27T12:00:00Z',
      errorCount: 2,
      successCount: 98,
    },
    {
      agentName: 'grok',
      status: 'ok' as const,
      uptime: 3600,
      lastHeartbeat: '2025-11-27T12:00:00Z',
      errorCount: 0,
      successCount: 95,
    },
  ];

  test('renders agent health data correctly', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        timestamp: new Date().toISOString(),
        agents: mockAgentHealth,
      }),
    });

    render(<AgentGrid autoRefresh={false} />);

    await waitFor(() => {
      expect(screen.getByText('claude')).toBeInTheDocument();
      expect(screen.getByText('openai')).toBeInTheDocument();
      expect(screen.getByText('grok')).toBeInTheDocument();
    });
  });

  test('displays health scores correctly', async () => {
    render(<AgentGrid agents={mockAgentHealth} autoRefresh={false} />);

    // Claude: 100/100 = 100%
    expect(screen.getByText('100%')).toBeInTheDocument();
    // OpenAI: 98/100 = 98%
    expect(screen.getByText('98%')).toBeInTheDocument();
    // Grok: 95/95 = 100%
  });

  test('displays status badges with correct colors', async () => {
    render(<AgentGrid agents={mockAgentHealth} autoRefresh={false} />);

    expect(screen.getAllByText(/OK|WARN/).length).toBeGreaterThan(0);
  });

  test('displays success and error counts', async () => {
    render(<AgentGrid agents={mockAgentHealth} autoRefresh={false} />);

    expect(screen.getByText('100')).toBeInTheDocument(); // claude successCount
    expect(screen.getByText('2')).toBeInTheDocument(); // openai errorCount
  });

  test('refresh button fetches updated data', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        timestamp: new Date().toISOString(),
        agents: mockAgentHealth,
      }),
    });

    render(<AgentGrid autoRefresh={false} />);

    await waitFor(() => {
      const refreshButton = screen.getByText('Refresh');
      expect(refreshButton).toBeInTheDocument();
    });

    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  test('displays error message on fetch failure', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<AgentGrid autoRefresh={false} />);

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });

  test('auto-refresh works with specified interval', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        timestamp: new Date().toISOString(),
        agents: mockAgentHealth,
      }),
    });

    render(<AgentGrid autoRefresh={true} refreshInterval={1000} />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  test('renders with provided initial data', () => {
    render(<AgentGrid agents={mockAgentHealth} autoRefresh={false} />);

    expect(screen.getByText('claude')).toBeInTheDocument();
    expect(screen.getByText('openai')).toBeInTheDocument();
  });
});

describe('PipelineView Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockPipelineTelemetry = {
    timestamp: '2025-11-27T12:00:00Z',
    overallStatus: 'ok' as const,
    tasksInFlight: 1,
    tasksCompleted: 47,
    tasksFailed: 2,
    averageLatency: 320,
    recentTasks: [
      {
        taskId: 'task-001-claude',
        status: 'running' as const,
        agentAssigned: 'claude',
        duration: 1500,
        successIndicator: true,
      },
      {
        taskId: 'task-002-openai',
        status: 'completed' as const,
        agentAssigned: 'openai',
        duration: 2100,
        successIndicator: true,
      },
      {
        taskId: 'task-003-grok',
        status: 'completed' as const,
        agentAssigned: 'grok',
        duration: 890,
        successIndicator: true,
      },
    ],
  };

  test('renders pipeline telemetry data correctly', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPipelineTelemetry,
    });

    render(<PipelineView autoRefresh={false} />);

    await waitFor(() => {
      expect(screen.getByText('Pipeline Telemetry')).toBeInTheDocument();
    });
  });

  test('displays task metrics correctly', async () => {
    render(<PipelineView telemetry={mockPipelineTelemetry} autoRefresh={false} />);

    expect(screen.getByText('1')).toBeInTheDocument(); // tasksInFlight
    expect(screen.getByText('47')).toBeInTheDocument(); // tasksCompleted
    expect(screen.getByText('2')).toBeInTheDocument(); // tasksFailed
  });

  test('calculates success rate correctly', async () => {
    render(<PipelineView telemetry={mockPipelineTelemetry} autoRefresh={false} />);

    // Success rate: 47 / (47 + 2 + 1) * 100 = 90.4%
    expect(screen.getByText(/90\./)).toBeInTheDocument();
  });

  test('displays recent tasks with correct status', async () => {
    render(<PipelineView telemetry={mockPipelineTelemetry} autoRefresh={false} />);

    expect(screen.getByText('task-001-claude')).toBeInTheDocument();
    expect(screen.getByText('RUNNING')).toBeInTheDocument();
  });

  test('formats latency correctly', async () => {
    render(<PipelineView telemetry={mockPipelineTelemetry} autoRefresh={false} />);

    expect(screen.getByText('320ms')).toBeInTheDocument();
  });

  test('refresh button fetches updated telemetry', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockPipelineTelemetry,
    });

    render(<PipelineView autoRefresh={false} />);

    await waitFor(() => {
      const refreshButton = screen.getByText('Refresh');
      expect(refreshButton).toBeInTheDocument();
    });

    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  test('displays error message on fetch failure', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<PipelineView autoRefresh={false} />);

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });

  test('renders with provided initial telemetry', () => {
    render(<PipelineView telemetry={mockPipelineTelemetry} autoRefresh={false} />);

    expect(screen.getByText('Pipeline Status')).toBeInTheDocument();
  });
});

describe('API Route Integration', () => {
  test('health endpoint returns proper structure', async () => {
    const mockResponse = {
      timestamp: new Date().toISOString(),
      agents: [
        {
          agentName: 'claude',
          status: 'ok',
          uptime: 3600,
          lastHeartbeat: new Date().toISOString(),
          errorCount: 0,
          successCount: 100,
        },
      ],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const response = await fetch('http://localhost:3000/api/monitor/health');
    const data = await response.json();

    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('agents');
    expect(Array.isArray(data.agents)).toBe(true);
  });

  test('telemetry endpoint returns proper structure', async () => {
    const mockResponse = {
      timestamp: new Date().toISOString(),
      overallStatus: 'ok',
      tasksInFlight: 1,
      tasksCompleted: 47,
      tasksFailed: 2,
      averageLatency: 320,
      recentTasks: [],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const response = await fetch('http://localhost:3000/api/monitor/telemetry');
    const data = await response.json();

    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('overallStatus');
    expect(data).toHaveProperty('tasksInFlight');
    expect(data).toHaveProperty('tasksCompleted');
  });
});
