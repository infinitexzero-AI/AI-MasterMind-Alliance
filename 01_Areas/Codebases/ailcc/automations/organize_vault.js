const fs = require('fs');
const path = require('path');

/**
 * Valentine's Vault Organizer
 * Sorts files into date-based subfolders for archival.
 */
function organizeVault(directory) {
    if (!fs.existsSync(directory)) {
        console.error(`Directory not found: ${directory}`);
        return;
    }

    const files = fs.readdirSync(directory);
    let count = 0;

    files.forEach(file => {
        const filePath = path.join(directory, file);
        const stats = fs.statSync(filePath);

        if (stats.isFile() && !file.startsWith('.')) {
            const date = new Date(stats.birthtime);
            const year = date.getFullYear().toString();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');

            const fileDir = path.join(directory, `${year}-${month}-${day}`);

            if (!fs.existsSync(fileDir)) {
                fs.mkdirSync(fileDir, { recursive: true });
            }

            fs.renameSync(filePath, path.join(fileDir, file));
            count++;
        }
    });

    console.log(`Vault organized! Successfully moved ${count} files.`);
}

// Usage: node organize_vault.js /path/to/vault
const targetPath = process.argv[2];
if (targetPath) {
    organizeVault(targetPath);
} else {
    console.log("Please provide a path to organize.");
}
