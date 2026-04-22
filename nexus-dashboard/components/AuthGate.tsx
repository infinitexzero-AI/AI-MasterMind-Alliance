import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../src/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  
  // We need to wait for hydration/mounting before doing route checks to prevent mismatch
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (!isAuthenticated && router.pathname !== '/login') {
        router.push('/login');
      } else if (isAuthenticated && router.pathname === '/login') {
        router.push('/');
      }
    }
  }, [mounted, isAuthenticated, router.pathname, router]);

  if (!mounted) {
    return (
        <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center">
             <Loader2 className="w-12 h-12 text-cyan-500 animate-spin opacity-50 mb-4" />
             <span className="font-mono text-xs uppercase tracking-widest text-slate-500">Establishing Initial Handshake...</span>
        </div>
    );
  }

  // If unauthenticated and not on the login page (yet to be redirected), don't render children
  if (!isAuthenticated && router.pathname !== '/login') {
    return null;
  }

  return <>{children}</>;
};
