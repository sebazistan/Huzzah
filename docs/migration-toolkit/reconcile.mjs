import { parse } from 'csv-parse/sync';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
// Usage (from a scratch folder that has the exported CSVs in ./csv): node reconcile.mjs /path/to/site-repo
// Compares every PUBLISHED row in the Webflow CSV exports against what is in the new site's content files.
const R = process.argv[2] || '.';
const csv = (f) => parse(readFileSync(`csv/${f}.csv`, 'utf8'), { columns: true, skip_empty_lines: true, relax_quotes: true }).filter(r => r.Draft !== 'true' && r.Archived !== 'true');
const proj = new Map(readdirSync(`${R}/src/content/projects`).map(f => [f.replace('.json',''), JSON.parse(readFileSync(`${R}/src/content/projects/${f}`,'utf8'))]));
const split = (s) => (s || '').split(';').map(x => x.trim()).filter(Boolean);

// design + kicks
const d = csv('design');
const find = (slug, sections) => [...proj.entries()].find(([k, v]) => sections.includes(v.section) && (k === slug || v.legacySlug === slug));
const missingD = d.filter(r => !find(r.Slug, ['design','kicks']));
console.log('design CSV live rows:', d.length, '| missing in site:', missingD.length, missingD.map(r=>r.Slug).join(','));

// VFX
const v = csv('vfx');
const missingV = v.filter(r => !find(r.Slug, ['vfx']));
console.log('VFX CSV live rows:', v.length, '| missing in site:', missingV.length, missingV.map(r=>r.Slug).join(','));
// VFX: images/videos/text CSV has vs site has
let diffs = [];
for (const r of v) { const f = find(r.Slug, ['vfx']); if (!f) continue; const p = f[1];
  const csvVid = [r.Video1,r.Video2,r.Video3,r.Video4,r.Video5,r.Video6].filter(Boolean).length;
  const csvImgs = new Set([...split(r.Images), ...split(r['Images 2']), ...split(r['Images 3'])]); csvImgs.delete(r['Main Image']);
  if (csvVid !== p.videos.length || csvImgs.size > p.gallery.length) diffs.push(`${r.Slug}: videos csv ${csvVid}/site ${p.videos.length}, gallery csv ${csvImgs.size}/site ${p.gallery.length}`);
}
console.log('VFX entries where CSV has more videos/gallery than site:', diffs.length); console.log(diffs.slice(0, 40).join('\n'));

// design/kicks existing-40 check for gallery
let d2 = [];
for (const r of d) { const f = find(r.Slug, ['design','kicks']); if (!f) continue; const p = f[1];
  const csvImgs = new Set([...split(r.Images), ...split(r['Images 2'])]); csvImgs.delete(r['Main Image']);
  const csvVid = [r.Video1,r.Video2,r.Video3,r.Video4,r.Video5,r.Video6].filter(Boolean).length;
  if (csvImgs.size > p.gallery.length || csvVid > p.videos.length) d2.push(`${r.Slug}: gallery csv ${csvImgs.size}/site ${p.gallery.length}, videos csv ${csvVid}/site ${p.videos.length}`);
}
console.log('design/kicks entries with fewer images/videos than CSV:', d2.length); console.log(d2.slice(0, 40).join('\n'));

// albums
const a = csv('albums');
const alb = readdirSync(`${R}/src/content/albums`).map(f => JSON.parse(readFileSync(`${R}/src/content/albums/${f}`,'utf8')));
for (const r of a) { const n = split(r.Images).length; const s = alb.find(x => x.title === r.Name); if (!s || s.photos.length !== n) console.log('ALBUM mismatch', r.Name, 'csv', n, 'site', s?.photos.length); }
console.log('albums checked:', a.length);
// missing cover files
let missingFiles = 0;
for (const p of proj.values()) { if (p.cover && !existsSync(`${R}/public/images/projects/${p.cover}`)) missingFiles++; for (const g of p.gallery) if (!existsSync(`${R}/public/images/gallery/${g}`)) missingFiles++; }
console.log('referenced image files missing on disk:', missingFiles);
