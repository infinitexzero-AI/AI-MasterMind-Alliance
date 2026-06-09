const { app, BrowserWindow, Tray, Menu, nativeImage, shell, ipcMain } = require('electron');
const path = require('path');
const http = require('http');
const https = require('https');
const { exec } = require('child_process');

// ── Config ───────────────────────────────────────────────────────────────────
const DASHBOARD_URL = 'http://localhost:3000';
const POLL_INTERVAL = 5000;
const WINDOW_WIDTH = 380;
const WINDOW_HEIGHT = 520;

// ── State ────────────────────────────────────────────────────────────────────
let tray = null;
let popupWindow = null;
let isQuitting = false;
let lastPayload = null;

// ── Helpers ──────────────────────────────────────────────────────────────────
function fetchJSON(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        const req = client.get(url, { timeout: 4000 }, (res) => {
            let data = '';
            res.on('data', c => { data += c; });
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch { reject(new Error('Bad JSON')); }
            });
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    });
}

// ── Polling ───────────────────────────────────────────────────────────────────
async function pollDashboard() {
    try {
        const [healthRes, procRes] = await Promise.allSettled([
            fetchJSON(`${DASHBOARD_URL}/api/system/health`),
            fetchJSON(`${DASHBOARD_URL}/api/system/process-tree`),
        ]);

        const health = healthRes.status === 'fulfilled' ? healthRes.value : null;
        const procs = procRes.status === 'fulfilled' ? procRes.value : null;

        const status = health
            ? (health.status === 'healthy' ? 'healthy' : 'warning')
            : 'offline';

        const payload = {
            status,
            timestamp: new Date().toISOString(),
            cpu: health?.cpu ?? null,
            memory: health?.memory ?? null,
            uptime: health?.uptime ?? null,
            agents: health?.agents ?? [],
            processCount: Array.isArray(procs?.processes) ? procs.processes.length : null,
            dashboardUrl: DASHBOARD_URL,
        };

        lastPayload = payload;
        updateTrayTitle(status, payload);

        if (popupWindow && !popupWindow.isDestroyed()) {
            popupWindow.webContents.send('status-update', payload);
        }
        return payload;
    } catch {
        lastPayload = { status: 'offline', timestamp: new Date().toISOString() };
        updateTrayTitle('offline', {});
        if (popupWindow && !popupWindow.isDestroyed()) {
            popupWindow.webContents.send('status-update', lastPayload);
        }
        return lastPayload;
    }
}

// ── Tray title ────────────────────────────────────────────────────────────────
function updateTrayTitle(status, data) {
    if (!tray) return;
    // emoji prefix — highly visible in the crowded menu bar
    const prefix = { healthy: '⚡', warning: '⚠️', error: '🔴', offline: '⚫', unknown: '○' }[status] ?? '○';
    const cpu = data.cpu != null ? ` · CPU ${Math.round(data.cpu)}%` : '';
    const uptime = data.uptime != null ? ` · UP ${Math.floor(data.uptime / 3600)}h` : '';
    tray.setTitle(`${prefix} AILCC${cpu}`);
    tray.setToolTip(
        `AI Mastermind Alliance\n` +
        `Status: ${status.toUpperCase()}${cpu}${uptime}\n` +
        `Click to open Cortex Monitor\nRight-click for quick links`
    );
}

// ── Popup window ──────────────────────────────────────────────────────────────
function createPopupWindow() {
    if (popupWindow && !popupWindow.isDestroyed()) {
        if (popupWindow.isVisible()) { popupWindow.hide(); return; }
        popupWindow.show(); return;
    }

    const { screen } = require('electron');
    const trayBounds = tray.getBounds();
    const { workArea } = screen.getDisplayNearestPoint({ x: trayBounds.x, y: trayBounds.y });
    const x = Math.round(Math.min(
        trayBounds.x - WINDOW_WIDTH / 2 + trayBounds.width / 2,
        workArea.x + workArea.width - WINDOW_WIDTH - 8
    ));
    const y = workArea.y + 4; // just below menu bar

    popupWindow = new BrowserWindow({
        width: WINDOW_WIDTH, height: WINDOW_HEIGHT,
        x, y,
        frame: false, transparent: true, resizable: false,
        alwaysOnTop: true, skipTaskbar: true, show: false,
        webPreferences: {
            nodeIntegration: false, contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    popupWindow.loadFile('popup.html');

    popupWindow.once('ready-to-show', () => {
        popupWindow.show();
        if (lastPayload) {
            popupWindow.webContents.send('status-update', lastPayload);
        }
    });

    popupWindow.on('blur', () => {
        if (!popupWindow.isDestroyed()) popupWindow.hide();
    });

    popupWindow.on('closed', () => { popupWindow = null; });
}

// ── App entry ─────────────────────────────────────────────────────────────────
app.whenReady().then(() => {
    if (app.dock) app.dock.hide();

    // Create tray with empty image — title carries all the info
    tray = new Tray(nativeImage.createEmpty());
    tray.setTitle('○ AILCC');
    tray.setToolTip('AILCC Cortex Monitor — starting…');

    // Left-click: toggle popup
    tray.on('click', createPopupWindow);

    // Right-click context menu
    tray.setContextMenu(Menu.buildFromTemplate([
        { label: '🌌 Dashboard', click: () => shell.openExternal(DASHBOARD_URL) },
        { label: '📊 Observability', click: () => shell.openExternal(`${DASHBOARD_URL}/observability`) },
        { label: '⚔️  War Room', click: () => shell.openExternal(`${DASHBOARD_URL}/war-room`) },
        { type: 'separator' },
        { label: 'Quit', click: () => { isQuitting = true; app.quit(); } },
    ]));

    // IPC — registered here, safely inside whenReady
    ipcMain.on('open-dashboard', () => shell.openExternal(DASHBOARD_URL));
    ipcMain.on('open-observability', () => shell.openExternal(`${DASHBOARD_URL}/observability`));
    ipcMain.on('close-popup', () => { if (popupWindow && !popupWindow.isDestroyed()) popupWindow.hide(); });
    ipcMain.handle('get-status', () => pollDashboard());

    // Start polling loop
    pollDashboard();
    setInterval(pollDashboard, POLL_INTERVAL);
});

app.on('window-all-closed', (e) => {
    if (!isQuitting) e.preventDefault(); // keep alive in menu bar
});
