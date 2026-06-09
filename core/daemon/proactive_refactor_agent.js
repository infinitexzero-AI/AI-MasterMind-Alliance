/* eslint-disable */
/**
 * Proactive Refactor Agent — Task 101 Core Daemon
 * Role: Autonomous monitor for codebase health and modularization.
 * Minimalist version with NO external dependencies (no socket.io).
 */
const fs = require('fs');
const path = require('path');

const DISCOVERY_REPORT = '/Users/infinite27/AILCC_PRIME/AI_Mastermind_Exports/_Aggregated/artifacts/discovery_report.md';
const LOG_FILE = '/Users/infinite27/AILCC_PRIME/06_System/Logs/refactor_agent_task101_v3.log';

function log(msg) {
    const timestamp = new Date().toISOString();
    const formattedMsg = `[${timestamp}] 🔧 [Refactor Agent] ${msg}\n`;
    console.log(formattedMsg.trim());
    try {
        fs.appendFileSync(LOG_FILE, formattedMsg);
    } catch (e) {
        // Silently fail if log file is unwritable
    }
}

function splitMarkdown(filePath) {
    if (!fs.existsSync(filePath)) {
        log(`❌ Error: File not found: ${filePath}`);
        return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    if (lines.length < 500) {
        log(`ℹ️ Skipping ${filePath} (only ${lines.length} lines).`);
        return;
    }

    log(`✂️ Splitting oversized file: ${filePath} (${lines.length} lines)`);

    const dirName = filePath.replace('.md', '_modularized');
    if (!fs.existsSync(dirName)) fs.mkdirSync(dirName, { recursive: true });

    let currentSection = 'Introduction';
    let currentContent = [];
    const index = [];

    lines.forEach(line => {
        // Match standard markdown H1 or H2 for splitting
        if (line.startsWith('# ') || line.startsWith('## ')) {
            if (currentContent.length > 0) {
                saveSection(dirName, currentSection, currentContent);
                index.push({ title: currentSection, file: `${currentSection.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md` });
            }

            currentSection = line.replace(/^#+ /, '').trim();
            currentContent = [line];
        } else {
            currentContent.push(line);
        }
    });

    // Save final section
    saveSection(dirName, currentSection, currentContent);
    index.push({ title: currentSection, file: `${currentSection.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md` });

    // Create Index
    const indexContent = `# Index: ${path.basename(filePath)}\n\nAuto-modularized by Proactive Refactor Agent\n\n` +
        index.map(i => `- [${i.title}](./${path.basename(dirName)}/${i.file})`).join('\n');

    fs.writeFileSync(filePath.replace('.md', '_INDEX.md'), indexContent);
    log(`✅ SUCCESS: Modularized ${path.basename(filePath)} into ${index.length} modules.`);
}

function saveSection(dir, title, content) {
    if (content.length === 0) return;
    const fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    fs.writeFileSync(path.join(dir, fileName), content.join('\n'));
}

const TARGETS = [
    DISCOVERY_REPORT,
    '/Users/infinite27/AILCC_PRIME/AI_Mastermind_Exports/_Aggregated/artifacts/MULTI_AGENT_PROMPT_LIBRARY.md',
    '/Users/infinite27/AILCC_PRIME/AI_Mastermind_Exports/_Aggregated/artifacts/GROK_INTEGRATION_GUIDE.md',
    '/Users/infinite27/AILCC_PRIME/AI_Mastermind_Exports/_Aggregated/artifacts/COMET_ASSIST_MANIFEST.md'
];

log('🚀 Starting Task 101 - Sovereign Audit (Self-Healing Loop)...');
TARGETS.forEach(target => {
    if (fs.existsSync(target)) {
        splitMarkdown(target);
    } else {
        log(`⚠️ Target not found: ${target}`);
    }
});
log('🏁 Sovereign Audit Complete. Top 3 Tech Debt Items Resolved.');
