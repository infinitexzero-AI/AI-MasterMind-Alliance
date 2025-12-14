import NexusLayout from '@/components/layout/NexusLayout';
import { AntigravityPanel } from '@/components/antigravity/AntigravityPanel';

export default function ForgePage() {
    return (
        <NexusLayout>
            <h1 className="text-2xl font-display font-bold text-white mb-6">ANTIGRAVITY // FORGE</h1>
            <AntigravityPanel />
        </NexusLayout>
    );
}
