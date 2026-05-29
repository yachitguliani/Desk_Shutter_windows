/**
 * Rusty Shutters — Preload Script
 * Securely bridges main process ↔ renderer via contextBridge
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('rustyShutters', {
  // Receive animation start command from main process
  onStartAnimation: (callback) => {
    ipcRenderer.on('start-animation', (event, data) => callback(data));
  },
  
  // Signal animation completion back to main process
  animationComplete: () => {
    ipcRenderer.send('animation-complete');
  },
  
  // Request config
  requestConfig: () => {
    ipcRenderer.send('request-config');
  },
  
  onConfigData: (callback) => {
    ipcRenderer.on('config-data', (event, data) => callback(data));
  }
});
