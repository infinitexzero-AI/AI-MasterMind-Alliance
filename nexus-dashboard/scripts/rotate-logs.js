const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Target directory to clean
const LOGS_DIR = path.join(__dirname, '../logs');
const MAX_LOG_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

if (!fs.existsSync(LOGS_DIR)) {
    console.log('[Log Rotation] Log directory not found, exiting.');
    process.exit(0);
}

const files = fs.readdirSync(LOGS_DIR);

files.forEach(file => {
    // Only process pure log files (ignore already gzipped)
    if (file.endsWith('.log')) {
        const filePath = path.join(LOGS_DIR, file);
        const stats = fs.statSync(filePath);

        if (stats.size > MAX_LOG_SIZE_BYTES) {
            console.log(`[Log Rotation] Rotating ${file} (${Math.round(stats.size/1024/1024)}MB)`);
            
            const timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
            const archivedPath = path.join(LOGS_DIR, `${file.replace('.log', '')}_${timestamp}.log.gz`);

            const readStream = fs.createReadStream(filePath);
            const writeStream = fs.createWriteStream(archivedPath);
            const gzip = zlib.createGzip();

            readStream.pipe(gzip).pipe(writeStream).on('finish', () => {
                console.log(`[Log Rotation] Successfully compressed to ${path.basename(archivedPath)}`);
                // Clear the original log file by truncating it
                fs.truncateSync(filePath, 0);
            });
        }
    }
});
