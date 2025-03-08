import { contextBridge, ipcRenderer } from 'electron';

// Expose custom API for sending data and listening for events
contextBridge.exposeInMainWorld('electron', {
  send: (channel: string, data: any) => ipcRenderer.send(channel, data),
  on: (channel: string, callback: Function) => ipcRenderer.on(channel, (event, ...args) => callback(...args))
});

// Add contents related functions
contextBridge.exposeInMainWorld('electronAPI', {
  createTab: (url: string) => ipcRenderer.invoke('create-tab', url),
  switchTab: (id: number) => ipcRenderer.invoke('switch-tab', id),
  closeTab: (id: number) => ipcRenderer.invoke('close-tab', id),
});

// Webview preload logic
window.addEventListener('DOMContentLoaded', () => {
  ipcRenderer.on('some-message', (event: any, data: any) => {
    console.log("Message from main process:", data);
  });

  // Example of sending messages from webview to the main process
  ipcRenderer.send('webview-loaded', 'Webview has loaded');
});
