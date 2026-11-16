// Generates public/og-default.jpg (1200×630) from the wordmark. Run: node scripts/make-og.mjs
import sharp from 'sharp';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#1d1e25"/>
  <g transform="translate(450 205) scale(1.2)">
    <g fill="none" stroke="#8a8a8f" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 88 V48 Q18 30 36 30"/><path d="M70 30 L96 88 L122 30"/><path d="M214 22 V72 Q214 88 230 88"/>
    </g>
    <polygon points="152,30 194,30 189,40 147,40" fill="#0d6b55"/>
  </g>
  <text x="600" y="420" text-anchor="middle" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-weight="300" font-size="44" letter-spacing="6" fill="#a8a8b0">Revēl Architecture</text>
</svg>`;

await sharp(Buffer.from(svg)).jpeg({ quality: 86 }).toFile('public/og-default.jpg');
console.log('public/og-default.jpg written');
