import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Custom APIs for renderer
const api = {
  // Select Docusaurus site folder
  selectSite: () => ipcRenderer.invoke('select-docusaurus-site'),

  // Get current site path
  getCurrentSitePath: () => ipcRenderer.invoke('get-current-site-path'),

  // Get project structure
  getProjectStructure: () => ipcRenderer.invoke('get-project-structure'),

  // Read a file
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),

  // Save a file
  saveFile: (filePath: string, content: string, frontmatter: Record<string, any>) =>
    ipcRenderer.invoke('save-file', filePath, content, frontmatter),

  // Create a new file
  createFile: (
    filePath: string,
    title: string,
    content: string = '',
    frontmatter: Record<string, any> = {},
  ) => ipcRenderer.invoke('create-file', filePath, title, content, frontmatter),

  // Delete a file
  deleteFile: (filePath: string) => ipcRenderer.invoke('delete-file', filePath),
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
