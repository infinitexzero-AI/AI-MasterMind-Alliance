import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  scope?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Report to /api/errors for server-side logging
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        error: { message: error.message, stack: error.stack, name: error.name },
        componentStack: errorInfo.componentStack,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'SSR',
        url: typeof window !== 'undefined' ? window.location.href : '',
      }),
    }).catch(() => { /* fire and forget */ });
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/30 flex flex-col gap-4 items-start animate-fade-in">
          <div className="flex items-center gap-3 text-red-400">
            <AlertTriangle className="w-6 h-6" />
            <h2 className="text-lg font-bold">Component Crash: {this.props.scope || 'Unknown UI'}</h2>
          </div>
          <div className="p-4 bg-black/40 rounded-lg w-full overflow-x-auto border border-red-500/10">
            <code className="text-sm font-mono text-red-200">
              {this.state.error?.toString()}
            </code>
            {this.state.errorInfo && (
              <pre className="mt-2 text-xs text-red-300/50">
                {this.state.errorInfo.componentStack}
              </pre>
            )}
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors text-sm font-bold uppercase tracking-wider"
          >
            <RefreshCcw className="w-4 h-4" /> Retry Component
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
