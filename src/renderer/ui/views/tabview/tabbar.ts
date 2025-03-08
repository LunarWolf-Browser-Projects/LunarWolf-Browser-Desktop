/*
 * MIT License
 *
 * Copyright (c) 2020 Eryk Rakowski
 *
 * Copyright (c) 2025 LunarWolf Browser Devs.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * NOTE: some of this code you see i used from the Ecobrowser project (https://github.com/sentialx/ecobrowser), (most of it was rewritten to work with this app tho.)
 * which is also licensed under the MIT License. For proof that their repo includes the MIT License, refer to the
 * 'license-proof' folder located in 'src/renderer/ui/views/tabview/license-proof'.
 *
 * NOTE: This project serves as a working browser, while the Ecobrowser project is more of a proof of concept as of the time of writing.
 *
 * Modified Version Changes:
 * - Completely restructured the code to use a more native approach, replacing the simpler JavaScript/HTML base used in the original.
 * - Enhanced functionality and design to suit the goals of this project.
 *
 *  NOTE: even tho this code contains almost completly diffrent implamentations, because the css contains there ui and style, this code is subject to there mit license, accept for the parts that are not in the project, i think so.
 *
 * NOTE: in the future, this code will not require this notice as it will be rewritten completly so that i am not relying on some of there work.
 *
 */

// Extend CSSStyleDeclaration to recognize webkitAppRegion
declare global {
  interface CSSStyleDeclaration {
    webkitAppRegion?: string;
  }
}
// tab and titlebar style css has been moved to the main process.
// import './tabbarstyle.css';
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
