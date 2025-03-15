import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

// Debugging: Check if the toolbar preload script is loaded
console.log('Toolbar preload script loaded!');

// Preload check: Send a message to the main process to confirm preload is working
ipcRenderer.send('preload-check', 'Toolbar preload script is connected!');

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
  onUpdateNavigationButtons: (callback: (event: IpcRendererEvent, state: { canGoBack: boolean, canGoForward: boolean }) => void) => {
    console.log('Listening for navigation button updates');
    ipcRenderer.on('update-navigation-buttons', callback);
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