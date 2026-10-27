/**
 * Safety check for the site's content. Run it with:   npm run check
 *
 * It also runs automatically before every build (locally and on Cloudflare), so a
 * mistake such as a missing photo can never be published: if it finds a PROBLEM the
 * build stops and the live site simply stays on the last good version.
 *
 *   PROBLEM  = must be fixed (stops the build)
 *   WARNING  = worth a look, never stops anything
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const problems = [];
const warnings = [];
const problem = (m) => problems.push(m);
const warn = (m) => warnings.push(m);

const rel = (f) => f.slice(root.length + 1).replace(/\\/g, '/');
const readJson = (file) => {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch (e) {
    problem(`${rel(file)} is not valid JSON (${e.message}). If you edited it by hand, undo that edit.`);
    return null;
  }
};
const listJson = (dir) =>
  existsSync(dir)
    ? readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => ({ slug: f.slice(0, -5), file: join(dir, f) }))
    : [];

const MB = 1024 * 1024;
const used = new Set(); // every public file that something points at

/** A stored image/video path must be a full path (/images/...) to a file that exists. */
function fileRef(ref, where, { maxMB = 3 } = {}) {
  if (!ref) return;
  if (!ref.startsWith('/')) {
    problem(`${where}: "${ref}" is not a full path. It should look like /images/... (re-select the picture in the admin).`);
    return;
  }
  const abs = join(root, 'public', ref);
  if (!existsSync(abs)) {
    problem(`${where}: the file ${ref} is missing. It was probably renamed, moved or deleted. Put it back, or remove it from this entry in the admin.`);
    return;
  }
  used.add(ref);
  const size = statSync(abs).size;
  if (size > maxMB * MB) warn(`${where}: ${ref} is ${(size / MB).toFixed(1)} MB. Consider a smaller version (about 2000 px wide, under 1 MB).`);
}

const email = (v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
const slugOk = (v) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(v);

// ---------- load content
const categories = listJson(join(root, 'src/content/categories'));
const categorySlugs = new Set(categories.map((c) => c.slug));
const projects = listJson(join(root, 'src/content/projects')).map((p) => ({ ...p, data: readJson(p.file) })).filter((p) => p.data);
const albums = listJson(join(root, 'src/content/albums'));
const bySection = { design: new Set(), vfx: new Set(), kicks: new Set() };

for (const p of projects) {
  const s = p.data.section;
  if (bySection[s]) bySection[s].add(p.slug);
}

/** A link inside the site (like /design/kfc) should point at something that exists. */
function internalLink(url, where) {
  if (!url || !url.startsWith('/')) return;
  const path = url.split(/[?#]/)[0].replace(/\/$/, '');
  const m = path.match(/^\/(design|vfx|kicks)\/([^/]+)$/);
  if (m && !['category', 'awards', 'about'].includes(m[2])) {
    if (!bySection[m[1]].has(m[2]) && !(m[1] === 'kicks' && m[2] === 'toilet-town')) problem(`${where}: the link ${url} does not match any ${m[1]} project.`);
    return;
  }
  const c = path.match(/^\/design\/category\/([^/]+)$/);
  if (c && !categorySlugs.has(c[1])) problem(`${where}: the link ${url} does not match any category.`);
}

// ---------- projects
const TYPES = new Set(['', 'Series', 'Commercial', 'Feature', 'Short', 'Music Video', 'Promo', 'Personal']);
const legacy = new Map();
for (const { slug, file, data: d } of projects) {
  const w = `Project "${slug}"`;
  if (!d.title || !String(d.title).trim()) problem(`${w}: it has no title.`);
  if (!bySection[d.section]) problem(`${w}: the Section must be Design, VFX or For Kicks.`);
  if (d.section === 'design' && !categorySlugs.has(d.category)) problem(`${w}: its Category "${d.category}" does not exist. Pick Production Design, Pre-Vis or Props.`);
  if (d.date && !/^\d{4}-\d{2}-\d{2}$/.test(d.date)) warn(`${w}: the date "${d.date}" looks odd.`);
  if (!TYPES.has(d.type ?? '')) warn(`${w}: the Type "${d.type}" is not one of the usual ones.`);
  if (!d.cover) warn(`${w}: it has no cover image.`);
  fileRef(d.cover, `${w} cover`);
  (d.gallery || []).forEach((g, i) => fileRef(g, `${w} gallery photo ${i + 1}`));
  if ((d.galleryCaptions || []).length > (d.gallery || []).length) warn(`${w}: it has more captions than photos.`);
  for (const v of d.videos || []) {
    if (!/(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/|vimeo\.com\/)/.test(v)) warn(`${w}: the video link "${v}" is not a YouTube or Vimeo link, so it will not play.`);
  }
  for (const l of d.links || []) {
    if (!l.label || !l.url) warn(`${w}: a button has an empty label or link.`);
    internalLink(l.url, `${w} button "${l.label}"`);
  }
  if (d.legacySlug) {
    if (legacy.has(d.legacySlug)) warn(`${w}: the old-address helper "${d.legacySlug}" is also used by "${legacy.get(d.legacySlug)}".`);
    legacy.set(d.legacySlug, slug);
  }
}

// ---------- Toilet Town albums and page
for (const { slug, file } of albums) {
  const a = readJson(file);
  if (!a) continue;
  const w = `Album "${slug}"`;
  fileRef(a.cover, `${w} cover`);
  if (!(a.photos || []).length) warn(`${w}: it has no photos.`);
  (a.photos || []).forEach((p, i) => fileRef(p, `${w} photo ${i + 1}`));
}
const tt = readJson(join(root, 'src/content/toilet-town.json'));
if (tt) { fileRef(tt.heroImage, 'Toilet Town home image'); fileRef(tt.aboutImage, 'Toilet Town About image'); }

// ---------- categories
for (const { slug, file } of categories) {
  const c = readJson(file);
  if (c?.cover) fileRef(c.cover, `Category "${slug}" cover`);
}

// ---------- singletons
const awards = readJson(join(root, 'src/content/awards.json'));
if (awards) {
  for (const k of ['trophy', 'trophyStill', 'logo', 'vfxPhoto', 'designPhoto']) fileRef(awards[k], `Awards: ${k}`, { maxMB: 4 });
  (awards.items || []).forEach((a, i) => {
    const w = `Award ${i + 1} (${a.award})`;
    if (!['design', 'vfx'].includes(a.section)) problem(`${w}: "Shows on" must be Design or VFX.`);
    if (!['Winner', 'Nominated'].includes(a.result)) problem(`${w}: Result must be Winner or Nominated.`);
    internalLink(a.url, w);
  });
}

const site = readJson(join(root, 'src/content/site.json'));
if (site) {
  if (site.email && !email(site.email)) warn(`Site settings: the email "${site.email}" does not look like an email address.`);
  (site.vfxClientLogos || []).forEach((l, i) => fileRef(l, `VFX client logo ${i + 1}`));
}

const services = readJson(join(root, 'src/content/services.json'));
if (services) {
  (services.items || []).forEach((s, i) => {
    const w = `Service "${s.title || i + 1}"`;
    fileRef(s.video, `${w} video`, { maxMB: 12 });
    fileRef(s.videoWebm, `${w} WebM video`, { maxMB: 12 });
    fileRef(s.poster, `${w} still image`);
    internalLink(s.link, w);
    if (s.video && !s.poster) warn(`${w}: it has a video but no still image to show while it loads.`);
  });
}

const contact = readJson(join(root, 'src/content/contact.json'));
if (contact) {
  const seen = new Set();
  for (const f of contact.forms || []) {
    const w = `Contact page "${f.slug}"`;
    if (!f.slug || !slugOk(f.slug)) problem(`${w}: the URL name must be lowercase letters, numbers and dashes only.`);
    if (seen.has(f.slug)) problem(`${w}: two contact pages share this URL name.`);
    seen.add(f.slug);
    if (!['design', 'vfx', 'kicks'].includes(f.section)) problem(`${w}: the Site section must be Design, VFX or For Kicks.`);
    if (f.email && !email(f.email)) warn(`${w}: the email "${f.email}" does not look right.`);
    if (f.endpoint && !/^https:\/\//.test(f.endpoint)) warn(`${w}: the form service address should start with https://`);
  }
  if (!seen.has('design')) problem('Contact pages: there is no "design" contact page, but the menu links to it.');
}

// ---------- housekeeping (warnings only)
let imageBytes = 0;
(function walk(dir) {
  if (!existsSync(dir)) return;
  for (const n of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, n.name);
    if (n.isDirectory()) walk(p);
    else imageBytes += statSync(p).size;
  }
})(join(root, 'public'));
if (imageBytes > 900 * MB) warn(`The site's images and videos total ${(imageBytes / MB).toFixed(0)} MB. GitHub recommends keeping the whole repository under about 1 GB. Resize new photos, or ask Claude about moving images to Cloudflare R2.`);

const unused = [];
(function walk(dir, base) {
  if (!existsSync(dir)) return;
  for (const n of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, n.name);
    const ref = `${base}/${n.name}`;
    if (n.isDirectory()) walk(p, ref);
    else if (!used.has(ref)) unused.push(ref);
  }
})(join(root, 'public/images/projects'), '/images/projects');
if (unused.length) warn(`${unused.length} photo file(s) in public/images/projects are not used by any project (harmless leftovers), for example ${unused.slice(0, 3).join(', ')}.`);

// ---------- report
console.log('');
console.log(`Site check: ${projects.length} projects, ${albums.length} albums, ${categories.length} categories.`);
if (warnings.length) {
  console.log(`\n${warnings.length} warning(s) (these do not stop publishing):`);
  warnings.forEach((m) => console.log('  WARNING  ' + m));
}
if (problems.length) {
  console.log(`\n${problems.length} PROBLEM(S) that must be fixed before publishing:`);
  problems.forEach((m) => console.log('  PROBLEM  ' + m));
  console.log('\nThe live site has NOT been changed. Fix the problem(s) above and run the check again.\n');
  process.exit(1);
}
console.log(warnings.length ? '\nNo problems. Safe to publish.\n' : 'All good. Safe to publish.\n');
