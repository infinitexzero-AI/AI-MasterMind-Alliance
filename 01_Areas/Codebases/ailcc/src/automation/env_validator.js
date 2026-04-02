/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');

// Proactively load .env from the project root if it exists
const envPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
}

async function validate() {
    console.log('🔍 System Environment Validation... \n');
    let errors = 0;
    let warnings = 0;

    const configPath = path.join(__dirname, 'master_config.json');
    if (!fs.existsSync(configPath)) {
        console.error('❌ CRITICAL: master_config.json missing!');
        process.exit(1);
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    // Check Linear
    if (!process.env.LINEAR_API_KEY && !config.linearKey) {
        console.warn('⚠️  WARNING: Linear API Key missing. Service will be disabled.');
        warnings++;
    } else {
        console.log('✅ Linear Credentials: OK');
    }

    // Check GitHub
    if (!process.env.GITHUB_TOKEN && !process.env.GITHUB_PERSONAL_ACCESS_TOKEN && !config.githubToken) {
        console.warn('⚠️  WARNING: GitHub Token missing. Service will be disabled.');
        warnings++;
    } else {
        console.log('✅ GitHub credentials: OK');
    }

    // Check Project Root
    const projectRoot = path.resolve(__dirname, config.bridge.project_root);
    if (!fs.existsSync(projectRoot)) {
        console.error(`❌ CRITICAL: Project root not found at ${projectRoot}`);
        errors++;
    } else {
        console.log(`✅ Project Root: OK (${projectRoot})`);
    }

    // Check Memory Files
    const memoryPath = path.join(__dirname, 'mode6/mode6_memory.json');
    if (!fs.existsSync(memoryPath)) {
        console.warn('⚠️  WARNING: mode6_memory.json not found. Will be created on first sync.');
        warnings++;
    } else {
        console.log('✅ Task Memory: OK');
    }

    console.log(`\nValidation complete. Errors: ${errors}, Warnings: ${warnings}`);
    if (errors > 0) {
        console.error('\n❌ REJECTED: System state is unstable. Fix errors above.');
        process.exit(1);
    } else {
        console.log('\n🚀 ACCEPTED: System ready for lift-off.');
    }
}

if (require.main === module) {
    validate();
}
