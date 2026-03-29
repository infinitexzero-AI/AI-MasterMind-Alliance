import { RoutingOptimizer } from './01_Areas/Codebases/ailcc/automations/mode6/agent-routing/routing-optimizer';
import path from 'path';
import fs from 'fs';

async function verify() {
    console.log('Current CWD:', process.cwd());
    console.log('Testing RoutingOptimizer path resolution...');
    
    try {
        const optimizer = new RoutingOptimizer();
        optimizer.updateMetrics('claude', true, 150);
        
        // We expect the file to be at AILCC_PRIME/automations/mode6/data/routing_metrics.json
        // if running from AILCC_PRIME root.
        const expectedDir = path.resolve(process.cwd(), 'automations/mode6/data');
        const expectedFile = path.resolve(expectedDir, 'routing_metrics.json');
        
        console.log('Checking for file at:', expectedFile);
        
        if (fs.existsSync(expectedFile)) {
            console.log('SUCCESS: Metrics file exists.');
            const content = fs.readFileSync(expectedFile, 'utf-8');
            console.log('File Content Snippet:', content.substring(0, 100));
        } else {
            console.error('FAILURE: Metrics file NOT found at expected path.');
            // Check where it MIGHT be
            if (process.env.AILCC_METRICS_PATH) {
                 console.log('AILCC_METRICS_PATH is set to:', process.env.AILCC_METRICS_PATH);
            }
        }
    } catch (error) {
        console.error('Error during verification:', error);
    }
}

verify();
