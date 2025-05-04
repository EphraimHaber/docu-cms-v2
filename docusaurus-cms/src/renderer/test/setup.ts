// Test setup file for Vitest with React Testing Library
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
// Automatically runs cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock the electron/window.api for testing
vi.mock('electron', () => ({
  contextBridge: {
    exposeInMainWorld: vi.fn(),
  },
  ipcRenderer: {
    invoke: vi.fn(),
  },
}));

// Mock the global window.api
vi.stubGlobal('api', {
  selectSite: vi.fn(),
  getCurrentSitePath: vi.fn(),
  getProjectStructure: vi.fn(),
  readFile: vi.fn(),
  saveFile: vi.fn(),
  createFile: vi.fn(),
  deleteFile: vi.fn(),
});
