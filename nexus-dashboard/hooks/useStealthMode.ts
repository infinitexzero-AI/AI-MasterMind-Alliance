import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export function useStealthMode() {
    const router = useRouter();
    const [isStealth, setIsStealth] = useState(false);

    useEffect(() => {
        // Detect via query param or localStorage
        const queryParam = router.query.skin === 'stealth';
        const stored = localStorage.getItem('NEXUS_STEALTH_MODE') === 'true';

        if (queryParam || stored) {
            setIsStealth(true);
            document.documentElement.classList.add('stealth-mode');
        } else {
            setIsStealth(false);
            document.documentElement.classList.remove('stealth-mode');
        }
    }, [router.query.skin]);

    const toggleStealth = () => {
        const nextState = !isStealth;
        setIsStealth(nextState);
        localStorage.setItem('NEXUS_STEALTH_MODE', nextState.toString());

        if (nextState) {
            document.documentElement.classList.add('stealth-mode');
        } else {
            document.documentElement.classList.remove('stealth-mode');
        }
    };

    return { isStealth, toggleStealth };
}
