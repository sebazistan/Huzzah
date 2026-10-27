// One-off: bring image files and stored values into the layout Keystatic expects.
//   collections:  <dir>/<entry-slug>/<file>   stored as  <publicPath><entry-slug>/<file>
//   singletons:   <dir>/<file>                stored as  <publicPath><file>
import { readdirSync, readFileSync, writeFileSync, renameSync, existsSync, mkdirSync, rmdirSync } from 'node:fs';
import { join, basename } from 'node:path';

const root = process.cwd();
const dry = process.argv.includes('--dry');
const log = { moved: 0, rewritten: 0, missing: [] };
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
const writeJson = (p, d) => { if (!dry) writeFileSync(p, JSON.stringify(d, null, 2) + '\n'); log.rewritten++; };

function move(from, to) {
  if (!existsSync(from)) { log.missing.push(from); return false; }
  if (from === to) return true;
  if (!dry) { mkdirSync(join(to, '..'), { recursive: true }); renameSync(from, to); }
  log.moved++;
  return true;
}

// ---- projects: public/images/projects/<section>/<slug>/<file>  ->  public/images/projects/<slug>/<file>
const projDir = join(root, 'src/content/projects');
const projImg = join(root, 'public/images/projects');
for (const f of readdirSync(projDir).filter((x) => x.endsWith('.json'))) {
  const slug = f.slice(0, -5);
  const file = join(projDir, f);
  const d = readJson(file);
  let changed = false;
  const fix = (v) => {
    if (!v || v.startsWith('/')) return v; // empty or already in the final format
    const name = basename(v);
    move(join(projImg, v), join(projImg, slug, name));
    changed = true;
    return `/images/projects/${slug}/${name}`;
  };
  d.cover = fix(d.cover);
  d.gallery = d.gallery.map(fix);
  if (changed) writeJson(file, d);
}
for (const s of ['design', 'vfx', 'kicks']) {
  const p = join(projImg, s);
  if (!dry && existsSync(p)) { try { rmdirSync(p); } catch {} } // only if empty
}

// ---- Toilet Town albums: public/images/ttown/album-NN-xxx.jpg  ->  public/images/ttown/album-NN/xxx.jpg
const albDir = join(root, 'src/content/albums');
const ttImg = join(root, 'public/images/ttown');
for (const f of readdirSync(albDir).filter((x) => x.endsWith('.json'))) {
  const slug = f.slice(0, -5);
  const file = join(albDir, f);
  const d = readJson(file);
  let changed = false;
  const fix = (v) => {
    if (!v || v.startsWith('/')) return v;
    const name = v.replace(new RegExp(`^${slug}-`), '');
    move(join(ttImg, v), join(ttImg, slug, name));
    changed = true;
    return `/images/ttown/${slug}/${name}`;
  };
  d.cover = fix(d.cover);
  d.photos = d.photos.map(fix);
  if (changed) writeJson(file, d);
}

// ---- singletons: just add the public path in front
const prefix = (v, p) => (v && !v.startsWith('/') ? p + v : v);

let f = join(root, 'src/content/toilet-town.json'), d = readJson(f);
d.heroImage = prefix(d.heroImage, '/images/ttown/');
d.aboutImage = prefix(d.aboutImage, '/images/ttown/');
writeJson(f, d);

f = join(root, 'src/content/awards.json'); d = readJson(f);
for (const k of ['trophy', 'trophyStill', 'logo', 'vfxPhoto', 'designPhoto']) d[k] = prefix(d[k], '/images/awards/');
writeJson(f, d);

f = join(root, 'src/content/site.json'); d = readJson(f);
d.vfxClientLogos = (d.vfxClientLogos || []).map((v) => prefix(v, '/images/clients/'));
writeJson(f, d);

f = join(root, 'src/content/services.json'); d = readJson(f);
d.items = d.items.map((it) => ({ ...it, video: prefix(it.video, '/videos/services/'), videoWebm: prefix(it.videoWebm, '/videos/services/'), poster: prefix(it.poster, '/videos/services/') }));
writeJson(f, d);

// categories (cover is empty today, but keep the format right if one is added)
const catDir = join(root, 'src/content/categories');
for (const c of readdirSync(catDir).filter((x) => x.endsWith('.json'))) {
  const file = join(catDir, c), cd = readJson(file);
  if (cd.cover && !cd.cover.startsWith('/')) { cd.cover = `/images/categories/${c.slice(0, -5)}/${cd.cover}`; writeJson(file, cd); }
}

console.log(`${dry ? '[dry run] ' : ''}files moved: ${log.moved} | json files rewritten: ${log.rewritten}`);
if (log.missing.length) { console.log('MISSING:'); log.missing.slice(0, 20).forEach((m) => console.log('  ' + m)); }
