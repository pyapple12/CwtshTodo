// Simple script to generate PWA icons from SVG
// Run: node scripts/generate-icons.js
// Requires: npm install sharp

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const iconsDir = path.join(__dirname, '../public/icons');

try {
  const sharp = (await import('sharp')).default;

  const svgBuffer = fs.readFileSync(path.join(iconsDir, 'icon.svg'));

  // Generate 192x192 icon
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(iconsDir, 'icon-192.png'));

  // Generate 512x512 icon
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, 'icon-512.png'));

  console.log('Icons generated successfully!');
} catch (error) {
  console.error('Error generating icons:', error.message);
  console.log('\nTo generate icons, please:');
  console.log('1. Install sharp: npm install sharp');
  console.log('2. Run: node scripts/generate-icons.js');
  console.log('\nOr manually create PNG icons at:');
  console.log('  - public/icons/icon-192.png (192x192px)');
  console.log('  - public/icons/icon-512.png (512x512px)');
}
