/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RUSTY SHUTTERS — Overlay Animation Engine
 * Indian Storefront × Cyberpunk Workstation
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Orchestrates the entire cinematic shutter-opening sequence:
 *   1. Generate shutter slats
 *   2. Start sound effects
 *   3. Roll shutter up with screen shake
 *   4. Fire sparks + dust + light leaks
 *   5. Reveal workspace + text
 *   6. Fade out to desktop
 */

// ── State ───────────────────────────────────────────────────────────────────
let config = {};
let themeData = {};
let assetsPath = '';
let audioCtx = null;

// ── DOM References ──────────────────────────────────────────────────────────
const shutterContainer = document.getElementById('shutter-container');
const shutterBody = document.getElementById('shutter-body');
const effectsLayer = document.getElementById('effects-layer');
const sparksCanvas = document.getElementById('sparks-canvas');
const lightLeak = document.getElementById('light-leak');
const dustParticles = document.getElementById('dust-particles');
const textOverlay = document.getElementById('text-overlay');
const mainTextEl = document.getElementById('main-text');
const subtitleTextEl = document.getElementById('subtitle-text');
const timeDisplay = document.getElementById('time-display');
const fadeOverlay = document.getElementById('fade-overlay');
const shutterSound = document.getElementById('shutter-sound');
const ambientSound = document.getElementById('ambient-sound');
const workspaceParticles = document.getElementById('workspace-particles');
const logoImg = document.getElementById('custom-logo');

// ── Spark System ────────────────────────────────────────────────────────────
const ctx = sparksCanvas.getContext('2d');
let sparks = [];
let sparkAnimId = null;

class Spark {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 8;
    this.vy = Math.random() * -5 - 2;
    this.gravity = 0.15;
    this.life = 1.0;
    this.decay = Math.random() * 0.02 + 0.01;
    this.size = Math.random() * 3 + 1;
    this.color = color;
    this.trail = [];
  }

  update() {
    this.trail.push({ x: this.x, y: this.y, life: this.life });
    if (this.trail.length > 5) this.trail.shift();

    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.life -= this.decay;
    this.vx *= 0.99;
  }

  draw(ctx) {
    // Trail
    for (let i = 0; i < this.trail.length; i++) {
      const t = this.trail[i];
      const alpha = (i / this.trail.length) * this.life * 0.3;
      ctx.beginPath();
      ctx.arc(t.x, t.y, this.size * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 200, 50, ${alpha})`;
      ctx.fill();
    }

    // Main spark
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2);
    gradient.addColorStop(0, `rgba(255, 255, 200, ${this.life})`);
    gradient.addColorStop(0.5, `rgba(255, 180, 50, ${this.life * 0.6})`);
    gradient.addColorStop(1, `rgba(255, 100, 0, 0)`);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Glow
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 4, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 150, 30, ${this.life * 0.1})`;
    ctx.fill();
  }

  get isDead() {
    return this.life <= 0;
  }
}

function resizeCanvas() {
  sparksCanvas.width = window.innerWidth;
  sparksCanvas.height = window.innerHeight;
}

function emitSparks(x, y, count = 8) {
  const color = themeData.sparkColor || '#FFD700';
  for (let i = 0; i < count; i++) {
    sparks.push(new Spark(x, y, color));
  }
}

function animateSparks() {
  ctx.clearRect(0, 0, sparksCanvas.width, sparksCanvas.height);
  
  // Add motion blur effect
  ctx.globalCompositeOperation = 'lighter';
  
  sparks = sparks.filter(s => !s.isDead);
  sparks.forEach(s => {
    s.update();
    s.draw(ctx);
  });
  
  ctx.globalCompositeOperation = 'source-over';
  
  sparkAnimId = requestAnimationFrame(animateSparks);
}

// ── Dust System ─────────────────────────────────────────────────────────────
function createDustMotes(count = 40) {
  dustParticles.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const mote = document.createElement('div');
    mote.className = 'dust-mote';
    const startX = Math.random() * 100;
    const startY = 60 + Math.random() * 40; // Start from bottom area
    mote.style.left = `${startX}%`;
    mote.style.top = `${startY}%`;
    mote.style.setProperty('--dx', `${(Math.random() - 0.5) * 100}px`);
    mote.style.setProperty('--dy', `${-Math.random() * 200 - 50}px`);
    mote.style.animationDuration = `${3 + Math.random() * 4}s`;
    mote.style.animationDelay = `${Math.random() * 2}s`;
    mote.style.width = `${1 + Math.random() * 3}px`;
    mote.style.height = mote.style.width;
    dustParticles.appendChild(mote);
  }
}

// ── Workspace Particles ─────────────────────────────────────────────────────
function createWorkspaceParticles(count = 25) {
  workspaceParticles.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'workspace-particle';
    p.style.left = `${Math.random() * 100}%`;
    p.style.top = `${30 + Math.random() * 60}%`;
    p.style.animationDuration = `${4 + Math.random() * 6}s`;
    p.style.animationDelay = `${Math.random() * 4}s`;
    p.style.width = `${2 + Math.random() * 4}px`;
    p.style.height = p.style.width;
    workspaceParticles.appendChild(p);
  }
}

// ── Steam Particles (Chai Tapri theme) ──────────────────────────────────────
function createSteamParticles() {
  const bg = document.querySelector('.workspace-bg');
  for (let i = 0; i < 8; i++) {
    const steam = document.createElement('div');
    steam.className = 'steam-particle';
    steam.style.left = `${30 + Math.random() * 40}%`;
    steam.style.bottom = `${5 + Math.random() * 15}%`;
    steam.style.animationDuration = `${3 + Math.random() * 3}s`;
    steam.style.animationDelay = `${Math.random() * 3}s`;
    steam.style.width = `${30 + Math.random() * 40}px`;
    steam.style.height = steam.style.width;
    bg.appendChild(steam);
  }
}

// ── Shutter Slat Generation ─────────────────────────────────────────────────
function generateShutterSlats() {
  shutterBody.innerHTML = '';
  const slatHeight = 28;
  const numSlats = Math.ceil(window.innerHeight / slatHeight) + 5;

  for (let i = 0; i < numSlats; i++) {
    const slat = document.createElement('div');
    slat.className = 'shutter-slat';
    
    // Add random rust/dent marks for realism
    if (Math.random() < 0.12) slat.classList.add('rusty');
    if (Math.random() < 0.06) slat.classList.add('dented');
    
    // Slight random brightness variation
    const brightness = 0.9 + Math.random() * 0.2;
    slat.style.filter = `brightness(${brightness})`;
    
    shutterBody.appendChild(slat);
  }
}

// ── Text Setup ──────────────────────────────────────────────────────────────
function setupText() {
  let displayText = config.displayText || 'RUSTY NEVER STOP';
  let subtitleText = config.subtitleText || "Today's Grind Begins";
  
  // Random quote selection
  if (config.randomQuotes && config.quotes && config.quotes.length > 0) {
    displayText = config.quotes[Math.floor(Math.random() * config.quotes.length)];
  }
  
  // Build character spans grouped by word to prevent mid-word line breaks
  mainTextEl.innerHTML = '';
  const words = displayText.split(' ');
  let charIndex = 0;
  
  words.forEach((word, wordIdx) => {
    // Create a word wrapper that prevents breaking inside a word
    const wordSpan = document.createElement('span');
    wordSpan.className = 'text-word';
    
    // Add each character of the word inside the word wrapper
    word.split('').forEach((char) => {
      const span = document.createElement('span');
      span.className = 'text-char';
      span.style.setProperty('--i', charIndex);
      span.textContent = char;
      wordSpan.appendChild(span);
      charIndex++;
    });
    
    mainTextEl.appendChild(wordSpan);
    
    // Add a space between words (not after the last word)
    if (wordIdx < words.length - 1) {
      const spaceSpan = document.createElement('span');
      spaceSpan.className = 'text-char space';
      spaceSpan.style.setProperty('--i', charIndex);
      spaceSpan.textContent = '\u00A0';
      mainTextEl.appendChild(spaceSpan);
      charIndex++;
    }
  });
  
  subtitleTextEl.textContent = subtitleText;
  
  // Time display
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });
  timeDisplay.textContent = `${dateStr} • ${timeStr}`;
  
  // Logo
  if (config.logoPath) {
    logoImg.src = config.logoPath;
    logoImg.style.display = 'block';
  }
}

// ── Theme Application ───────────────────────────────────────────────────────
function applyTheme() {
  const root = document.documentElement;
  const td = themeData;
  
  if (td.primaryColor) root.style.setProperty('--primary', td.primaryColor);
  if (td.secondaryColor) root.style.setProperty('--secondary', td.secondaryColor);
  if (td.accentColor) root.style.setProperty('--accent', td.accentColor);
  if (td.bgGlow) root.style.setProperty('--bg-glow', td.bgGlow);
  if (td.sparkColor) root.style.setProperty('--spark-color', td.sparkColor);
  if (td.neonColor) root.style.setProperty('--neon-color', td.neonColor);
  if (td.textGlow) root.style.setProperty('--text-glow', td.textGlow);
  
  // Apply theme class to body
  const themeName = config.theme || 'chai-tapri';
  document.body.className = `theme-${themeName}`;
  
  // Theme-specific effects
  if (themeName === 'chai-tapri') {
    createSteamParticles();
  }
}

// ── Sound System ────────────────────────────────────────────────────────────
function generateShutterSoundBuffer() {
  // Generate a procedural metallic rolling shutter sound
  // This creates a convincing mechanical shutter effect using Web Audio API
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  
  const duration = (config.shutterDuration || 3500) / 1000;
  const sampleRate = audioCtx.sampleRate;
  const bufferSize = Math.floor(sampleRate * duration);
  const buffer = audioCtx.createBuffer(2, bufferSize, sampleRate);
  
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / sampleRate;
      const progress = i / bufferSize;
      
      // Envelope: loud start, sustain, then fade
      let envelope = 1.0;
      if (progress < 0.05) {
        envelope = progress / 0.05; // Attack
      } else if (progress > 0.85) {
        envelope = (1 - progress) / 0.15; // Release
      }
      
      // Metallic rolling: low frequency rumble
      const rumble = Math.sin(2 * Math.PI * 45 * t) * 0.3;
      
      // Chain rattling: periodic metallic clicks
      const clickRate = 12 + progress * 8; // Speeds up as it opens
      const clickPhase = (t * clickRate) % 1;
      const click = clickPhase < 0.05 ? Math.sin(2 * Math.PI * 2000 * t) * 0.2 : 0;
      
      // Metal scraping: filtered noise
      const noise = (Math.random() * 2 - 1) * 0.15;
      
      // Mechanical vibration: harmonics
      const vibration = 
        Math.sin(2 * Math.PI * 80 * t) * 0.15 +
        Math.sin(2 * Math.PI * 160 * t) * 0.08 +
        Math.sin(2 * Math.PI * 320 * t) * 0.04;
      
      // Combine all components
      let sample = (rumble + click + noise + vibration) * envelope * 0.4;
      
      // Stereo widening
      if (channel === 1) {
        sample *= (1 + Math.sin(2 * Math.PI * 0.5 * t) * 0.1);
      }
      
      // Soft clipping
      sample = Math.tanh(sample);
      
      data[i] = sample;
    }
  }
  
  return buffer;
}

function playShutterSound() {
  if (!config.enableSound) return;
  
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const buffer = generateShutterSoundBuffer();
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    
    // Add reverb-like effect with a convolver or simple delay
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.6;
    
    // Low-pass filter for more muffled, realistic sound
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2000;
    filter.Q.value = 0.7;
    
    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    source.start(0);
  } catch (err) {
    console.warn('[Rusty Shutters] Sound error:', err);
  }
}

function playImpactSound() {
  if (!config.enableSound || !audioCtx) return;
  
  try {
    const duration = 0.3;
    const sampleRate = audioCtx.sampleRate;
    const bufferSize = Math.floor(sampleRate * duration);
    const buffer = audioCtx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 15);
      const impact = 
        Math.sin(2 * Math.PI * 100 * t) * 0.5 +
        Math.sin(2 * Math.PI * 200 * t) * 0.3 +
        (Math.random() * 2 - 1) * 0.2;
      data[i] = impact * envelope * 0.5;
    }
    
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    source.start(0);
  } catch (err) {
    console.warn('[Rusty Shutters] Impact sound error:', err);
  }
}

// ── Light Leak Effect ───────────────────────────────────────────────────────
function updateLightLeak(progress) {
  if (!config.enableLightLeaks) return;
  
  const height = Math.min(progress * 120, 100);
  lightLeak.style.height = `${height}%`;
  
  if (progress > 0.05) {
    lightLeak.classList.add('active');
  }
  
  // Fade out as shutter fully opens
  if (progress > 0.7) {
    lightLeak.style.opacity = Math.max(0, 1 - (progress - 0.7) / 0.3);
  }
}

// ── Spark Emission During Opening ───────────────────────────────────────────
function emitOpeningSparks(progress) {
  if (!config.enableSparks) return;
  
  // Emit sparks from the bottom edge of the shutter as it rolls up
  const shutterBottom = window.innerHeight * (1 - progress);
  
  // Random sparks along the left and right edges
  if (Math.random() < 0.3) {
    const side = Math.random() < 0.5 ? 20 : window.innerWidth - 20;
    emitSparks(side, shutterBottom, 3 + Math.floor(Math.random() * 5));
  }
  
  // Occasional center sparks
  if (Math.random() < 0.1) {
    const x = window.innerWidth * 0.2 + Math.random() * window.innerWidth * 0.6;
    emitSparks(x, shutterBottom, 2);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN ANIMATION SEQUENCE
// ═══════════════════════════════════════════════════════════════════════════
function startAnimation(data) {
  config = data.config || {};
  themeData = data.themeData || {};
  assetsPath = data.assetsPath || '';
  
  // Set animation speed
  const speed = config.animationSpeed || 1;
  const shutterDuration = (config.shutterDuration || 3500) / speed;
  document.documentElement.style.setProperty('--shutter-duration', `${shutterDuration}ms`);
  document.documentElement.style.setProperty('--animation-speed', speed);
  
  // Initialize
  resizeCanvas();
  applyTheme();
  generateShutterSlats();
  setupText();
  createWorkspaceParticles();
  
  if (config.enableDustParticles) {
    createDustMotes();
  }
  
  // Start canvas animation loop
  animateSparks();
  
  // ── Phase 1: Initial pause (shutter visible, building tension) ────────
  setTimeout(() => {
    // Play the shutter rolling sound
    playShutterSound();
    
    // Start screen shake
    if (config.enableShake) {
      document.body.classList.add('shaking');
    }
    
    // Initial impact sound (handle grab)
    playImpactSound();
    
    // ── Phase 2: Roll the shutter up ────────────────────────────────────
    shutterContainer.classList.add('opening');
    
    // Track shutter progress for effects
    const startTime = performance.now();
    const duration = shutterDuration;
    
    function trackProgress() {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Update light leak
      updateLightLeak(progress);
      
      // Emit sparks during opening
      emitOpeningSparks(progress);
      
      if (progress < 1) {
        requestAnimationFrame(trackProgress);
      }
    }
    
    requestAnimationFrame(trackProgress);
    
    // ── Phase 3: Show text (after shutter is ~60% open) ─────────────────
    setTimeout(() => {
      textOverlay.classList.add('visible');
    }, shutterDuration * 0.5);
    
    // ── Phase 4: Stop shake, begin fadeout ───────────────────────────────
    setTimeout(() => {
      document.body.classList.remove('shaking');
      
      // Stop sparks
      if (sparkAnimId) {
        cancelAnimationFrame(sparkAnimId);
      }
    }, shutterDuration);
    
    // ── Phase 5: Fade out to desktop ────────────────────────────────────
    const fadeDelay = config.fadeOutDelay || 1500;
    setTimeout(() => {
      fadeOverlay.classList.add('fading-out');
      
      // Make the entire body fade to transparent
      document.body.style.transition = 'opacity 1.5s ease-out';
      document.body.style.opacity = '0';
      
      // Signal completion
      setTimeout(() => {
        if (window.rustyShutters) {
          window.rustyShutters.animationComplete();
        }
      }, 1500);
    }, shutterDuration + fadeDelay);
    
  }, 500); // Initial pause before animation starts
}

// ── Window Resize Handler ───────────────────────────────────────────────────
window.addEventListener('resize', () => {
  resizeCanvas();
});

// ── Listen for animation start from main process ────────────────────────────
if (window.rustyShutters) {
  window.rustyShutters.onStartAnimation((data) => {
    startAnimation(data);
  });
} else {
  // Fallback: if opened directly in browser for testing
  console.log('[Rusty Shutters] Running in standalone mode');
  setTimeout(() => {
    startAnimation({
      config: {
        theme: 'chai-tapri',
        animationSpeed: 1,
        displayText: 'RUSTY NEVER STOP',
        subtitleText: "Today's Grind Begins",
        enableSound: true,
        enableShake: true,
        enableSparks: true,
        enableDustParticles: true,
        enableLightLeaks: true,
        shutterDuration: 3500,
        fadeOutDelay: 1500,
        randomQuotes: false
      },
      themeData: {
        primaryColor: '#FF6B35',
        secondaryColor: '#F7C948',
        accentColor: '#E8451E',
        bgGlow: '#2D1B00',
        sparkColor: '#FFD700',
        neonColor: '#FF8C42',
        textGlow: '#FF6B35'
      },
      assetsPath: ''
    });
  }, 500);
}
