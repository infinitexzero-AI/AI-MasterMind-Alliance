const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../automations/mode6/data');
const OUTPUT_FILE = path.join(__dirname, '../public/data/task_summary.json');

function summarize() {
    if (!fs.existsSync(DATA_DIR)) {
        console.error('Data directory not found:', DATA_DIR);
        return;
    }

    const files = fs.readdirSync(DATA_DIR);
    const results = files.filter(f => f.startsWith('result-') && f.endsWith('.json'));
    const decisions = files.filter(f => f.startsWith('decision-') && f.endsWith('.json'));

    const summary = {
        total_tasks: results.length,
        successful_tasks: 0,
        failed_tasks: 0,
        mock_tasks: 0,
        last_updated: new Date().toISOString(),
        recent_history: []
    };

    results.forEach(file => {
        try {
            const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf-8'));
            if (data.success) {
                summary.successful_tasks++;
            } else {
                summary.failed_tasks++;
            }

            if (data.metadata && data.metadata.mode === 'mock') {
                summary.mock_tasks++;
            }
            
            // Extract some metadata for the history
            summary.recent_history.push({
                taskId: data.taskId,
                success: data.success,
                mode: data.metadata ? data.metadata.mode : 'production',
                timestamp: data.timestamp || new Date().toISOString() // Should actually match from decision
            });
        } catch (e) {
            console.error('Error parsing', file, e);
        }
    });

    // Sort by timestamp descending and take last 10
    summary.recent_history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    summary.recent_history = summary.recent_history.slice(0, 50);

    fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(summary, null, 2));
    console.log('Summary generated at', OUTPUT_FILE);
}

summarize();
