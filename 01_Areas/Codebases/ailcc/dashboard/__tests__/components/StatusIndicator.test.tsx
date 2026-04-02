import React from 'react';
import { render, screen } from '@testing-library/react';
import StatusIndicator from '../../components/StatusIndicator';

// Mock Tooltip to avoid async rendering issues in unit tests
jest.mock('../../components/Tooltip', () => ({
    __esModule: true,
    default: ({ children, content }: { children: React.ReactNode, content: string }) => (
        <div data-testid="mock-tooltip" title={content}>{children}</div>
    ),
}));

describe('StatusIndicator', () => {
    it('renders with label', () => {
        render(<StatusIndicator status="healthy" label="System OK" />);
        expect(screen.getByText('System OK')).toBeInTheDocument();
    });

    it('applies correct healthy color classes', () => {
        render(<StatusIndicator status="healthy" label="Online" />);
        const label = screen.getByText('Online');
        expect(label).toHaveClass('text-emerald-400');
    });

    it('renders tooltip when provided', () => {
        render(<StatusIndicator status="degraded" label="DB Syncing" tooltip="15 minutes behind" />);
        const tooltip = screen.getByTestId('mock-tooltip');
        expect(tooltip).toBeInTheDocument();
        expect(tooltip).toHaveAttribute('title', '15 minutes behind');
    });
});
