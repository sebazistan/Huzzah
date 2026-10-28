/**
 * Shrinks oversized photos in public/images. Run it with:   npm run shrink
 * (add  -- --dry  to only report what it would do).
 *
 * A photo is shrunk when it is over 1 MB or wider than 2000 px: it is resized to at most
 * 2000 px wide and re-saved as a JPEG (quality 80). PNGs without transparency become JPEGs
 * and every reference to them in src/content is updated. PNGs with transparency stay PNG.
 * A file is only replaced if the result is at least 10% smaller, so running it again changes nothing.
 *
 * The same script runs on GitHub (.github/workflows/shrink-images.yml) whenever new
 * photos are pushed, for example uploads from the browser editor.
 */
import { readdirSync, readFileSync, writeFileSync, statSync, unlinkSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import sharp from 'sharp';

sharp.cache(false); // do not keep files open: Windows will not let us overwrite an open file

const root = process.cwd();
const dry = process.argv.includes('--dry');
const MAX_WIDTH = 2000;
const MAX_BYTES = 1024 * 1024;
const SKIP = ['public/images/share/']; // the share image is already the right size

const rel = (f) => f.slice(root.length + 1).replace(/\\/g, '/');
const mb = (n) => (n / 1024 / 1024).toFixed(2) + ' MB';

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const imagesDir = join(root, 'public/images');
const files = walk(imagesDir).filter((f) => /\.(jpe?g|png)$/i.test(f) && !SKIP.some((s) => rel(f).startsWith(s)));

const renames = new Map(); // old public path -> new public path
let before = 0;
let after = 0;
let changed = 0;

for (const file of files) {
  const size = statSync(file).size;
  const input = readFileSync(file); // read into memory so the original file is not held open
  const meta = await sharp(input).metadata();
  if (size <= MAX_BYTES && (meta.width ?? 0) <= MAX_WIDTH) continue;

  const ext = extname(file).toLowerCase();
  const isPng = ext === '.png';
  // Only keep a PNG when it really has see-through areas (many screenshots carry an unused, fully opaque alpha channel).
  const keepPng = isPng && meta.hasAlpha && !(await sharp(input).stats()).isOpaque;
  const target = isPng && !keepPng ? file.slice(0, -ext.length) + '.jpg' : file;

  if (target !== file && existsSync(target)) {
    console.log(`skip   ${rel(file)}: ${rel(target)} already exists`);
    continue;
  }

  let pipeline = sharp(input).rotate().resize({ width: MAX_WIDTH, withoutEnlargement: true });
  pipeline = keepPng
    ? pipeline.png({ compressionLevel: 9 })
    : pipeline.flatten({ background: '#ffffff' }).jpeg({ quality: 80, mozjpeg: true });
  const buf = await pipeline.toBuffer();

  // Keep the original unless the new file is clearly smaller (at least 10%), so re-running never re-compresses a photo for nothing.
  if (buf.length > size * 0.9 && target === file) {
    console.log(`keep   ${rel(file)}: not smaller (${mb(size)})`);
    continue;
  }

  console.log(`${dry ? 'would ' : ''}shrink ${rel(file)}: ${mb(size)} -> ${mb(buf.length)}${target !== file ? ' (' + rel(target) + ')' : ''}`);
  before += size;
  after += buf.length;
  changed++;
  if (dry) continue;
  writeFileSync(target, buf);
  if (target !== file) {
    unlinkSync(file);
    renames.set('/' + rel(file).replace(/^public\//, ''), '/' + rel(target).replace(/^public\//, ''));
  }
}

// Point the content files at the renamed (PNG -> JPG) photos.
if (renames.size) {
  let edited = 0;
  for (const f of walk(join(root, 'src/content')).filter((p) => p.endsWith('.json'))) {
    let text = readFileSync(f, 'utf8');
    const orig = text;
    for (const [from, to] of renames) text = text.split(`"${from}"`).join(`"${to}"`);
    if (text !== orig) {
      writeFileSync(f, text);
      edited++;
    }
  }
  console.log(`updated photo paths in ${edited} content file(s)`);
}

console.log(`\n${changed} photo(s) ${dry ? 'would be ' : ''}shrunk: ${mb(before)} -> ${mb(after)} (saves ${mb(before - after)})`);
