// Import the SVG icons as modules
import backIconSrc from './toolbar-icons/back.svg';
import forwardIconSrc from './toolbar-icons/forward.svg';
import reloadIconSrc from './toolbar-icons/refresh.svg';
import searchIconSrc from './toolbar-icons/address_btn_icons/search.svg'; // Import the search icon

import './toolbarstyle.css'; // Import the CSS file for styling

export const createToolbar = () => {
    const toolbar = document.createElement('div');
    toolbar.id = 'browser-toolbar';

    // Back Button
    const backButton = document.createElement('button');
    backButton.id = 'back-button';
    const backIcon = document.createElement('img');
    backIcon.src = backIconSrc; // Use imported SVG source for the icon
    backButton.appendChild(backIcon);
    backButton.onclick = () => {
        const activeWebview = getActiveWebview();
        if (activeWebview) (activeWebview as Electron.WebviewTag).goBack();
    };

    // Forward Button
    const forwardButton = document.createElement('button');
    forwardButton.id = 'forward-button';
    const forwardIcon = document.createElement('img');
    forwardIcon.src = forwardIconSrc; // Use imported SVG source for the icon
    forwardButton.appendChild(forwardIcon);
    forwardButton.onclick = () => {
        const activeWebview = getActiveWebview();
        if (activeWebview) (activeWebview as Electron.WebviewTag).goForward();
    };

    // Reload Button
    const reloadButton = document.createElement('button');
    reloadButton.id = 'reload-button';
    const reloadIcon = document.createElement('img');
    reloadIcon.src = reloadIconSrc; // Use imported SVG source for the icon
    reloadButton.appendChild(reloadIcon);
    reloadButton.onclick = () => {
        const activeWebview = getActiveWebview();
        if (activeWebview) (activeWebview as Electron.WebviewTag).reload();
    };

    // Address Bar Container
    const addressBar = document.createElement('div');
    addressBar.id = 'address-bar-container';

    // Create the button inside the address bar
    const searchButton = document.createElement('button');
    searchButton.id = 'address-bar-button';
    const searchIcon = document.createElement('img');
    searchIcon.src = searchIconSrc; // Use the search icon
    searchButton.appendChild(searchIcon);
    searchButton.onclick = () => {
        // No function for now, it's a placeholder
    };

    // Create the actual input field for the address bar
    const addressInput = document.createElement('input');
    addressInput.id = 'address-bar';
    addressInput.type = 'text';
    addressInput.placeholder = 'Enter your URL here...';
    addressInput.onkeypress = (event) => {
        if (event.key === 'Enter') {
            const activeWebview = getActiveWebview();
            if (activeWebview) {
                let url = addressInput.value;
                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    url = `https://${url}`; // Ensure the URL has the correct protocol
                }
                // Use the setURL method to load the new URL
                (activeWebview as Electron.WebviewTag).loadURL(url);
            }
        }
    };

    // Append the button and input field to the address bar container
    addressBar.appendChild(searchButton);
    addressBar.appendChild(addressInput);

    // Update address bar with the current URL of the active webview
    const updateAddressBar = () => {
        const activeWebview = getActiveWebview();
        if (activeWebview) {
            addressInput.value = (activeWebview as Electron.WebviewTag).getURL();
        }
    };

    // Listen for URL changes in the active webview
    const activeWebview = getActiveWebview();
    if (activeWebview) {
        (activeWebview as Electron.WebviewTag).addEventListener('did-navigate', updateAddressBar);
    }

    // Append elements to toolbar
    toolbar.appendChild(backButton);
    toolbar.appendChild(forwardButton);
    toolbar.appendChild(reloadButton);
    toolbar.appendChild(addressBar);

    return toolbar;
};

// Helper function to get the currently active webview based on the selected tab
const getActiveWebview = () => {
    const activeTabId = (document.querySelector('#browser-container') as any)?.dataset.activeTabId;
    if (activeTabId) {
        const activeTab = document.querySelector(`#webview-container-${activeTabId}`) as HTMLDivElement;
        return activeTab?.querySelector('webview');
    }
    return null;
};
