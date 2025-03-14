// toolbar.ts
import { BrowserWindow, WebContentsView } from 'electron';
import { getToolbarStyles } from './toolbarstyle';
import * as path from 'path';
import * as fs from 'fs';

export function createToolbar(mainWindow: BrowserWindow): WebContentsView {
    const toolbarHeight = 37; // Height of the toolbar
    const windowBounds = mainWindow.getBounds();

    const toolbarView = new WebContentsView({
        webPreferences: {
            preload: path.join(__dirname, 'preload', 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    mainWindow.contentView.addChildView(toolbarView);
    toolbarView.setBounds({
        x: 0,
        y: 0,
        width: windowBounds.width,
        height: toolbarHeight,
    });

    // Read SVG files as base64 (Fixes file:// loading issues)
    function getBase64Icon(iconPath: string): string {
        try {
            const iconData = fs.readFileSync(iconPath, 'base64');
            return `data:image/svg+xml;base64,${iconData}`;
        } catch (error) {
            console.error(`Failed to load icon: ${iconPath}`, error);
            return '';
        }
    }

    // Convert SVGs to base64
    const backIconData = getBase64Icon(path.resolve(__dirname, 'toolbar-icons', 'back.svg'));
    const forwardIconData = getBase64Icon(path.resolve(__dirname, 'toolbar-icons', 'forward.svg'));
    const refreshIconData = getBase64Icon(path.resolve(__dirname, 'toolbar-icons', 'refresh.svg'));
    const searchIconData = getBase64Icon(path.resolve(__dirname, 'toolbar-icons', 'address_btn_icons', 'search.svg'));
    const optionsIconData = getBase64Icon(path.resolve(__dirname, 'toolbar-icons', 'options.svg'));

    // Inject CSS to style the toolbar
    toolbarView.webContents.on('dom-ready', () => {
        const css = getToolbarStyles();
        toolbarView.webContents.insertCSS(css);

        // Create the toolbar UI using TypeScript
        const toolbarHTML = `
            <div class="toolbar">
                <button class="toolbar-button" id="backButton">
                    <img src="${backIconData}" alt="Back">
                </button>
                <button class="toolbar-button" id="forwardButton">
                    <img src="${forwardIconData}" alt="Forward">
                </button>
                <button class="toolbar-button" id="refreshButton">
                    <img src="${refreshIconData}" alt="Refresh">
                </button>
                <div class="address-bar-container">
                    <button class="address-bar-button">
                        <img src="${searchIconData}" alt="Search">
                    </button>
                    <input class="address-bar" id="addressBar" type="text" placeholder="Enter address or search">
                </div>
                <button class="toolbar-button" id="optionsButton">
                    <img src="${optionsIconData}" alt="Options">
                </button>
            </div>
        `;

        // Set the toolbar HTML
        toolbarView.webContents.executeJavaScript(`
            document.body.innerHTML = \`${toolbarHTML}\`;
        `);

        // Add event listeners using TypeScript
        toolbarView.webContents.executeJavaScript(`
            document.getElementById('backButton').addEventListener('click', () => {
                window.electronToolbarAPI.navigateBack();
            });

            document.getElementById('forwardButton').addEventListener('click', () => {
                window.electronToolbarAPI.navigateForward();
            });

            document.getElementById('refreshButton').addEventListener('click', () => {
                window.electronToolbarAPI.navigateRefresh();
            });

            document.getElementById('addressBar').addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    window.electronToolbarAPI.navigateTo(event.target.value);
                }
            });

            // TODO: add functionality
            document.getElementById('optionsButton').addEventListener('click', () => {
                // Placeholder for future functionality
            });
        `);
    });

    // Load a blank page to apply the CSS
    toolbarView.webContents.loadURL('about:blank');

    return toolbarView;
}