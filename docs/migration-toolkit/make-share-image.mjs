import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const repo = process.argv[2];
const W = 1200;
const H = 630;
const covers = ['space-janitors-s4', 'kfc', 'deep-six', 'detention-design'].map((s) => {
  // the cover can be .jpg or .png
  return ['jpg', 'png', 'jpeg'].map((e) => join(repo, `public/images/projects/${s}/cover.${e}`));
});

import { existsSync } from 'node:fs';
const files = covers.map((opts) => opts.find((p) => existsSync(p))).filter(Boolean);
console.log('using covers:', files.map((f) => f.split(/[\\/]/).slice(-2).join('/')).join(', '));

const colW = W / files.length;
const tiles = await Promise.all(
  files.map(async (f, i) => ({
    input: await sharp(f).resize({ width: Math.ceil(colW), height: H, fit: 'cover', position: 'attention' }).modulate({ brightness: 0.7, saturation: 0.9 }).toBuffer(),
    left: Math.round(i * colW),
    top: 0,
  })),
);

const svg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0b0b0e" stop-opacity="0.35"/>
      <stop offset="0.55" stop-color="#0b0b0e" stop-opacity="0.70"/>
      <stop offset="1" stop-color="#0b0b0e" stop-opacity="0.92"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect x="84" y="${H / 2 - 44}" width="64" height="6" rx="3" fill="#ff5a36"/>
  <text x="80" y="${H / 2 + 100}" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="150" letter-spacing="10" fill="#f2f1ee">HUZZAH</text>
  <text x="84" y="${H / 2 + 160}" font-family="Arial, Helvetica, sans-serif" font-weight="400" font-size="38" letter-spacing="3" fill="#c9c8c4">Production design  ·  Pre-vis  ·  Props</text>
  <text x="84" y="${H - 48}" font-family="Arial, Helvetica, sans-serif" font-weight="400" font-size="28" letter-spacing="2" fill="#9a9aa3">Toronto</text>
</svg>`;

mkdirSync(join(repo, 'public/images/share'), { recursive: true });
const out = join(repo, 'public/images/share/default.jpg');
await sharp({ create: { width: W, height: H, channels: 3, background: '#0b0b0e' } })
  .composite([...tiles, { input: Buffer.from(svg), top: 0, left: 0 }])
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(out);
const m = await sharp(out).metadata();
console.log('wrote', out, `${m.width}x${m.height}`);
