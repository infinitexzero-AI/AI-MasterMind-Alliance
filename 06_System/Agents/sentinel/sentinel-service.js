import axios from 'axios';
import fs from 'fs';
import { execSync } from 'child_process';

const LOG_FILE = './sentinel.log';
const SERVICES = [
  { name: 'Hippocampus API', url: 'http://hippocampus-api:8000/health', compose_name: 'hippocampus-api' },
  { name: 'Nexus Dashboard', url: 'http://nexus-dashboard:3000', compose_name: 'nexus-dashboard' },
  { name: 'Valentine Core', url: 'http://valentine-core:5001/health', compose_name: 'valentine-core' },
  { name: 'ChromaDB', url: 'http://chroma:8000/api/v1/heartbeat', compose_name: 'ailcc-hippocampus-db' }
];

const failureCounts = {};

async function logStatus(message) {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] ${message}\n`;
  console.log(entry.trim());
  fs.appendFileSync(LOG_FILE, entry);
}

async function restartService(service) {
  try {
    logStatus(`HEALER: Attempting to restart ${service.name}...`);
    // Note: This requires the docker binary to be available in the container
    execSync(`docker restart ${service.compose_name}`);
    logStatus(`HEALER: Successfully triggered restart for ${service.name}.`);
    failureCounts[service.name] = 0; // Reset after attempt
  } catch (error) {
    logStatus(`HEALER ERROR: Failed to restart ${service.name}. Reason: ${error.message}`);
  }
}

async function checkHealth() {
  for (const service of SERVICES) {
    try {
      await axios.get(service.url, { timeout: 5000 });
      failureCounts[service.name] = 0; // Reset on success
    } catch (error) {
      failureCounts[service.name] = (failureCounts[service.name] || 0) + 1;
      logStatus(`MONITOR: ${service.name} failed check (${failureCounts[service.name]}/3). Error: ${error.message}`);
      
      if (failureCounts[service.name] >= 3) {
        await restartService(service);
      }
    }
  }
}

logStatus('Sentinel Core [Active Healer] Initialized. Monitoring Swarm...');
setInterval(checkHealth, 15000); // Check every 15 seconds
checkHealth(); // Initial check
