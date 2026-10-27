import { parse } from 'csv-parse/sync';
import sharp from 'sharp';
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2];
const P = join(root, 'src/content/projects');
const COVERS = join(root, 'public/images/projects');
const GAL = join(root, 'public/images/gallery');
mkdirSync(COVERS, { recursive: true });
mkdirSync(GAL, { recursive: true });

const existing = new Map(readdirSync(P).map((f) => [f.replace('.json', ''), JSON.parse(readFileSync(join(P, f), 'utf8')).section]));
const rows = parse(readFileSync('csv/design.csv', 'utf8'), { columns: true, skip_empty_lines: true, relax_quotes: true })
  .filter((r) => r.Draft !== 'true' && r.Archived !== 'true');

const split = (s) => (s || '').split(';').map((x) => x.trim()).filter(Boolean);
const text = (html) => html.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n\n').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/\n{3,}/g, '\n\n').trim();
const CAT = { 'pre-vis': 'pre-vis', design: 'props', 'production-design': 'production-design' };
const TYPES = new Set(['Series', 'Commercial', 'Feature', 'Short']);
const failures = [];

// map every Webflow design slug to its new file slug so cross-links keep working
const fileSlug = (r) => (existing.get(r.Slug) === 'vfx' ? `${r.Slug}-design` : r.Slug);
const newUrl = new Map();
for (const r of rows) newUrl.set(r.Slug, `/${r['Category'] === 'for-kicks-kws9y' ? 'kicks' : 'design'}/${fileSlug(r)}`);

function mapLink(url) {
  const m = url.match(/huzzahdesign\.com\/huzzah\/design\/([\w-]+)/);
  if (m) return newUrl.get(m[1]) ?? null;
  const v = url.match(/huzzahdesign\.com(\/vfx\/[\w-]+)/);
  if (v) return v[1];
  return url;
}

async function fetchBuf(url) {
  for (const u of [url, url.replace(/%25/g, '%'), url.replace('uploads-ssl.webflow.com', 'cdn.prod.website-files.com')]) {
    try { const r = await fetch(u); if (r.ok) return Buffer.from(await r.arrayBuffer()); } catch {}
  }
  return null;
}
async function save(url, dir, name) {
  const dest = join(dir, name);
  if (existsSync(dest)) return name;
  const buf = await fetchBuf(url);
  if (!buf) { failures.push(url); return null; }
  try {
    await sharp(buf).rotate().resize({ width: 1400, withoutEnlargement: true }).flatten({ background: '#fff' }).jpeg({ quality: 74, mozjpeg: true }).toFile(dest);
    return name;
  } catch (e) { failures.push(url + ' ' + e.message); return null; }
}
async function pool(items, n, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; await fn(items[k], k); } }));
}

const todo = rows.filter((r) => !(existing.has(r.Slug) && existing.get(r.Slug) !== 'vfx'));
let done = 0;

await pool(todo, 3, async (r) => {
  const slug = fileSlug(r);
  const isKicks = r.Category === 'for-kicks-kws9y';
  const gallery = [...new Set([...split(r.Images), ...split(r['Images 2'])])].filter((u) => u !== r['Main Image']);
  const cover = r['Main Image'] ? await save(r['Main Image'], COVERS, `${slug}.jpg`) : null;
  const names = new Array(gallery.length);
  await pool(gallery, 6, async (u, i) => { names[i] = await save(u, GAL, `${slug}-${String(i + 1).padStart(2, '0')}.jpg`); });

  const credits = [['Client', r.Client], ['Director', r.Director], ['Production Designer', r['Production Designer']], ['Distributor', r.Distributor], ['Awards', r.Awards]]
    .filter(([, v]) => v && v.trim()).map(([label, value]) => ({ label, value: value.trim() }));
  const links = [];
  if (r.IMDB) links.push({ label: /imdb\.com/.test(r.IMDB) ? 'IMDb' : 'Watch', url: r.IMDB });
  if (r['Parent Link']) { const u = mapLink(r['Parent Link']); if (u) links.push({ label: 'Check it out', url: u }); }
  const body = r['Post Body'] ? text(r['Post Body']) : '';
  const d = r.Date ? new Date(r.Date) : null;

  const data = {
    section: isKicks ? 'kicks' : 'design',
    category: isKicks ? 'for-kicks' : CAT[r.Category] ?? 'production-design',
    type: TYPES.has(r.Type) ? r.Type : isKicks ? 'Personal' : '',
    date: d && !isNaN(d) ? d.toISOString().slice(0, 10) : null,
    featured: r['Featured?'] === 'true',
    legacySlug: slug !== r.Slug ? r.Slug : '',
    title: r.Name.trim(),
    summary: (r['Post Summary'] || '').trim(),
    description: body || (r['Post Summary'] || '').trim(),
    coverUrl: '', cover,
    credits, links,
    videos: [...new Set([r.Video1, r.Video2, r.Video3, r.Video4, r.Video5, r.Video6].filter(Boolean))],
    gallery: names.filter(Boolean), galleryCaptions: [], galleryUrls: [],
  };
  writeFileSync(join(P, `${slug}.json`), JSON.stringify(data, null, 2) + '\n');
  if (++done % 20 === 0) console.log(`${done}/${todo.length} projects done (failures so far: ${failures.length})`);
});

console.log(`finished ${done}/${todo.length}; image failures: ${failures.length}`);
if (failures.length) console.log(failures.slice(0, 30).join('\n'));
