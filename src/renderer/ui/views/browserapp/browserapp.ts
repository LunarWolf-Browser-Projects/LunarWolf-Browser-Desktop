// since this code is connected to the tabbar.ts file, i do not know much about licensing since the ui
// was not completly built from the ground up, (but the actual Browser portion is as you see here.), so if you would like
// to see the license related stuff check tabbar.ts or tabbarstyle.css as it contains the contrabutions needed.
// if i make any mistakes please forgive me as i am new to all of this stuff.

interface BrowserTabView {
    id: number;
    webview: HTMLDivElement;
}

const tabViews: BrowserTabView[] = [];

// Container for the browser views
const browserContainer = document.createElement('div');
browserContainer.id = 'browser-container';
browserContainer.style.position = 'absolute';
browserContainer.style.top = '36px'; // Height of titlebar
browserContainer.style.left = '0';
browserContainer.style.right = '0';
browserContainer.style.bottom = '0';
browserContainer.style.backgroundColor = '#fff';
browserContainer.style.overflow = 'hidden';

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

    // Append the webview to its container
    webviewContainer.appendChild(webview);
    
    tabViews.push({ id, webview: webviewContainer });
    browserContainer.appendChild(webviewContainer);

    selectBrowserView(id);
};

/**
 * Select (show) the browser view for a tab
 */
export const selectBrowserView = (id: number) => {
    tabViews.forEach(view => {
        view.webview.style.display = view.id === id ? 'block' : 'none';
    });
};

/**
 * Close and remove a browser view
 */
export const closeBrowserView = (id: number) => {
    const index = tabViews.findIndex(view => view.id === id);
    if (index !== -1) {
        const view = tabViews[index];
        view.webview.remove();
        tabViews.splice(index, 1);
    }
};

/**
 * Update the URL of a browser view (optional, if you add an address bar later)
 */
export const updateBrowserURL = (id: number, url: string) => {
    const view = tabViews.find(v => v.id === id);
    if (view) {
        const webviewElement = view.webview.querySelector('webview');
        if (webviewElement) {
            webviewElement.setAttribute('src', url);
        }
    }
};
