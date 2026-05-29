/**
 * Rusty Shutters — Icon Generator
 * Generates a minimal PNG tray icon programmatically
 * No external dependencies needed — uses raw PNG encoding
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPNG(width, height, rgbaData) {
  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type (RGBA)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  
  const ihdrChunk = createChunk('IHDR', ihdr);
  
  // IDAT Chunk - image data
  const rawData = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    rawData[y * (1 + width * 4)] = 0; // filter type: None
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4;
      const dstIdx = y * (1 + width * 4) + 1 + x * 4;
      rawData[dstIdx] = rgbaData[srcIdx];
      rawData[dstIdx + 1] = rgbaData[srcIdx + 1];
      rawData[dstIdx + 2] = rgbaData[srcIdx + 2];
      rawData[dstIdx + 3] = rgbaData[srcIdx + 3];
    }
  }
  
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);
  
  // IEND Chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  
  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = crc32(crcData);
  
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc >>> 0, 0);
  
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function crc32(buffer) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buffer.length; i++) {
    crc ^= buffer[i];
    for (let j = 0; j < 8; j++) {
      if (crc & 1) {
        crc = (crc >>> 1) ^ 0xEDB88320;
      } else {
        crc = crc >>> 1;
      }
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function generateIcon() {
  const size = 256;
  const rgba = Buffer.alloc(size * size * 4);
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const cx = x - size / 2;
      const cy = y - size / 2;
      const dist = Math.sqrt(cx * cx + cy * cy);
      const maxR = size / 2 - 4;
      
      if (dist > maxR) {
        // Transparent outside
        rgba[idx + 3] = 0;
        continue;
      }
      
      // Outer ring - dark metallic
      if (dist > maxR - 12) {
        const t = (maxR - dist) / 12;
        rgba[idx] = Math.floor(60 + t * 30);
        rgba[idx + 1] = Math.floor(50 + t * 20);
        rgba[idx + 2] = Math.floor(40 + t * 15);
        rgba[idx + 3] = 255;
        continue;
      }
      
      // Shutter slats area (top 60%)
      if (cy < size * 0.1) {
        const slatIdx = Math.floor((y / size) * 12);
        const slatPhase = ((y / size) * 12) % 1;
        
        let brightness = 0.4 + 0.15 * Math.sin(slatPhase * Math.PI);
        
        // Add rust spots
        const rustNoise = Math.sin(x * 0.5 + y * 0.3) * Math.sin(x * 0.2 - y * 0.7);
        if (rustNoise > 0.7) {
          rgba[idx] = Math.floor(140 * brightness);
          rgba[idx + 1] = Math.floor(90 * brightness);
          rgba[idx + 2] = Math.floor(50 * brightness);
        } else {
          rgba[idx] = Math.floor(110 * brightness);
          rgba[idx + 1] = Math.floor(110 * brightness);
          rgba[idx + 2] = Math.floor(105 * brightness);
        }
        rgba[idx + 3] = 255;
        continue;
      }
      
      // Bottom area - warm neon glow
      const glowDist = dist / maxR;
      const angle = Math.atan2(cy, cx);
      
      // Warm orange/red neon
      const neonPulse = 0.7 + 0.3 * Math.sin(angle * 3 + glowDist * 5);
      rgba[idx] = Math.floor(255 * neonPulse * (1 - glowDist * 0.5));
      rgba[idx + 1] = Math.floor(107 * neonPulse * (1 - glowDist * 0.3));
      rgba[idx + 2] = Math.floor(53 * neonPulse * (1 - glowDist * 0.2));
      rgba[idx + 3] = 255;
    }
  }
  
  return createPNG(size, size, rgba);
}

// Generate and save icons
const assetsDir = path.join(__dirname, 'assets');

// Main icon (256x256 for the app)
const iconPNG = generateIcon();
fs.writeFileSync(path.join(assetsDir, 'icon.png'), iconPNG);
console.log('✅ Generated assets/icon.png (256x256)');

// Also generate a 16x16 tray icon
function generateTrayIcon() {
  const size = 16;
  const rgba = Buffer.alloc(size * size * 4);
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const cx = x - size / 2;
      const cy = y - size / 2;
      const dist = Math.sqrt(cx * cx + cy * cy);
      
      if (dist > 7) {
        rgba[idx + 3] = 0;
      } else if (dist > 5.5) {
        // Border
        rgba[idx] = 80; rgba[idx+1] = 60; rgba[idx+2] = 40; rgba[idx+3] = 255;
      } else if (cy < -1) {
        // Top: metallic gray (shutter)
        rgba[idx] = 100; rgba[idx+1] = 100; rgba[idx+2] = 95; rgba[idx+3] = 255;
      } else {
        // Bottom: warm orange glow
        rgba[idx] = 255; rgba[idx+1] = 107; rgba[idx+2] = 53; rgba[idx+3] = 255;
      }
    }
  }
  
  return createPNG(size, size, rgba);
}

const trayPNG = generateTrayIcon();
fs.writeFileSync(path.join(assetsDir, 'tray-icon.png'), trayPNG);
console.log('✅ Generated assets/tray-icon.png (16x16)');

console.log('\n🏪 Rusty Shutters icons generated successfully!');
