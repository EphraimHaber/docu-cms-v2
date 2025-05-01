import { app, shell, BrowserWindow, ipcMain, dialog, protocol } from 'electron';
import path from 'path';
import fs from 'fs';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import {
  getProjectStructure,
  readDocusaurusFile,
  saveDocusaurusFile,
  createNewFile,
  deleteFile,
} from './fileUtils';

// Store the Docusaurus site path
let docusaurusSitePath: string | null = null;

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  // Register IPC handlers
  setupIpcHandlers(mainWindow);
}

// Setup all IPC handlers
function setupIpcHandlers(mainWindow: BrowserWindow) {
  // Select Docusaurus site folder
  ipcMain.handle('select-docusaurus-site', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: 'Select your Docusaurus site folder',
    });

    if (!result.canceled && result.filePaths.length > 0) {
      docusaurusSitePath = result.filePaths[0];
      return docusaurusSitePath;
    }
    return null;
  });

  // Get current Docusaurus site path
  ipcMain.handle('get-current-site-path', () => {
    return docusaurusSitePath;
  });

  // Get project structure
  ipcMain.handle('get-project-structure', async () => {
    if (!docusaurusSitePath) return null;
    return getProjectStructure(docusaurusSitePath);
  });

  // Read file
  ipcMain.handle('read-file', async (_, filePath) => {
    try {
      return await readDocusaurusFile(filePath);
    } catch (error) {
      console.error('Error reading file:', error);
      return null;
    }
  });

  // Save file
  ipcMain.handle('save-file', async (_, filePath, content, frontmatter) => {
    try {
      await saveDocusaurusFile(filePath, content, frontmatter);
      return true;
    } catch (error) {
      console.error('Error saving file:', error);
      return false;
    }
  });

  // Create new file
  ipcMain.handle('create-file', async (_, filePath, title, content, frontmatter) => {
    try {
      await createNewFile(filePath, title, content, frontmatter);
      return true;
    } catch (error) {
      console.error('Error creating file:', error);
      return false;
    }
  });

  // Delete file
  ipcMain.handle('delete-file', async (_, filePath) => {
    try {
      await deleteFile(filePath);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron');

  protocol.registerFileProtocol('monaco', (request, callback) => {
    const filePath = request.url.replace('monaco://', '');
    const normalizedPath = path.normalize(`${__dirname}/node_modules/monaco-editor/${filePath}`);
    callback({ path: normalizedPath });
  });

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
