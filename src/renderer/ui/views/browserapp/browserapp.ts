// since this code is connected to the tabbar.ts file, i do not know much about licensing since the ui
// was not completly built from the ground up, (but the actual Browser portion is as you see here.), so if you would like
// to see the license related stuff check tabbar.ts or tabbarstyle.css as it contains the contrabutions needed.
// if i make any mistakes please forgive me as i am new to all of this stuff.

import { BrowserWindow, WebContentsView, ipcMain } from 'electron';
import { createToolbar } from '..//toolbar/toolbar'; // Import the toolbar creation function
import { defaultUserAgent } from '../../../agents/user-agent/useragent';

interface BrowserTabView {
    id: number;
    webContentsView: WebContentsView;
    toolbarView: WebContentsView; // Add toolbar to the tab interface
    url: string;
}

const tabViews: BrowserTabView[] = [];
let activeTabId: number | null = null; // Track the active tab's ID

// Constants for heights
const TITLEBAR_HEIGHT = 30;
const TOOLBAR_HEIGHT = 37;
const TOOLBAR_OFFSET = 3.8;

export function createWebContentsView(mainWindow: BrowserWindow, id: number, url = 'https://duckduckgo.com/'): WebContentsView {
    const windowBounds = mainWindow.getContentBounds(); // Use getContentBounds to exclude window borders

    // Create the toolbar for this tab
    const toolbarView = createToolbar(mainWindow);

    // Calculate the y-position for the toolbar (directly below the titlebar with a small offset)
    const toolbarY = TITLEBAR_HEIGHT + TOOLBAR_OFFSET; // Toolbar is directly below the titlebar with a small offset

    // Position the toolbar
    toolbarView.setBounds({
        x: 0,
        y: toolbarY, // Position directly below the titlebar with a small offset
        width: windowBounds.width,
        height: TOOLBAR_HEIGHT,
    });

    // Calculate the y-position for the main WebContentsView (below the toolbar)
    const webContentsY = toolbarY + TOOLBAR_HEIGHT;

    // Create and position the main WebContentsView
    const webContentsView = new WebContentsView();
    mainWindow.contentView.addChildView(webContentsView);
    webContentsView.setBounds({
        x: 0,
        y: webContentsY, // Position below the toolbar
        width: windowBounds.width,
        height: windowBounds.height - webContentsY, // Adjust height to account for titlebar and toolbar
    });

    // Set the user agent for the webContents
    webContentsView.webContents.setUserAgent(defaultUserAgent);

    // Load the initial URL
    webContentsView.webContents.loadURL(url);

    // Add the new tab view to the list
    tabViews.push({ id, webContentsView, toolbarView, url });

    // If this is the first tab, select it
    if (tabViews.length === 1) {
        selectWebContentsView(mainWindow, id);
    }

    // Handle navigation events
    webContentsView.webContents.on('did-navigate', (_, updatedURL) => {
        const tab = tabViews.find(view => view.id === id);
        if (tab) {
            tab.url = updatedURL;
            if (activeTabId === id) {
                updateAddressBar(tab.toolbarView, updatedURL); // Update address bar if this is the active tab
            }
        }
    });

    // Handle window resize events
    const handleResize = () => {
        const newBounds = mainWindow.getContentBounds(); // Use getContentBounds to exclude window borders

        // Resize the toolbar
        toolbarView.setBounds({
            x: 0,
            y: toolbarY, // Maintain position directly below the titlebar with a small offset
            width: newBounds.width,
            height: TOOLBAR_HEIGHT,
        });

        // Resize the active tab's WebContentsView
        const activeTab = tabViews.find(view => view.id === id);
        if (activeTab) {
            activeTab.webContentsView.setBounds({
                x: 0,
                y: webContentsY, // Maintain position below the toolbar
                width: newBounds.width,
                height: newBounds.height - webContentsY, // Adjust height dynamically
            });
        }
    };

    mainWindow.on('resize', handleResize);

    // Handle maximize and unmaximize events
    ipcMain.on('window-maximized', handleResize);
    ipcMain.on('window-unmaximized', handleResize);

    return webContentsView;
}

export function selectWebContentsView(mainWindow: BrowserWindow, id: number) {
    const activeTab = tabViews.find(view => view.id === id);
    if (activeTab) {
        // Hide all views first
        tabViews.forEach(view => {
            view.webContentsView.setBounds({ x: 0, y: 0, width: 0, height: 0 });
            view.toolbarView.setBounds({ x: 0, y: 0, width: 0, height: 0 });
        });

        // Show the selected view
        const windowBounds = mainWindow.getContentBounds(); // Use getContentBounds to exclude window borders
        const toolbarY = TITLEBAR_HEIGHT + TOOLBAR_OFFSET;
        const webContentsY = toolbarY + TOOLBAR_HEIGHT;

        activeTab.toolbarView.setBounds({
            x: 0,
            y: toolbarY,
            width: windowBounds.width,
            height: TOOLBAR_HEIGHT,
        });

        activeTab.webContentsView.setBounds({
            x: 0,
            y: webContentsY,
            width: windowBounds.width,
            height: windowBounds.height - webContentsY,
        });

        // Update the active tab ID
        activeTabId = id;

        // Update the address bar with the active tab's URL
        updateAddressBar(activeTab.toolbarView, activeTab.url);
    }
}

export function closeWebContentsView(mainWindow: BrowserWindow, id: number) {
    const index = tabViews.findIndex(view => view.id === id);
    if (index !== -1) {
        const view = tabViews[index];
        view.webContentsView.webContents.close(); // Close the webContents
        view.toolbarView.webContents.close(); // Close the toolbar's webContents
        mainWindow.contentView.removeChildView(view.webContentsView); // Remove the view from the window
        mainWindow.contentView.removeChildView(view.toolbarView); // Remove the toolbar from the window
        tabViews.splice(index, 1);

        // If there are remaining tabs, select the first one
        if (tabViews.length > 0) {
            selectWebContentsView(mainWindow, tabViews[0].id);
        } else {
            activeTabId = null; // No active tab
        }
    }
}

export function updateWebContentsURL(id: number, url: string) {
    const view = tabViews.find(v => v.id === id);
    if (view) {
        // Automatically prepend "http://" or "https://" if missing
        const fullUrl = ensureUrlHasProtocol(url);
        view.webContentsView.webContents.loadURL(fullUrl);
        view.url = fullUrl;
        if (activeTabId === id) {
            updateAddressBar(view.toolbarView, fullUrl); // Update address bar if this is the active tab
        }
    }
}

function ensureUrlHasProtocol(url: string): string {
    // If the URL already starts with "http://" or "https://", return it as-is
    if (/^https?:\/\//i.test(url)) {
        return url;
    }
    // Otherwise, prepend "http://"
    return `http://${url}`;
}

function updateAddressBar(toolbarView: WebContentsView, url: string) {
    // Send the updated URL to the toolbar's renderer process
    toolbarView.webContents.send('update-address-bar', url);
}

// Navigation functions
export function navigateBack() {
    if (activeTabId !== null) {
        const activeTab = tabViews.find(view => view.id === activeTabId);
        if (activeTab) {
            activeTab.webContentsView.webContents.goBack();
        }
    }
}

export function navigateForward() {
    if (activeTabId !== null) {
        const activeTab = tabViews.find(view => view.id === activeTabId);
        if (activeTab) {
            activeTab.webContentsView.webContents.goForward();
        }
    }
}

export function navigateRefresh() {
    if (activeTabId !== null) {
        const activeTab = tabViews.find(view => view.id === activeTabId);
        if (activeTab) {
            activeTab.webContentsView.webContents.reload();
        }
    }
}

export function navigateTo(url: string) {
    if (activeTabId !== null) {
        const activeTab = tabViews.find(view => view.id === activeTabId);
        if (activeTab) {
            const fullUrl = ensureUrlHasProtocol(url);
            activeTab.webContentsView.webContents.loadURL(fullUrl);
            activeTab.url = fullUrl;
            updateAddressBar(activeTab.toolbarView, fullUrl); // Update address bar with the full URL
        }
    }
}

// Set up IPC handlers
ipcMain.on('navigate-back', () => {
    navigateBack();
});

ipcMain.on('navigate-forward', () => {
    navigateForward();
});

ipcMain.on('navigate-refresh', () => {
    navigateRefresh();
});

ipcMain.on('navigate-to', (event, url: string) => {
    navigateTo(url);
});