const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electron', {
  onUpdate: (callback) => ipcRenderer.on('update', (_event, value) => callback(value)),
  onSettingsChanged: (callback) => ipcRenderer.on('settingsChanged', (_event, value) => callback(value)),
  send: (channel, value) => ipcRenderer.send(channel, value),
});