import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import permissions from '../../config/permissions.json';

type AppRole = 'COMMANDER' | 'OPERATOR' | 'OBSERVER' | 'GUEST';

interface AuthState {
  isAuthenticated: boolean;
  role: AppRole;
  domains: string[];
  actions: string[];
}

interface AuthContextType extends AuthState {
  login: (secret: string) => void;
  logout: () => void;
  hasAccess: (domain: string) => boolean;
  canExecute: (actionName: string) => boolean;
}

const defaultState: AuthState = {
  isAuthenticated: true,
  role: 'COMMANDER',
  domains: permissions.roles['COMMANDER'].domains,
  actions: permissions.roles['COMMANDER'].actions,
};

const AuthContext = createContext<AuthContextType>({
  ...defaultState,
  login: () => {},
  logout: () => {},
  hasAccess: () => false,
  canExecute: () => false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(defaultState);
  const router = useRouter();

  // Load from session storage on mount
  useEffect(() => {
    const savedRole = sessionStorage.getItem('ailcc_role') as AppRole;
    if (savedRole && permissions.roles[savedRole]) {
      setAuthState({
        isAuthenticated: true,
        role: savedRole,
        domains: permissions.roles[savedRole].domains,
        actions: permissions.roles[savedRole].actions,
      });
    }
  }, []);

  const login = (secret: string) => {
    // Hardcoded mock passcodes for now instead of a real DB
    let newRole: AppRole = 'GUEST';
    
    if (secret === 'infinite') newRole = 'COMMANDER';
    else if (secret === 'vanguard') newRole = 'OPERATOR';
    else if (secret === 'guest') newRole = 'OBSERVER';
    
    if (newRole !== 'GUEST') {
      sessionStorage.setItem('ailcc_role', newRole);
      setAuthState({
        isAuthenticated: true,
        role: newRole,
        domains: permissions.roles[newRole].domains,
        actions: permissions.roles[newRole].actions,
      });
      router.push('/');
    } else {
      alert("Invalid Clearance Code.");
    }
  };

  const logout = () => {
    sessionStorage.removeItem('ailcc_role');
    setAuthState(defaultState);
    router.push('/login');
  };

  const hasAccess = (domain: string) => authState.domains.includes(domain);
  const canExecute = (actionName: string) => authState.actions.includes(actionName);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, hasAccess, canExecute }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
