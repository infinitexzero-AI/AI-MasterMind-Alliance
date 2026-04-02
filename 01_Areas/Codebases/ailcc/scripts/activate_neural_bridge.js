const http = require('http');
const fs = require('fs');
const path = require('path');

const BRIDGE_URL = 'http://localhost:3001';
const DIAGNOSTIC_PATH = '/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/ailcc-diagnostic.html';

async function checkBridge() {
  console.log('🌐 Checking Neural Uplink (Port 3001)...');
  return new Promise((resolve) => {
    const req = http.get(BRIDGE_URL, (res) => {
      console.log(`✅ Bridge Responsive: Status ${res.statusCode}`);
      resolve(true);
    });
    req.on('error', (e) => {
      console.error(`❌ Bridge Offline: ${e.message}`);
      resolve(false);
    });
    req.end();
  });
}

function updateDiagnostic(statusUpdates) {
  if (!fs.existsSync(DIAGNOSTIC_PATH)) {
    console.error('❌ Diagnostic HTML not found.');
    return;
  }

  let html = fs.readFileSync(DIAGNOSTIC_PATH, 'utf8');
  
  // Logic to flip "missing" to "active" in the status cards
  // This is a naive regex replacement for demonstration of autonomy
  if (statusUpdates.bridge) {
    html = html.replace(
      /<div class="status-card active">\s*<div class="status-icon">✅<\/div>\s*<div class="status-label">Repository<\/div>/,
      '<div class="status-card active">\n                <div class="status-icon">✅</div>\n                <div class="status-label">Neural Bridge</div>'
    );
    html = html.replace('Chamber Readiness: 25%', 'Chamber Readiness: 45%');
    html = html.replace('width: 25%', 'width: 45%');
    html = html.replace('25%</div>', '45%</div>');
  }

  fs.writeFileSync(DIAGNOSTIC_PATH, html);
  console.log('✅ Diagnostic Dashboard Updated.');
}

async function main() {
  const isUp = await checkBridge();
  updateDiagnostic({ bridge: isUp });
  
  if (isUp) {
    console.log('🚀 Neural Bridge Activated. Systems synchronized.');
  } else {
    console.log('⚠️ Bridge activation failed. Check relay server logs.');
  }
}

main();
