// Generates neutral, clearly-labelled placeholder images into src/assets/placeholders/.
// Replace them with the owner's photographs (questionnaire section 6). Run: node scripts/make-placeholder-images.mjs
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const OUT = 'src/assets/placeholders';
mkdirSync(OUT, { recursive: true });

// Tones drawn from the brand: charcoal, warm stone, sand, deep green.
const palettes = [
  ['#2a2b33', '#4a4a52', '#c9c4b8'],
  ['#23242b', '#3b4a45', '#9fb5ac'],
  ['#2d2a27', '#5a5148', '#d8cdbd'],
  ['#1f2026', '#33343d', '#8a8a8f'],
  ['#262a2e', '#465058', '#b8c0c4'],
  ['#2b2723', '#6b5d4e', '#e2d6c3'],
  ['#1d2422', '#2f4a42', '#7fae9c'],
  ['#28282d', '#555560', '#cfcfd4'],
];

function building(w, h, i, [dark, mid, light]) {
  // Abstract architectural massing: stacked volumes, a horizon, thin line work.
  const g = h * 0.72;
  const x = w * (0.18 + (i % 3) * 0.08);
  const bw = w * 0.5;
  return `
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${mid}"/><stop offset="1" stop-color="${dark}"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#sky)"/>
  <rect x="0" y="${g}" width="${w}" height="${h - g}" fill="${dark}"/>
  <rect x="${x}" y="${g - h * 0.28}" width="${bw}" height="${h * 0.28}" fill="${light}" opacity="0.88"/>
  <rect x="${x + bw * 0.28}" y="${g - h * 0.46}" width="${bw * 0.62}" height="${h * 0.18}" fill="${light}" opacity="0.72"/>
  <rect x="${x + bw * 0.1}" y="${g - h * 0.2}" width="${bw * 0.22}" height="${h * 0.14}" fill="${dark}" opacity="0.55"/>
  <rect x="${x + bw * 0.5}" y="${g - h * 0.4}" width="${bw * 0.3}" height="${h * 0.08}" fill="${dark}" opacity="0.45"/>
  <line x1="0" y1="${g}" x2="${w}" y2="${g}" stroke="${light}" stroke-opacity="0.35" stroke-width="2"/>
  <polygon points="${w * 0.06},${h * 0.1} ${w * 0.1},${h * 0.1} ${w * 0.096},${h * 0.115} ${w * 0.056},${h * 0.115}" fill="#006859"/>`;
}

function label(w, h) {
  const s = Math.round(Math.min(w, h) * 0.022);
  return `<text x="${w - s * 1.5}" y="${h - s * 1.5}" text-anchor="end" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="${s}" letter-spacing="${s * 0.3}" fill="#ffffff" fill-opacity="0.55">PLACEHOLDER IMAGE</text>`;
}

async function make(name, w, h, i) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${building(w, h, i, palettes[i % palettes.length])}${label(w, h)}</svg>`;
  await sharp(Buffer.from(svg)).jpeg({ quality: 82, mozjpeg: true }).toFile(`${OUT}/${name}.jpg`);
}

for (let i = 0; i < 8; i++) await make(`ph-${String(i + 1).padStart(2, '0')}`, 2400, 1600, i);

// Portrait (4:5) — a neutral silhouette, not a person.
const pw = 1600, ph = 2000;
await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${pw}" height="${ph}">
  <rect width="${pw}" height="${ph}" fill="#2a2b33"/>
  <circle cx="${pw / 2}" cy="${ph * 0.38}" r="${pw * 0.16}" fill="#3b3c45"/>
  <path d="M ${pw * 0.2} ${ph} Q ${pw * 0.2} ${ph * 0.6} ${pw / 2} ${ph * 0.6} Q ${pw * 0.8} ${ph * 0.6} ${pw * 0.8} ${ph} Z" fill="#3b3c45"/>
  ${label(pw, ph)}</svg>`)).jpeg({ quality: 82, mozjpeg: true }).toFile(`${OUT}/portrait.jpg`);

console.log('placeholders written to', OUT);
