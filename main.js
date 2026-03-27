const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const {
  saveSettings,
  sendFullState,
  sendSettings,
  setup,
  timeout,
  toggleClock,
  updateSettings,
  updateState,
} = require('./scoreboard');
const path = require('path');

const createWindows = () => {
  const preload = path.join(__dirname, 'context.js');
  const controller = new BrowserWindow({
    width: 1920,
    height: 680,
    webPreferences: {
      preload,
    },
  });

  controller.loadFile('index.html');
  controller.setBounds({ x: 0, y: 400 });
  controller.webContents.openDevTools();

  const display = new BrowserWindow({
    // width: 1920,
    // height: 1080,
    width: 1920,
    height: 400,
    webPreferences: {
      preload,
    },
  });

  display.loadFile('scoreboard/display.html');
  display.setBounds({ x: 0, y: 0 });
  display.webContents.openDevTools();

  return [controller, display];
};

app.whenReady().then(() => {
  const windows = createWindows();
  setup(windows);

  ipcMain.on('getFullState', () => {
    sendFullState();
  });

  ipcMain.on('getSettings', () => {
    sendSettings();
  });

  ipcMain.on('updateState', (event, payload) => {
    updateState(payload);
  });

  ipcMain.on('updateSettings', (event, payload) => {
    updateSettings(payload);
  });

  ipcMain.on('timeout-left', () => {
    timeout('left');
  });

  ipcMain.on('timeout-right', () => {
    timeout('right');
  });

  ipcMain.on('toggle-clock', () => {
    toggleClock();
  });
});

app.on('will-quit', () => {
  saveSettings();
});