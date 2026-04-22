import { useState, useEffect } from 'react';
import { achievementEngine, Achievement } from '../lib/achievement-engine';
import { spatialAudio } from '../lib/audio-engine';

export function useAchievements() {
    const [latestUnlock, setLatestUnlock] = useState<Achievement | null>(null);
    const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>(achievementEngine.getUnlocked());

    useEffect(() => {
        const unsubscribe = achievementEngine.subscribe((achievement) => {
            setLatestUnlock(achievement);
            setUnlockedAchievements(achievementEngine.getUnlocked());

            // Trigger spatial reward audio
            spatialAudio.playSuccess();

            // Clear notification after 5s
            setTimeout(() => setLatestUnlock(null), 5000);
        });
        return () => { unsubscribe(); };
    }, []);

    return {
        latestUnlock,
        unlockedAchievements,
        isUnlocked: (id: string) => achievementEngine.isUnlocked(id),
        triggerManualUnlock: (id: string) => achievementEngine.unlock(id)
    };
}
