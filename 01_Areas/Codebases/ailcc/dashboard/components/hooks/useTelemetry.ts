import { useState, useEffect } from 'react';

export function useTelemetry() {
    const [data, setData] = useState({
        fps: 60,
        latencyMs: 45,
        totalCost: 0,
        dailyBudget: 5,
        status: 'HEALTHY',
        gateStatus: {
            deploy: true,
            research: true,
            analysis: true,
            codegen: true
        }
    });

    useEffect(() => {
        const fetchBudget = async () => {
            try {
                const res = await fetch('/api/budget');
                if (res.ok) {
                    const budget = await res.json();
                    setData(prev => ({
                        ...prev,
                        totalCost: budget.current_spend,
                        dailyBudget: budget.daily_limit,
                        status: budget.status,
                        gateStatus: {
                            ...prev.gateStatus,
                            codegen: budget.status !== 'CRITICAL',
                            deploy: budget.status !== 'CRITICAL'
                        }
                    }));
                }
            } catch (e) {
                console.error("Telemetry fetch failed", e);
            }
        };

        fetchBudget();
        const interval = setInterval(fetchBudget, 10000); // Pulse every 10s
        return () => clearInterval(interval);
    }, []);

    return data;
}
