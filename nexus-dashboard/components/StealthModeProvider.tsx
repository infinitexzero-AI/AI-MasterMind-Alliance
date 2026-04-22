import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export const StealthModeContext = createContext<{
    isStealthMode: boolean;
    setIsStealthMode: (value: boolean) => void;
}>({
    isStealthMode: false,
    setIsStealthMode: () => { }
});

export const StealthModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const router = useRouter();
    const [isStealth, setIsStealth] = useState(false);

    useEffect(() => {
        const queryParam = router.query.skin === 'stealth';
        const stored = localStorage.getItem('NEXUS_STEALTH_MODE') === 'true';

        if (queryParam || stored) {
            setIsStealth(true);
            document.documentElement.classList.add('stealth-mode');
        }
    }, [router.query.skin]);

    const setIsStealthMode = (nextState: boolean) => {
        setIsStealth(nextState);
        localStorage.setItem('NEXUS_STEALTH_MODE', nextState.toString());
        if (nextState) {
            document.documentElement.classList.add('stealth-mode');
        } else {
            document.documentElement.classList.remove('stealth-mode');
        }
    };

    return (
        <StealthModeContext.Provider value={{ isStealthMode: isStealth, setIsStealthMode }}>
            {children}
        </StealthModeContext.Provider>
    );
};

export const useStealthMode = () => useContext(StealthModeContext);
