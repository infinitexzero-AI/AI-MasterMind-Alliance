import fs from 'fs';
import path from 'path';

// Canonical Log Directory
const LOG_DIR = '/Users/infinite27/AILCC_PRIME/logs';
const ARCHIVE_DIR = path.join(LOG_DIR, 'archive');

async function rotateLogs() {
    console.log('[LogRotation] Initiating Smart Rotation in canonical directory...');
    
    if (!fs.existsSync(ARCHIVE_DIR)) {
        fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
    }

    const logFiles = fs.readdirSync(LOG_DIR).filter(f => f.endsWith('.log'));
    const summary: any = {
        timestamp: new Date().toISOString(),
        rotatedFiles: [],
        criticalErrorsFound: 0
    };

    for (const file of logFiles) {
        const filePath = path.join(LOG_DIR, file);
        if (fs.statSync(filePath).size === 0) continue; // Skip empty logs
        
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const errorLines = content.split('\n').filter(l => l.includes('ERROR') || l.includes('FATAL'));
            summary.criticalErrorsFound += errorLines.length;

            const ts = new Date().getTime();
            const timestampedName = path.basename(file, '.log') + '_' + ts + '.log';
            fs.renameSync(filePath, path.join(ARCHIVE_DIR, timestampedName));
            
            fs.writeFileSync(filePath, '');
            summary.rotatedFiles.push(file);
        } catch (e) {
            console.error('[LogRotation] Error processing ' + file, e);
        }
    }

    console.log('[LogRotation] Done. Rotated ' + summary.rotatedFiles.length + ' files. Errors found: ' + summary.criticalErrorsFound);
}

rotateLogs().catch(e => console.error(e));
