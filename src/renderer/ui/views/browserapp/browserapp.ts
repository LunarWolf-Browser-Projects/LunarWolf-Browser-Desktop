// since this code is connected to the tabbar.ts file, i do not know much about licensing since the ui
// was not completly built from the ground up, (but the actual Browser portion is as you see here.), so if you would like
// to see the license related stuff check tabbar.ts or tabbarstyle.css as it contains the contrabutions needed.
// if i make any mistakes please forgive me as i am new to all of this stuff.

import { createToolbar } from '../toolbar/toolbar';

interface BrowserTabView {
    id: number;
    webview: HTMLDivElement;
    url: string; // Store the URL for each tab
}

const tabViews: BrowserTabView[] = [];

// Create main container
const browserContainer = document.createElement('div');
browserContainer.id = 'browser-container';
browserContainer.style.position = 'absolute';
browserContainer.style.top = '72px'; // Increase this if you are changing the size of the toolbar
browserContainer.style.left = '0';
browserContainer.style.right = '0';
browserContainer.style.bottom = '0';
browserContainer.style.backgroundColor = '#fff';
browserContainer.style.overflow = 'hidden';

// Append toolbar
const toolbar = createToolbar();
toolbar.style.position = 'absolute';
toolbar.style.top = '36px'; // Below titlebar/tabs
toolbar.style.left = '0';
toolbar.style.right = '0';
toolbar.style.height = '36px';
document.body.appendChild(toolbar);

document.body.appendChild(browserContainer);

export const createBrowserView = (id: number, url = 'https://google.com/') => {
    const webviewContainer = document.createElement('div');
    webviewContainer.id = `webview-container-${id}`;
    webviewContainer.style.width = '100%';
    webviewContainer.style.height = '100%';
    webviewContainer.style.position = 'absolute';
    webviewContainer.style.top = '0';
    webviewContainer.style.left = '0';
    webviewContainer.style.right = '0';
    webviewContainer.style.bottom = '0';
    webviewContainer.style.overflow = 'hidden';

    // Create the webview
    const webview = document.createElement('div');
    webview.id = `webview-${id}`;
    webview.style.width = '100%';
    webview.style.height = '100%';
    webview.style.position = 'absolute';
    webview.style.top = '0';
    webview.style.left = '0';

    webview.innerHTML = `<webview src="${url}" style="width:100%; height:100%"></webview>`;

    webviewContainer.appendChild(webview);

    tabViews.push({ id, webview: webviewContainer, url }); // Store URL in the tabViews array
    browserContainer.appendChild(webviewContainer);

    selectBrowserView(id);

    // Get the actual webview element
    const activeWebview = webview.querySelector('webview');

    if (activeWebview) {
        // Listen for the "did-navigate" event on the webview
        (activeWebview as Electron.WebviewTag).addEventListener('did-navigate', () => {
            // Update the URL in the tabViews array when navigation happens
            const updatedURL = (activeWebview as Electron.WebviewTag).getURL();
            const tab = tabViews.find(view => view.id === id);
            if (tab) {
                tab.url = updatedURL; // Update the URL for the current tab
            }

            // Update the address bar with the current URL
            const addressBar = document.querySelector('#address-bar') as HTMLInputElement;
            if (addressBar) {
                addressBar.value = updatedURL;
            }
        });
    }
};

export const selectBrowserView = (id: number) => {
    tabViews.forEach(view => {
        view.webview.style.display = view.id === id ? 'block' : 'none';
    });

    // Update the address bar when switching tabs
    const activeTab = tabViews.find(view => view.id === id);
    if (activeTab) {
        const addressBar = document.querySelector('#address-bar') as HTMLInputElement;
        if (addressBar) {
            addressBar.value = activeTab.url; // Set the address bar to the active tab's URL
        }
    }
};

export const closeBrowserView = (id: number) => {
    const index = tabViews.findIndex(view => view.id === id);
    if (index !== -1) {
        const view = tabViews[index];
        view.webview.remove();
        tabViews.splice(index, 1);
    }
};

export const updateBrowserURL = (id: number, url: string) => {
    const view = tabViews.find(v => v.id === id);
    if (view) {
        const webviewElement = view.webview.querySelector('webview');
        if (webviewElement) {
            webviewElement.setAttribute('src', url);
        }
    }
};
