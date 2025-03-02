# ui component locations

in this document we will look at the locations of some of the basic ui elements

first lets discribe how the ui is loaded

lets look at the main process

```ts
import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { readFileSync } from 'fs';

let mainWindow: BrowserWindow;

// Function to create the window
function createWindow() {
  const appName = "LunarWolf";

  // Get the icon path based on the platform
  let iconPath = '';

  if (process.platform === 'win32') {
    iconPath = path.resolve(__dirname, '..', 'static', 'app_icon', 'windows', 'app_icon.ico');
  } else if (process.platform === 'darwin') {
    iconPath = path.resolve(__dirname, '..', 'static', 'app_icon', 'mac', 'app_icon.icns');
  } else if (process.platform === 'linux') {
    iconPath = path.resolve(__dirname, '..', 'static', 'app_icon', 'linux', 'app_icon.png');
  }

  // Create the window
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false, // Disable default frame for custom titlebar
    icon: iconPath, // Set the icon for the app (taskbar, window, etc.)
    webPreferences: {
      preload: path.join(__dirname, 'preload', 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true
    }
  });

  mainWindow.loadFile(path.resolve(__dirname, "./app.html"));

  // Open the dev tools in development mode (do a // to this part of the code when editing in production)
  //if (process.env.NODE_ENV === 'development') {
  //  mainWindow.webContents.openDevTools({ mode: 'detach' });
  //}

  // IPC handlers for window actions
  ipcMain.on('window-minimize', () => mainWindow.minimize());
  ipcMain.on('window-maximize', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });
  ipcMain.on('window-close', () => mainWindow.close());

  // Set the window's title (this affects the taskbar and alt-tab)
  mainWindow.setTitle(appName);
}

// Create the window once the app is ready
app.on('ready', createWindow);

// Quit the app when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```

the "main process" component contains the necessary infermation to initialize the app, it creates a electron BrowserWindow
then names the window accordingly
then loads ipc commands alongside preload
after those processes, electron requires html to load the ui, especially when you rely on the DOM aspect

# basic html used to load the apps ui

```html
<html>
    <head>
      <link rel="stylesheet" href="file://${cssPath}">
    </head>
    <body>
      <div id="app"></div>
      <script src="renderer.js"></script>
    </body>
  </html>
```

with this approach the css is injected through the main process and thus the ui loads.
since the html is a static element, it can be found in the root project then go to static/app_loader within that you will find the
app.html file, which acts as the renderer for the entire app but not fully

# ui component locations > tab and titlebar components.

the titlebar and tabs are all housed within the src/renderer directory
for example, if we look in src/renderer/ui/views we see some files, and these are responsible for the ui that you see when
you load the web browser

lets take a look in src/renderer/ui/views/tabview/tabbar.ts

```ts
// Extend CSSStyleDeclaration to recognize webkitAppRegion
declare global {
  interface CSSStyleDeclaration {
    webkitAppRegion?: string;
  }
}

import './tabbarstyle.css';
import addIcon from './tabview-icons/add.svg';
import closeIcon from './tabview-icons/close.svg';
import minimizeIcon from './tabview-icons/minimize.svg';
import maximizeIcon from './tabview-icons/maximize.svg';
import restoreIcon from './tabview-icons/restore.svg';
import { closeBrowserView, createBrowserView, selectBrowserView } from '../browserapp/browserapp';

// Main app container
const app = document.createElement('div');
app.id = 'app';

// Title bar container
const titlebar = document.createElement('div');
titlebar.className = 'titlebar';
titlebar.style.webkitAppRegion = 'drag'; // Make the titlebar draggable

// Window control buttons container
const windowControls = document.createElement('div');
windowControls.className = 'window-controls';
windowControls.style.webkitAppRegion = 'no-drag'; // Make buttons clickable

// Minimize button
const minimizeButton = document.createElement('div');
minimizeButton.className = 'window-button minimize';
minimizeButton.style.backgroundImage = `url(${minimizeIcon})`;
minimizeButton.onclick = () => window.electron.send('window-minimize', {});

// Maximize button
const maximizeButton = document.createElement('div');
maximizeButton.className = 'window-button maximize';
maximizeButton.style.backgroundImage = `url(${maximizeIcon})`;
maximizeButton.onclick = () => window.electron.send('window-maximize', {});

// Close button
const closeButton = document.createElement('div');
closeButton.className = 'window-button close';
closeButton.style.backgroundImage = `url(${closeIcon})`;
closeButton.onclick = () => window.electron.send('window-close', {});

windowControls.appendChild(minimizeButton);
windowControls.appendChild(maximizeButton);
windowControls.appendChild(closeButton);
titlebar.appendChild(windowControls);

// Line under title bar
const line = document.createElement('div');
line.id = 'line';
titlebar.appendChild(line);

// Tab bar container
const tabbar = document.createElement('div');
tabbar.id = 'tabbar';
titlebar.appendChild(tabbar);

// Add tab button
const addTabButton = document.createElement('div');
addTabButton.className = 'titlebar-button add-icon';
addTabButton.id = 'add-tab-button';
addTabButton.style.backgroundImage = `url(${addIcon})`;
addTabButton.style.webkitAppRegion = 'no-drag';
addTabButton.onclick = () => createTab();
tabbar.appendChild(addTabButton);

// Assemble the structure
app.appendChild(titlebar);
document.body.appendChild(app);

// Tab management
interface Tab {
  id: number;
  tabElement: HTMLDivElement;
  title: string;
}

const tabs: Tab[] = [];
let nextTabId = 1;
let selectedTabId = -1;

const getTabById = (id: number): Tab | undefined => tabs.find((tab) => tab.id === id);

const getSelectedTab = (): Tab | undefined => getTabById(selectedTabId);

const selectTab = (id: number): void => {
  const currentTab = getSelectedTab();

  if (currentTab) {
      currentTab.tabElement.classList.remove('selected');
  }

  selectedTabId = id;

  const newTab = getSelectedTab();
  if (newTab) {
      newTab.tabElement.classList.add('selected');
  }

  selectBrowserView(id);  // <-- Show the correct browser view
};

const createElement = <K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  props: Record<string, any> = {},
  ...children: (HTMLElement | string | number)[]
): HTMLElementTagNameMap[K] => {
  const element = document.createElement(tagName);

  for (const child of children) {
    if (typeof child === 'string' || typeof child === 'number') {
      const text = document.createTextNode(child.toString());
      element.appendChild(text);
    } else if (child instanceof HTMLElement) {
      element.appendChild(child);
    }
  }

  for (const key in props) {
    if (key.startsWith('on') && typeof props[key] === 'function') {
      element.addEventListener(key.substring(2).toLowerCase(), props[key]);
    } else {
      element.setAttribute(key, props[key]);
    }
  }

  return element;
};

const addTabElement = (id: number, title: string): HTMLDivElement => {
  const tabElement = createElement(
    'div',
    { class: 'tab', id: `tab-${id}` },
    createElement('div', { class: 'tab-title' }, title),
    createElement('img', {
      src: closeIcon,
      class: 'tab-close close-icon',
      onmousedown: (e: MouseEvent) => e.stopPropagation(),
      onclick: () => closeTab(id),
    })
  );

  tabElement.style.webkitAppRegion = 'no-drag';

  tabbar.insertBefore(tabElement, addTabButton);

  tabElement.onmousedown = (event: MouseEvent) => {
    if (event.button === 0) {
      selectTab(id);
    }
  };

  return tabElement;
};

const closeTab = (id: number): void => {
  const tab = getTabById(id);
  const index = tabs.findIndex((t) => t.id === id);

  if (index === -1) return;

  closeBrowserView(id);  // <-- Remove the browser view

  let newIndex = index + 1;

  if (index + 1 < tabs.length) {
      newIndex = index + 1;
  } else if (index - 1 >= 0) {
      newIndex = index - 1;
  } else {
      newIndex = -1;
  }

  if (tabs.length === 1) {
      window.close();
      return;
  }

  tabs.splice(index, 1);
  tab?.tabElement.remove();

  if (newIndex !== -1) {
      selectTab(tabs[newIndex].id);
  }
};

const createTab = (): void => {
  const id = nextTabId++;
  const title = 'New Tab';

  const tabElement = addTabElement(id, title);

  const tab: Tab = {
      id,
      tabElement,
      title,
  };

  tabs.push(tab);
  createBrowserView(id);  // <-- Create matching browser view for the tab
  selectTab(id);
};

createTab();

// Ensure the window buttons don't move when tabs overflow
tabbar.style.flexGrow = '1';
tabbar.style.overflow = 'hidden';
tabbar.style.whiteSpace = 'nowrap';

// Keep window buttons clickable
windowControls.style.position = 'absolute';
windowControls.style.top = '0';
windowControls.style.right = '0';
windowControls.style.display = 'flex';

// Prevent tab bar from expanding indefinitely
tabbar.style.maxWidth = 'calc(100% - 150px)';

// Prevent dragging over window buttons
document.body.style.overflow = 'hidden';
document.documentElement.style.overflow = 'hidden';
```

the tabbar file plays a key role in displaying functions for the tabbed ui, alongwith titlebar functions and so on, any window related stuff would be in here, unless your looking for core window creation, then look in the main process in which we described
earlier on

now that we covered the typescript side of things lets actually see what makes the ui and displays it

NOTE: the tabbar.ts and tabbarstyle.css are linked together because the css is the actual style meanwhile the typscript serves as
the actual functionallity of the browser

```css
/* Reset some default styles for a clean base */
body, html {
  margin: 0;
  padding: 0;
  cursor: default;
  user-select: none;
  font-family: system-ui, sans-serif;
  background-color: white;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding-top: 34px;
}

#browser-container {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: calc(100vh - 36px); /* Ensure it takes up all available height */
  overflow: hidden;
  position: absolute; /* Ensure it follows viewport sizing */
  top: 36px;
  left: 0;
}

.titlebar {
  display: flex;
  align-items: center;
  width: 100%;
  background-color: #f5f5f5;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
}

/* Window control buttons */
.window-controls {
  display: flex;
  position: absolute;
  right: 0;
  top: 0;
  height: 34px;
  align-items: center;
}

.window-button {
  width: 45px;
  height: 34px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 12px;
  cursor: pointer;
}

.window-button:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.window-button.close:hover {
  background-color: #e81123;
}

.window-button.minimize {
  background-image: url(tabview-icons/minimize.svg);
}

.window-button.maximize {
  background-image: url(tabview-icons/maximize.svg);
}

.window-button.close {
  background-image: url(tabview-icons/windowclose.svg);
  background-size: 20px;
}

/* Tab bar and line */
#tabbar {
  display: flex;
  flex-grow: 1;
  height: 34px;
  position: relative;
  z-index: 2;
  padding: 4px;
  padding-bottom: 0;
  min-width: 0;
}

#line {
  position: absolute;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.12);
  width: 100%;
  height: 1px;
}

/* Styling for individual tabs */
.tab {
  display: flex;
  flex-grow: 1;
  align-items: center;
  max-width: 230px;
  min-width: 0;
  padding: 0 8px;
  overflow: hidden;
  height: 100%;
  font-size: 12px;
}

.tab-title {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  flex-grow: 1;
  min-width: 0;
}

/* Close button styling */
.tab-close {
  height: 16px;
  width: 16px;
  margin-left: 2px;
  margin-right: -2px;
  background-repeat: no-repeat;
  background-size: 12px;
  background-position: center;
}

/* Hover effects for tabs */
.tab:hover {
  background-color: rgba(255, 255, 255, 0.5);
}

/* titlebar buttons hover effect */
.titlebar-button:hover,
.tab-close:hover {
  background-color: rgba(0, 0, 0, 0.08);
}

/* Selected tab styling */
.tab.selected {
  background-color: white;
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  border-left: 1px solid rgba(0, 0, 0, 0.12);
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

/* Styling for titlebar buttons */
.titlebar-button {
  height: 100%;
  min-width: 32px;
  width: 32px;
  background-repeat: no-repeat;
  background-size: 16px;
  background-position: center;
}

/* Add tab button styling */
#add-tab-button {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: 4px;
  height: calc(100% - 1px);
  margin-top: 1px;
}

/* Icons */
.add-icon {
  background-image: url(tabview-icons/add.svg);
  opacity: 0.54;
}

.close-icon {
  background-image: url(tabview-icons/close.svg);
}
```

this contains and uses the svg elements that you see throughout the css, the reason we use svgs instad of manually drawing out
the icons as it leaves more room for flexability in how we want the icons to be designed.

most of the code we have shown is modularized and can be swapped with something else without much issue.

# ui component locations > main Browser Components

the actual backend loading for the web browser can be found in src/renderer/ui/views/browserapp/

for example if you wanted to change the rendering component to not use electrons webviewtag (which will be changed in the future)
as webview is in a odd spot right now.
some things we have been thinking of is using another package like pupitear (i think thats how you spell it) to act as another browser layer over the existing electron app, so that we can still keep most of the current modular layout, but theres always better options

# ui component locations > main Browser Components > toolbar

to keep with the modular approach, we seperate the ui components into there own folders such as the toolbar for example, which can be found here (D:\LunarWolf-Browser-Desktop\src\renderer\ui\views\toolbar)

it contains all the important navigation elements, as of writing this its pretty basic in terms of layout and features, for example
there are only the needed buttons for going back and forward, along with reloading and typing things into the addressbar to navigate somewhere

the toolbar is also styled with css components aswell

toolbarstyle.css

```css
#browser-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px;
    background: #ffffff;
    border-bottom: 0.7px solid #ccc;
    position: relative;
}

#browser-toolbar button {
    padding: 6px;
    border: none;
    background: transparent;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 32px;
    height: 32px;
    transition: background-color 0.3s ease, transform 0.2s ease;
    margin-top: -2px;
}

/* Hover effect for the buttons */
#browser-toolbar button:hover {
    background-color: #f0f0f0; /* Light background color on hover */
    transform: scale(1.1); /* Slightly enlarge the button on hover */
}

#browser-toolbar button img {
    width: 17px;
    height: 17px;
    transition: transform 0.2s ease;
}

#browser-toolbar button:hover img {
    transform: scale(1.1);
}

#address-bar {
    flex-grow: 1;
    padding: 6px;
    font-size: 11.7px;
    border: 1px solid #ffffff;
    border-radius: 20px;
    background: white;
    outline: none;
    transition: border 0.3s ease;
    height: 30px;
    margin-top: -1px;
}

#address-bar:focus {
    border: 2px solid #0078d4;
}

#address-bar::placeholder {
    color: #888;
}
```

it contains the foundation for the buttons styles, addressbar style and other toolbar styling

next up is another important part of the toolbar, (the backend component) that not only applys the toolbar styling, but gives the tiolbarapp its functionallity for each element within it

the backend code for the toolbar

```ts
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

    // Address Bar
    const addressBar = document.createElement('input');
    addressBar.id = 'address-bar';
    addressBar.type = 'text';
    addressBar.placeholder = 'Enter your URL here...';
    addressBar.onkeypress = (event) => {
        if (event.key === 'Enter') {
            const activeWebview = getActiveWebview();
            if (activeWebview) {
                let url = addressBar.value;
                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    url = `https://${url}`; // Ensure the URL has the correct protocol
                }
                // Use the setURL method to load the new URL
                (activeWebview as Electron.WebviewTag).loadURL(url);
            }
        }
    };

    // Update address bar with the current URL of the active webview
    const updateAddressBar = () => {
        const activeWebview = getActiveWebview();
        if (activeWebview) {
            addressBar.value = (activeWebview as Electron.WebviewTag).getURL();
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
```

the code imports its needed svgs to make the buttons have icons and look more appealing, these files and there backends are all close to one another, so for example in the tabview directory, bothb the backend and the css are in the same folder, that also applys to most of the other things in this app.

# locations alltogether

browser layer

src/renderer/ui/views/browserapp -- contains backend and css

tabs and titlebar layer

src/renderer/ui/views/tabview -- contains backend and css

toolbar and navigation

src/renderer/ui/views/toolbar -- contains backend and css