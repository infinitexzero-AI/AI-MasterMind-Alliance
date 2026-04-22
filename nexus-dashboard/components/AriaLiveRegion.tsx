import React, { useEffect, useState } from 'react';

/**
 * AriaLiveRegion
 * A visually hidden container that announces dynamic system updates to screen readers.
 * Used for background agent activity, telemetry spikes, and critical system status changes.
 */
export const AriaLiveRegion: React.FC = () => {
    const [announcement, setAnnouncement] = useState('');

    useEffect(() => {
        const handleAnnouncement = (e: any) => {
            if (e.detail?.message) {
                setAnnouncement(e.detail.message);
                // Clear after 3 seconds to allow for re-announcement of same message if needed
                setTimeout(() => setAnnouncement(''), 3000);
            }
        };

        window.addEventListener('NEXUS_ARIA_ANNOUNCE' as any, handleAnnouncement);
        return () => window.removeEventListener('NEXUS_ARIA_ANNOUNCE' as any, handleAnnouncement);
    }, []);

    return (
        <div
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
        >
            {announcement}
        </div>
    );
};

// Utility to trigger an announcement from anywhere in the app
export const announceToScreenReader = (message: string) => {
    window.dispatchEvent(new CustomEvent('NEXUS_ARIA_ANNOUNCE', { detail: { message } }));
};
