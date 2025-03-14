// preload.ts (or preload.js)
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

// Debugging: Check if the preload script is loaded
console.log('Preload script loaded!');

// Preload check: Send a message to the main process to confirm preload is working
ipcRenderer.send('preload-check', 'Preload script is connected!');

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
  navigateBack: () => ipcRenderer.send('navigate-back'),
  navigateForward: () => ipcRenderer.send('navigate-forward'),
  navigateRefresh: () => ipcRenderer.send('navigate-refresh'),
  navigateTo: (url: string) => ipcRenderer.send('navigate-to', url),
});

// Expose toolbar-specific API
contextBridge.exposeInMainWorld('electronToolbarAPI', {
  navigateBack: () => {
    console.log('Sending navigate-back');
    ipcRenderer.send('navigate-back');
  },
  navigateForward: () => {
    console.log('Sending navigate-forward');
    ipcRenderer.send('navigate-forward');
  },
  navigateRefresh: () => {
    console.log('Sending navigate-refresh');
    ipcRenderer.send('navigate-refresh');
  },
  navigateTo: (url: string) => {
    console.log('Sending navigate-to:', url);
    ipcRenderer.send('navigate-to', url);
  },
});

// Listen for address bar updates
ipcRenderer.on('update-address-bar', (event: IpcRendererEvent, url: string) => {
  console.log('Updating address bar:', url);
  const addressBar = document.getElementById('addressBar') as HTMLInputElement | null;
  if (addressBar) {
    addressBar.value = url;
  }
});