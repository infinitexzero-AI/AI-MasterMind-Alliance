import { useState, useEffect } from 'react';
import { pluginRegistry, NexusPlugin } from '../lib/plugin-registry';

export function usePlugins() {
    const [plugins, setPlugins] = useState<NexusPlugin[]>(pluginRegistry.getPlugins());
    const [enabledPlugins, setEnabledPlugins] = useState<NexusPlugin[]>(pluginRegistry.getEnabledPlugins());

    useEffect(() => {
        const unsubscribe = pluginRegistry.subscribe(() => {
            setPlugins(pluginRegistry.getPlugins());
            setEnabledPlugins(pluginRegistry.getEnabledPlugins());
        });
        return () => { unsubscribe(); };
    }, []);

    const getSlotComponents = (slot: 'sidebar' | 'dashboard' | 'settings') => {
        return enabledPlugins
            .map(p => p.slots?.[slot])
            .filter((Component): Component is React.ComponentType => !!Component);
    };

    const getPluginActions = () => {
        return enabledPlugins.flatMap(p => p.actions || []);
    };

    return {
        plugins,
        enabledPlugins,
        getSlotComponents,
        getPluginActions,
        togglePlugin: (id: string) => pluginRegistry.togglePlugin(id)
    };
}
