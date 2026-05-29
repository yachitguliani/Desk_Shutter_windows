# 🏪 Rusty Shutters

### *"Rusty Never Stop."*

A cinematic Indian storefront-opening overlay for Windows. Every time your laptop wakes from sleep or the lid opens, a realistic metallic rolling shutter animation plays — revealing a glowing cyberpunk workspace behind it.

> The vibe: **A mechanic shop + hacker lab + startup office opening for business.**

---

## 🎬 What Happens

1. 🔒 You open your laptop
2. 🎵 A metallic rolling shutter sound plays
3. 🏪 A fullscreen animated shop shutter appears closed
4. ⬆️ The shutter rolls up with mechanical vibration and screen shake
5. ✨ Sparks, dust particles, and light leaks appear during opening
6. 🌆 A glowing cyberpunk workspace is revealed behind the shutter
7. 💬 Text fades in dramatically (e.g., *"RUSTY NEVER STOP"*)
8. 🖥️ The overlay smoothly fades away into your normal desktop

**Total time: ~5 seconds. Zero disruption. Maximum style.**

---

## 🎨 Themes

| Theme | Vibe | Colors |
|-------|------|--------|
| ☕ **Chai Tapri Mode** | Warm lights, kettle steam, chai shop ambience | Orange/Gold |
| 🔧 **Mechanic Garage Mode** | Industrial shutter, sparks, tool sounds | Red/Silver |
| 💻 **Cyber Cafe Mode** | RGB lighting, CRT scanlines, hacker aesthetic | Green/Purple |
| 🏢 **Startup Office Mode** | Clean neon office, modern tech vibe | Purple/Pink |

Switch themes instantly from the system tray.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ installed
- **Windows** 10/11

### Install & Run

```bash
# Clone or download the project
cd shutter_open

# Install dependencies
npm install

# Generate tray icons
node generate-icons.js

# Run in dev mode (plays animation immediately for testing)
npm run dev

# Run normally (waits for sleep/wake events)
npm start
```

### Build Executable (.exe)

```bash
npm run build
```

The installer will be generated in the `dist/` folder.

---

## ⚙️ Configuration

Edit `config.json` in the project root to customize:

```jsonc
{
  "theme": "chai-tapri",           // Theme name
  "animationSpeed": 1.0,           // 0.5 = slow, 2.0 = fast
  "displayText": "RUSTY NEVER STOP", // Main text
  "subtitleText": "Today's Grind Begins", // Subtitle
  "logoPath": "",                   // Path to your company logo
  "enableSound": true,              // Toggle sound effects
  "enableShake": true,              // Screen shake during opening
  "enableSparks": true,             // Spark effects at shutter edges
  "enableDustParticles": true,      // Dust motes floating up
  "enableLightLeaks": true,         // Light bleeding from bottom
  "autoLaunch": true,               // Start with Windows
  "shutterDuration": 3500,          // Animation length (ms)
  "fadeOutDelay": 1500,             // How long text stays visible (ms)
  "randomQuotes": true,             // Pick random text each time
  "quotes": [                      // Pool of random quotes
    "RUSTY NEVER STOP",
    "OFFICE HOURS STARTED",
    "System Online. Coffee Loading...",
    "Code. Ship. Repeat."
  ]
}
```

### Theme Colors

Each theme in `config.json` → `themes` has customizable colors:
- `primaryColor` — Main accent color
- `secondaryColor` — Text/subtitle color
- `bgGlow` — Background workspace color
- `sparkColor` — Spark particle color
- `neonColor` — Neon line accent color

---

## 🧩 Project Structure

```
shutter_open/
├── src/
│   ├── main.js           # Electron main process (sleep/wake detection, tray)
│   ├── preload.js         # Secure IPC bridge
│   ├── overlay.html       # Overlay DOM structure
│   ├── overlay.css        # All animations, themes, effects
│   └── overlay.js         # Animation engine, spark system, procedural audio
├── assets/
│   ├── sounds/            # Custom sound files (optional)
│   ├── textures/          # Custom textures (optional)
│   ├── fonts/             # Custom fonts (optional)
│   ├── icon.png           # App icon (256x256)
│   └── tray-icon.png      # Tray icon (16x16)
├── config.json            # User configuration
├── generate-icons.js      # Icon generator utility
├── package.json           # Project manifest & build config
└── README.md              # This file
```

---

## 🔊 Sound System

Sounds are generated **procedurally** using the Web Audio API — no external sound files needed! The system creates:

- **Metallic rolling sound** — Low rumble + chain rattling + metal scraping
- **Impact sound** — When the shutter handle is grabbed
- All synthesized in real-time for zero file size overhead

To use custom sound files, place `.mp3` or `.wav` files in `assets/sounds/` and update the config.

---

## 🛡️ Safety & Permissions

- ✅ **No admin access required**
- ✅ **No network requests** — fully offline
- ✅ **No data collection** — zero telemetry
- ✅ **Non-blocking** — overlay ignores mouse events
- ✅ **15-second safety timeout** — overlay auto-closes if anything goes wrong
- ✅ **Office-safe** — professional aesthetic, not gamer cringe

---

## 🔄 Wake/Sleep Detection

The app detects these system events:

| Event | Trigger |
|-------|---------|
| `resume` | System wakes from sleep (lid open, power button) |
| `unlock-screen` | Screen is unlocked after lock screen |

The overlay plays automatically after a small delay (to let the screen fully wake up).

---

## 🖥️ System Tray

When running, Rusty Shutters lives in the Windows system tray. Right-click for:

- ▶ **Play Animation Now** — Test the animation anytime
- 🎨 **Theme Selector** — Switch between all 4 themes
- 🔊 **Sound Toggle** — Enable/disable sound effects
- 🚪 **Quit** — Exit the app

---

## 📦 Building & Sharing

### Build the installer

```bash
npm run build
```

This creates an `.exe` installer in `dist/`. Share this single file with teammates.

### Sharing with teammates

1. Build the `.exe` using the command above
2. Share the installer file
3. Teammates run the installer — it auto-starts with Windows
4. Each person can customize their `config.json` in the install directory

---

## 🎯 Animation Details

| Feature | Description |
|---------|-------------|
| **Shutter Slats** | 28px metallic slats with random rust/dent marks |
| **Screen Shake** | Subtle camera vibration during shutter roll |
| **Sparks** | Canvas-based particles with motion trails and glow |
| **Dust Motes** | CSS particles floating upward from the bottom |
| **Light Leaks** | Warm light bleeding from under the shutter |
| **Neon Lines** | Flickering accent lines in the workspace |
| **CRT Scanlines** | Theme-specific effect for Cyber Cafe mode |
| **Steam Particles** | Theme-specific effect for Chai Tapri mode |
| **Text Animation** | Per-character reveal with blur-to-sharp transition |
| **Time Display** | Shows current date and time |

All animations are GPU-accelerated using `will-change`, `transform`, and `backface-visibility` for smooth 60fps performance.

---

## 🎨 Custom Logo

To add your company/team logo:

1. Place your logo image in the `assets/` folder
2. Update `config.json`:
   ```json
   "logoPath": "./assets/my-logo.png"
   ```
3. The logo will appear above the main text with a neon glow effect

---

## 📋 FAQ

**Q: Will this slow down my laptop?**
A: No. The app uses <10MB RAM when idle and only activates during wake events. The animation is GPU-accelerated.

**Q: Can I use this at work?**
A: Yes. It's designed to be office-safe. The aesthetic is professional-nerdy, not gamer-cringe.

**Q: Does it need internet?**
A: No. Everything runs 100% offline.

**Q: How do I stop it temporarily?**
A: Right-click the tray icon → Quit. To restart, run the app again.

**Q: Can I add custom sounds?**
A: Yes! Place audio files in `assets/sounds/` and update the config.

---

## 🛠️ Development

```bash
# Run with DevTools (animation plays immediately)
npm run dev

# Package without installer (for testing)
npm run pack

# Build full installer
npm run build
```

---

## 📜 License

MIT — Do whatever you want. Rusty Never Stop. 🏪

---

<p align="center">
  <strong>🏪 Rusty Shutters</strong><br>
  <em>"A mechanic shop + hacker lab + startup office opening for business."</em>
</p>
