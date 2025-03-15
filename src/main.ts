import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { readFileSync } from 'fs';
import { createWebContentsView, selectWebContentsView, closeWebContentsView, navigateBack, navigateForward, navigateRefresh, navigateTo } from './renderer/ui/views/browserapp/browserapp';

let mainWindow: BrowserWindow;

function createWindow() {
  const appName = "LunarWolf";

  // Get the icon path based on the platform
  let iconPath = '';

  if (process.platform === 'win32') {
    iconPath = path.resolve(__dirname, '..', 'static', 'app_icon', 'windows', 'app_icon.ico');
  } else if (process.platform === 'darwin') {
    iconPath = path.resolve(__dirname, '..', 'static', 'app_icon', 'mac', 'app_icon.icns');
  } else if (process.platform === 'linux') {
    iconPath = path.resolve(__dirname, '..', 'static', 'app_icon', 'linux', 'app_icon.png');
  }

  // Create the window
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload', 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableWebSQL: false,
      disableBlinkFeatures: 'RemotePlayback',
      allowRunningInsecureContent: false,
      javascript: true,
    }
  });

  // Load HTML content for the UI
  mainWindow.loadFile(path.resolve(__dirname, "./app.html"));

  // Load CSS for tabbar UI
  const cssPath = path.resolve(__dirname, '..', 'build', 'tabbarstyle.css');
  mainWindow.webContents.once('did-finish-load', () => {
    try {
      const css = readFileSync(cssPath, 'utf8');
      mainWindow.webContents.insertCSS(css);
    } catch (error) {
      console.error('Failed to load tabview:', error);
    }
  });

  // IPC handler for preload check
  ipcMain.on('preload-check', (event, message) => {
    console.log(message); // Should log: "Preload script is connected!"
  });

  // IPC handlers for window actions
  ipcMain.on('window-minimize', () => mainWindow.minimize());
  ipcMain.on('window-maximize', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });
  ipcMain.on('window-close', () => mainWindow.close());

  // IPC handlers for browser view selection and closing
  ipcMain.on('select-web-contents-view', (event, id) => {
    const mainWindow = BrowserWindow.getFocusedWindow();
    if (mainWindow) {
      selectWebContentsView(mainWindow, id);
    }
  });

  ipcMain.on('close-web-contents-view', (event, id) => {
    const mainWindow = BrowserWindow.getFocusedWindow();
    if (mainWindow) {
      closeWebContentsView(mainWindow, id);
    }
  });

  ipcMain.on('create-web-contents-view', (event, id) => {
    const mainWindow = BrowserWindow.getFocusedWindow();
    if (mainWindow) {
      createWebContentsView(mainWindow, id);
    }
  });

  // IPC handlers for toolbar actions
  ipcMain.on('navigate-back', () => {
    console.log('Navigate back received'); // Debug statement
    navigateBack();
  });

  ipcMain.on('navigate-forward', () => {
    console.log('Navigate forward received'); // Debug statement
    navigateForward();
  });

  ipcMain.on('navigate-refresh', () => {
    console.log('Navigate refresh received'); // Debug statement
    navigateRefresh();
  });

  ipcMain.on('navigate-to', (event, url: string) => {
    console.log('Navigate to received:', url); // Debug statement
    navigateTo(url);
  });

  // Set the window's title (this affects the taskbar and alt-tab)
  mainWindow.setTitle(appName);

  // Handle maximize and unmaximize events
  mainWindow.on('maximize', () => {
    const activeTab = BrowserWindow.getFocusedWindow();
    if (activeTab) {
      activeTab.webContents.send('window-maximized');
    }
  });

  mainWindow.on('unmaximize', () => {
    const activeTab = BrowserWindow.getFocusedWindow();
    if (activeTab) {
      activeTab.webContents.send('window-unmaximized');
    }
  });
}

// Create the window once the app is ready
app.on('ready', createWindow);

// Quit the app when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});