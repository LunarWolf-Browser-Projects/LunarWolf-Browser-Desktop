import { Menu, BrowserWindow, app, MenuItemConstructorOptions } from 'electron';

export function createOptionsMenu(mainWindow: BrowserWindow): Menu {
    const template: MenuItemConstructorOptions[] = [
        {
            label: 'New Tab',
            accelerator: 'CmdOrCtrl+T',
            click: () => {
                mainWindow.webContents.send('new-tab');
            }
        },
        {
            label: 'New Window',
            accelerator: 'CmdOrCtrl+N',
            click: () => {
                mainWindow.webContents.send('new-window');
            }
        },
        {
            label: 'New Incognito Window',
            accelerator: 'CmdOrCtrl+Shift+N',
            click: () => {
                mainWindow.webContents.send('new-incognito-window');
            }
        },
        { type: 'separator' } as MenuItemConstructorOptions, // Explicitly specify the type
        {
            label: 'User Profile Icon',
            enabled: false
        },
        { type: 'separator' } as MenuItemConstructorOptions, // Explicitly specify the type
        {
            label: 'Passwords',
            accelerator: 'CmdOrCtrl+Shift+P',
            click: () => {
                mainWindow.webContents.send('open-passwords');
            }
        },
        {
            label: 'History',
            accelerator: 'CmdOrCtrl+H',
            click: () => {
                mainWindow.webContents.send('open-history');
            }
        },
        {
            label: 'View Downloads',
            accelerator: 'CmdOrCtrl+J',
            click: () => {
                mainWindow.webContents.send('open-downloads');
            }
        },
        {
            label: 'Bookmarks',
            accelerator: 'CmdOrCtrl+B',
            click: () => {
                mainWindow.webContents.send('open-bookmarks');
            }
        },
        {
            label: 'Extensions',
            accelerator: 'CmdOrCtrl+Shift+E',
            click: () => {
                mainWindow.webContents.send('open-extensions');
            }
        },
        {
            label: 'Remove Browsing History',
            accelerator: 'CmdOrCtrl+Shift+Delete',
            click: () => {
                mainWindow.webContents.send('remove-browsing-history');
            }
        },
        { type: 'separator' } as MenuItemConstructorOptions, // Explicitly specify the type
        {
            label: 'Zoom',
            submenu: [
                {
                    label: 'Zoom In',
                    accelerator: 'CmdOrCtrl+=',
                    click: () => {
                        mainWindow.webContents.send('zoom-in');
                    }
                },
                {
                    label: 'Zoom Out',
                    accelerator: 'CmdOrCtrl+-',
                    click: () => {
                        mainWindow.webContents.send('zoom-out');
                    }
                },
                {
                    label: 'Reset Zoom',
                    accelerator: 'CmdOrCtrl+0',
                    click: () => {
                        mainWindow.webContents.send('reset-zoom');
                    }
                }
            ]
        },
        { type: 'separator' } as MenuItemConstructorOptions, // Explicitly specify the type
        {
            label: 'Print',
            accelerator: 'CmdOrCtrl+P',
            click: () => {
                mainWindow.webContents.send('print');
            }
        },
        {
            label: 'Settings',
            click: () => {
                mainWindow.webContents.send('open-settings');
            }
        },
        {
            label: 'About',
            click: () => {
                mainWindow.webContents.send('open-about');
            }
        },
        {
            label: 'Quit',
            accelerator: 'CmdOrCtrl+Q',
            click: () => {
                app.quit();
            }
        }
    ];

    return Menu.buildFromTemplate(template);
}