import React, { createContext, useContext, useState, useEffect } from 'react';

type ActiveTask = {
    id: string;
    title: string;
    source: string;
    status: string;
} | null;

interface ActiveTaskContextType {
    activeTask: ActiveTask;
    setActiveTask: (_task: ActiveTask) => void;
}

const ActiveTaskContext = createContext<ActiveTaskContextType | undefined>(undefined);

export const ActiveTaskProvider = ({ children }: { children: React.ReactNode }) => {
    const [activeTask, setActiveTask] = useState<ActiveTask>(null);

    // Poll for active task from our backend API /memory/get endpoint
    useEffect(() => {
        const fetchActiveTask = async () => {
            try {
                const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
                // We will just fetch the latest linear task from our new endpoint or mock it
                // For Context Zones demo, we can simulate an incoming task via webhook
                const res = await fetch(`http://${host}:8090/memory/get/task:linear:LIN-1234`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.status !== 'not_found' && data.id) {
                        setActiveTask({
                            id: data.id,
                            title: data.title,
                            source: data.source,
                            status: data.status,
                        });
                    } else {
                        setActiveTask(null);
                    }
                }
            } catch (e) {
                // Silently ignore if backend unreachable during dev
            }
        };

        fetchActiveTask();
        const interval = setInterval(fetchActiveTask, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <ActiveTaskContext.Provider value={{ activeTask, setActiveTask }}>
            {children}
        </ActiveTaskContext.Provider>
    );
};

export const useActiveTask = () => {
    const context = useContext(ActiveTaskContext);
    if (context === undefined) {
        throw new Error('useActiveTask must be used within an ActiveTaskProvider');
    }
    return context;
};
