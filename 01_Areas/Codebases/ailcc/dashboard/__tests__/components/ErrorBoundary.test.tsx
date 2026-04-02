import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '../../components/ErrorBoundary';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
    AlertTriangle: () => <div data-testid="alert-icon" />,
    RefreshCcw: () => <div data-testid="refresh-icon" />,
}));

// Suppress console.error for expected errors during test
const originalError = console.error;
beforeAll(() => {
    console.error = jest.fn();
});
afterAll(() => {
    console.error = originalError;
});

const ProblemComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) {
        throw new Error('Test crash');
    }
    return <div data-testid="recovered">Recovered</div>;
};

describe('ErrorBoundary', () => {
    // Mock fetch for the error reporting
    global.fetch = jest.fn(() =>
        Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true }),
        })
    ) as jest.Mock;

    it('renders children when no error occurs', () => {
        render(
            <ErrorBoundary>
                <div data-testid="safe-child">Safe</div>
            </ErrorBoundary>
        );
        expect(screen.getByTestId('safe-child')).toBeInTheDocument();
    });

    it('renders fallback UI when a child crashes', () => {
        render(
            <ErrorBoundary scope="Test Module">
                <ProblemComponent shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(screen.getByText(/Component Crash: Test Module/i)).toBeInTheDocument();
        expect(screen.getByText(/Test crash/i)).toBeInTheDocument();
        expect(global.fetch).toHaveBeenCalledWith('/api/errors', expect.any(Object));
    });

    it('resets error state when clicking retry and child succeeds', () => {
        const { rerender } = render(
            <ErrorBoundary>
                <ProblemComponent shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(screen.getByText(/Retry Component/i)).toBeInTheDocument();

        // Update the child to stop throwing
        rerender(
            <ErrorBoundary>
                <ProblemComponent shouldThrow={false} />
            </ErrorBoundary>
        );

        fireEvent.click(screen.getByText(/Retry Component/i));

        // After retry, it attempts to render children again, and they succeed
        expect(screen.queryByText(/Retry Component/i)).not.toBeInTheDocument();
        expect(screen.getByTestId('recovered')).toBeInTheDocument();
    });
});
