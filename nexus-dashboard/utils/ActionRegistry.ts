import { LayoutDashboard, Network, Terminal, Bot, Settings2, Activity, Plug, Sparkles, Shield, Cpu, Brain, Wand2, Globe, Heart, Wallet, BookOpen } from 'lucide-react';
import { useRouter } from 'next/router';

export interface DashboardAction {
    id: string;
    label: string;
    shortcut?: string;
    icon: React.ElementType;
    category: 'NAVIGATION' | 'SYSTEM' | 'AI' | 'SECURITY' | string;
    perform: (context: { router: any; triggerUpgrade: () => void }) => void;
}

export const getDashboardActions = (): DashboardAction[] => [
    // --- Navigation ---
    {
        id: 'nav-studio',
        label: 'Open Grok AI Studio',
        icon: Wand2,
        category: 'AI',
        perform: ({ router }) => router.push('/studio'),
    },
    {
        id: 'nav-browser-agent',
        label: 'Open Browser Agent',
        icon: Globe,
        category: 'AI',
        perform: ({ router }) => router.push('/browser-agent'),
    },
    {
        id: 'nav-dashboard',
        label: 'Go to Dashboard',
        icon: LayoutDashboard,
        category: 'NAVIGATION',
        perform: ({ router }) => router.push('/'),
    },
    {
        id: 'nav-agents',
        label: 'Go to Swarm (Agents)',
        icon: Bot,
        category: 'NAVIGATION',
        perform: ({ router }) => router.push('/agents'),
    },
    {
        id: 'nav-command',
        label: 'Go to Central Command',
        icon: Terminal,
        category: 'NAVIGATION',
        perform: ({ router }) => router.push('/central-command'),
    },
    {
        id: 'nav-obs',
        label: 'Go to Observability',
        icon: Activity,
        category: 'NAVIGATION',
        perform: ({ router }) => router.push('/observability'),
    },
    {
        id: 'nav-memory',
        label: 'Go to Memory Explorer',
        icon: Brain,
        category: 'NAVIGATION',
        perform: ({ router }) => router.push('/memory'),
    },
    {
        id: 'nav-interop',
        label: 'Go to Interoperability',
        icon: Plug,
        category: 'NAVIGATION',
        perform: ({ router }) => router.push('/interoperability'),
    },
    {
        id: 'nav-sys',
        label: 'Go to System Settings',
        icon: Settings2,
        category: 'NAVIGATION',
        perform: ({ router }) => router.push('/system'),
    },

    // --- System ---
    {
        id: 'sys-audit',
        label: 'Trigger System Audit (OpenClaw)',
        icon: Shield,
        category: 'SYSTEM',
        perform: ({ triggerUpgrade }) => triggerUpgrade(),
    },
    {
        id: 'sys-health',
        label: 'Force Health Refresh',
        icon: Cpu,
        category: 'SYSTEM',
        perform: () => {
            window.location.reload();
        },
    },

    {
        id: 'ai-relay',
        label: 'Neural Relay: Analyze Recent Errors',
        icon: Sparkles,
        category: 'AI',
        perform: ({ router }) => router.push('/observability?relay=active'),
    },

    // --- LifeOS Parallel Systems (Wave 7) ---
    {
        id: 'lifeos-finance',
        label: 'Open Finance Hub',
        icon: Wallet,
        category: 'LIFEOS',
        perform: ({ router }) => router.push('/finance'),
    },
    {
        id: 'lifeos-health',
        label: 'Open Health & Performance Hub',
        icon: Heart,
        category: 'LIFEOS',
        perform: ({ router }) => router.push('/health'),
    },
    {
        id: 'lifeos-logic',
        label: 'Open Logic & Academics Hub',
        icon: BookOpen,
        category: 'LIFEOS',
        perform: ({ router }) => router.push('/academics'),
    },
];
