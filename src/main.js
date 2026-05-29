/**
 * Rusty Shutters — Main Process
 * Cinematic Indian storefront startup overlay for Windows
 * 
 * Handles:
 * - System wake/sleep detection via powerMonitor
 * - Fullscreen transparent overlay window
 * - Auto-launch on system startup
 * - Tray icon for easy access
 */

const { app, BrowserWindow, powerMonitor, Tray, Menu, ipcMain, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const AutoLaunch = require('auto-launch');

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

// ── Config ──────────────────────────────────────────────────────────────────
function getConfigPath() {
  // In production, check extraResources first
  const prodPath = path.join(process.resourcesPath, 'config.json');
  const devPath = path.join(__dirname, '..', 'config.json');
  
  if (fs.existsSync(prodPath)) return prodPath;
  return devPath;
}

function loadConfig() {
  try {
    const configPath = getConfigPath();
    const raw = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load config:', err);
    return getDefaultConfig();
  }
}

function getDefaultConfig() {
  return {
    theme: 'chai-tapri',
    animationSpeed: 1.0,
    displayText: 'RUSTY NEVER STOP',
    subtitleText: "Today's Grind Begins",
    enableSound: true,
    enableShake: true,
    enableSparks: true,
    enableDustParticles: true,
    enableLightLeaks: true,
    shutterDuration: 3500,
    fadeOutDelay: 1500,
    randomQuotes: true,
    quotes: ['RUSTY NEVER STOP', 'OFFICE HOURS STARTED']
  };
}

// ── Globals ─────────────────────────────────────────────────────────────────
let overlayWindow = null;
let tray = null;
let config = loadConfig();
let isDevMode = process.argv.includes('--dev');
let isAnimating = false;

// ── Assets Path ─────────────────────────────────────────────────────────────
function getAssetsPath() {
  const prodPath = path.join(process.resourcesPath, 'assets');
  const devPath = path.join(__dirname, '..', 'assets');
  if (fs.existsSync(prodPath)) return prodPath;
  return devPath;
}

// ── Overlay Window ──────────────────────────────────────────────────────────
function createOverlayWindow() {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.close();
  }

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  overlayWindow = new BrowserWindow({
    width: primaryDisplay.size.width,
    height: primaryDisplay.size.height,
    x: 0,
    y: 0,
    fullscreen: true,
    frame: false,
    transparent: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    movable: false,
    focusable: false,
    hasShadow: false,
    backgroundColor: '#000000',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      backgroundThrottling: false
    }
  });

  // Prevent the overlay from being interacted with
  overlayWindow.setIgnoreMouseEvents(true);

  overlayWindow.loadFile(path.join(__dirname, 'overlay.html'));

  overlayWindow.webContents.on('did-finish-load', () => {
    overlayWindow.webContents.send('start-animation', {
      config: config,
      assetsPath: getAssetsPath(),
      themeData: config.themes[config.theme] || config.themes['chai-tapri']
    });
  });

  // Auto-close safety net (never block desktop for more than 15 seconds)
  const safetyTimeout = setTimeout(() => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.close();
      overlayWindow = null;
      isAnimating = false;
    }
  }, 15000);

  overlayWindow.on('closed', () => {
    clearTimeout(safetyTimeout);
    overlayWindow = null;
    isAnimating = false;
  });

  return overlayWindow;
}

// ── Play Animation ──────────────────────────────────────────────────────────
function playShutterAnimation() {
  if (isAnimating) return;
  isAnimating = true;
  
  console.log('[Rusty Shutters] 🎬 Opening the shop...');
  createOverlayWindow();
}

// ── IPC Handlers ────────────────────────────────────────────────────────────
ipcMain.on('animation-complete', () => {
  console.log('[Rusty Shutters] ✅ Animation complete, closing overlay');
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.close();
  }
  isAnimating = false;
});

ipcMain.on('request-config', (event) => {
  event.reply('config-data', {
    config: config,
    assetsPath: getAssetsPath(),
    themeData: config.themes[config.theme] || config.themes['chai-tapri']
  });
});

// ── Tray Icon ───────────────────────────────────────────────────────────────
function createTray() {
  // Destroy existing tray before recreating
  if (tray) {
    tray.destroy();
    tray = null;
  }

  const iconPath = path.join(getAssetsPath(), 'tray-icon.png');
  const fallbackIconPath = path.join(getAssetsPath(), 'icon.png');
  
  let trayIcon;
  if (fs.existsSync(iconPath)) {
    trayIcon = iconPath;
  } else if (fs.existsSync(fallbackIconPath)) {
    trayIcon = fallbackIconPath;
  } else {
    // Programmatic fallback using nativeImage
    const { nativeImage } = require('electron');
    trayIcon = createTrayIconBuffer();
  }

  tray = new Tray(trayIcon);
  tray.setToolTip('Rusty Shutters — Rusty Never Stop.');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '🏪 Rusty Shutters',
      enabled: false,
    },
    { type: 'separator' },
    {
      label: '▶ Play Animation Now',
      click: () => playShutterAnimation()
    },
    { type: 'separator' },
    {
      label: '☕ Chai Tapri Mode',
      type: 'radio',
      checked: config.theme === 'chai-tapri',
      click: () => switchTheme('chai-tapri')
    },
    {
      label: '🔧 Mechanic Garage Mode',
      type: 'radio',
      checked: config.theme === 'mechanic-garage',
      click: () => switchTheme('mechanic-garage')
    },
    {
      label: '💻 Cyber Cafe Mode',
      type: 'radio',
      checked: config.theme === 'cyber-cafe',
      click: () => switchTheme('cyber-cafe')
    },
    {
      label: '🏢 Startup Office Mode',
      type: 'radio',
      checked: config.theme === 'startup-office',
      click: () => switchTheme('startup-office')
    },
    { type: 'separator' },
    {
      label: config.enableSound ? '🔊 Sound: ON' : '🔇 Sound: OFF',
      click: () => toggleSound()
    },
    { type: 'separator' },
    {
      label: '🚪 Quit',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
}

function switchTheme(themeName) {
  config.theme = themeName;
  saveConfig();
  createTray(); // Rebuild tray menu to update radio states
}

function toggleSound() {
  config.enableSound = !config.enableSound;
  saveConfig();
  createTray();
}

function saveConfig() {
  try {
    const configPath = getConfigPath();
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save config:', err);
  }
}

// ── Tray Icon Generator ────────────────────────────────────────────────────
function createTrayIconBuffer() {
  // Create a minimal 16x16 PNG icon (orange square with dark border)
  // This is a pre-generated minimal PNG buffer for the tray
  const { nativeImage } = require('electron');
  
  // Create a 32x32 canvas-like icon
  const size = 32;
  const channels = 4; // RGBA
  const buffer = Buffer.alloc(size * size * channels);
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * channels;
      const isBorder = x < 2 || x >= size - 2 || y < 2 || y >= size - 2;
      const isInner = x >= 4 && x < size - 4 && y >= 4 && y < size - 4;
      
      if (isBorder) {
        // Dark metallic border
        buffer[idx] = 80;     // R
        buffer[idx + 1] = 60; // G
        buffer[idx + 2] = 40; // B
        buffer[idx + 3] = 255; // A
      } else if (isInner) {
        // Warm orange center
        buffer[idx] = 255;    // R
        buffer[idx + 1] = 107; // G
        buffer[idx + 2] = 53;  // B
        buffer[idx + 3] = 255; // A
      } else {
        // Metallic gray mid-ring
        buffer[idx] = 140;    // R
        buffer[idx + 1] = 130; // G
        buffer[idx + 2] = 120; // B
        buffer[idx + 3] = 255; // A
      }
    }
  }
  
  return nativeImage.createFromBuffer(buffer, {
    width: size,
    height: size
  });
}

// ── Auto-Launch Setup ───────────────────────────────────────────────────────
function setupAutoLaunch() {
  const autoLauncher = new AutoLaunch({
    name: 'Rusty Shutters',
    path: app.getPath('exe'),
    isHidden: true
  });

  if (config.autoLaunch) {
    autoLauncher.isEnabled().then((isEnabled) => {
      if (!isEnabled) {
        autoLauncher.enable();
        console.log('[Rusty Shutters] Auto-launch enabled');
      }
    }).catch(err => {
      console.log('[Rusty Shutters] Auto-launch setup note:', err.message);
    });
  }
}

// ── App Lifecycle ───────────────────────────────────────────────────────────
app.whenReady().then(() => {
  console.log('[Rusty Shutters] 🏪 App started — Rusty Never Stop.');
  
  createTray();
  setupAutoLaunch();

  // ── Power Monitor: detect wake from sleep ────────────────────────────────
  powerMonitor.on('resume', () => {
    console.log('[Rusty Shutters] 💤→🔥 System resumed from sleep!');
    // Small delay to let the screen fully wake up
    setTimeout(() => {
      playShutterAnimation();
    }, 800);
  });

  powerMonitor.on('unlock-screen', () => {
    console.log('[Rusty Shutters] 🔓 Screen unlocked!');
    setTimeout(() => {
      playShutterAnimation();
    }, 500);
  });

  // In dev mode, play animation immediately for testing
  if (isDevMode) {
    console.log('[Rusty Shutters] 🧪 Dev mode — playing animation now');
    setTimeout(() => {
      playShutterAnimation();
    }, 1000);
  }
});

// Keep the app running in background
app.on('window-all-closed', (e) => {
  // Don't quit — keep running in tray
  e.preventDefault?.();
});

app.on('before-quit', () => {
  if (tray) {
    tray.destroy();
  }
});

// Handle second instance
app.on('second-instance', () => {
  // If someone tries to run a second instance, play the animation
  playShutterAnimation();
});
