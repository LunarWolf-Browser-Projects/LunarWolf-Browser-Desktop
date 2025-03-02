// Import the SVG icons as modules
import backIconSrc from './toolbar-icons/back.svg';
import forwardIconSrc from './toolbar-icons/forward.svg';
import reloadIconSrc from './toolbar-icons/refresh.svg';

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
        const activeWebview = document.querySelector('webview');
        if (activeWebview) (activeWebview as Electron.WebviewTag).goBack();
    };

    // Forward Button
    const forwardButton = document.createElement('button');
    forwardButton.id = 'forward-button';
    const forwardIcon = document.createElement('img');
    forwardIcon.src = forwardIconSrc; // Use imported SVG source for the icon
    forwardButton.appendChild(forwardIcon);
    forwardButton.onclick = () => {
        const activeWebview = document.querySelector('webview');
        if (activeWebview) (activeWebview as Electron.WebviewTag).goForward();
    };

    // Reload Button
    const reloadButton = document.createElement('button');
    reloadButton.id = 'reload-button';
    const reloadIcon = document.createElement('img');
    reloadIcon.src = reloadIconSrc; // Use imported SVG source for the icon
    reloadButton.appendChild(reloadIcon);
    reloadButton.onclick = () => {
        const activeWebview = document.querySelector('webview');
        if (activeWebview) (activeWebview as Electron.WebviewTag).reload();
    };

    // Address Bar
    const addressBar = document.createElement('input');
    addressBar.id = 'address-bar';
    addressBar.type = 'text';
    addressBar.placeholder = 'Enter your URL here...';
    addressBar.onkeypress = (event) => {
        if (event.key === 'Enter') {
            const activeWebview = document.querySelector('webview');
            if (activeWebview) {
                const url = addressBar.value.startsWith('http') ? addressBar.value : `https://${addressBar.value}`;
                (activeWebview as Electron.WebviewTag).setAttribute('src', url);
            }
        }
    };

    // Update address bar with the current URL of the active webview
    const updateAddressBar = () => {
        const activeWebview = document.querySelector('webview');
        if (activeWebview) {
            addressBar.value = (activeWebview as Electron.WebviewTag).getURL();
        }
    };

    // Listen for URL changes in the active webview
    const activeWebview = document.querySelector('webview');
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
