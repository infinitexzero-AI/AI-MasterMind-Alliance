import Head from 'next/head'
import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { NeuralSyncProvider } from '../components/NeuralSyncProvider'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { useSocket } from '../lib/socket'
import { Suspense, useEffect } from 'react'
import { SkeletonTacticsHUD } from '../components/SkeletonLoaders'
import { startEventBridge } from '../lib/event-bus-bridge'
import { ToastProvider } from '../components/Toast'
import { StealthModeProvider } from '../components/StealthModeProvider'
import { AuthProvider } from '../src/contexts/AuthContext'
import { AuthGate } from '../components/AuthGate'

// TanStack React Query Telemetry
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Disable aggressive polling to preserve backend daemon pipelines
      retry: 1, // Only retry once gracefully before failing out to the Degraded UI State
    },
  },
})

export default function App({ Component, pageProps }: AppProps) {
  // Initialize Sovereign Socket Bridge globally
  useSocket();

  useEffect(() => {
    // 🧠 Initialize Neural Uplink Bridge — routes all AILCC events to window listeners
    startEventBridge();
  }, []);

  return (
    <ErrorBoundary>
      <Head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </Head>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NeuralSyncProvider>
            <StealthModeProvider>
              <ToastProvider>
                <AuthGate>
                  <Suspense fallback={<SkeletonTacticsHUD />}>
                    <Component {...pageProps} />
                  </Suspense>
                </AuthGate>
              </ToastProvider>
            </StealthModeProvider>
          </NeuralSyncProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
