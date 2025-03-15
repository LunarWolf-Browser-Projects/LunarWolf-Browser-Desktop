import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

// Debugging: Check if the preload script is loaded
console.log('Preload script loaded!');

// Preload check: Send a message to the main process to confirm preload is working
ipcRenderer.send('preload-check', 'main Preload script is connected!');

// Expose custom API for sending data and listening for events
contextBridge.exposeInMainWorld('electron', {
  send: (channel: string, data: any) => ipcRenderer.send(channel, data),
  on: (channel: string, callback: Function) => ipcRenderer.on(channel, (event: IpcRendererEvent, ...args: any[]) => callback(...args)),
});

// Add contents related functions
contextBridge.exposeInMainWorld('electronAPI', {
  createTab: (url: string) => ipcRenderer.invoke('create-tab', url),
  switchTab: (id: number) => ipcRenderer.invoke('switch-tab', id),
  closeTab: (id: number) => ipcRenderer.invoke('close-tab', id),
});