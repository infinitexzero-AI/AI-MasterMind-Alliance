const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ailcc', {
    onStatusUpdate: (callback) => ipcRenderer.on('status-update', (_, data) => callback(data)),
    getStatus: () => ipcRenderer.invoke('get-status'),
    openDashboard: () => ipcRenderer.send('open-dashboard'),
    openObservability: () => ipcRenderer.send('open-observability'),
    closePopup: () => ipcRenderer.send('close-popup'),
});
