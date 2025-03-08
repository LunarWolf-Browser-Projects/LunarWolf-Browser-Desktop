import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { readFileSync } from 'fs';

let mainWindow: BrowserWindow;

// Function to create the window
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
    icon: iconPath, // Set the icon for the app (taskbar, window, etc.)
    webPreferences: {
      preload: path.join(__dirname, 'preload', 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webviewTag: true,
      enableWebSQL: false,
      disableBlinkFeatures: 'RemotePlayback',
      allowRunningInsecureContent: false, // Disallow running insecure content in the webview
      javascript: true,
    }
  });

  // Load HTML content using WebContentsView
  mainWindow.loadFile(path.resolve(__dirname, "./app.html"));

  // load css for tabbar UI.
  const cssPath = path.resolve(__dirname, '..', 'build', 'tabbarstyle.css');
  mainWindow.webContents.once('did-finish-load', () => {
    try {
      const css = readFileSync(cssPath, 'utf8');
      mainWindow.webContents.insertCSS(css);
    } catch (error) {
      console.error("Failed to load CSS:", error);
    }
  });

  // Open the dev tools in development mode (do a // to this part of the code when editing in production)
  //if (process.env.NODE_ENV === 'development') {
  //  mainWindow.webContents.openDevTools({ mode: 'detach' });
  //}

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

  // Set the window's title (this affects the taskbar and alt-tab)
  mainWindow.setTitle(appName);
}

// Create the window once the app is ready
app.on('ready', createWindow);

// Quit the app when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
