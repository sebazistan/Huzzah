import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const dist = process.argv[2];
// Usage: node verify-seo.mjs /path/to/dist https://yourdomain.com
// Audits every built page: title, description, canonical, share image (must exist), JSON-LD parses.
const SITE = (process.argv[3] || 'https://example.com').replace(/\/$/, '');
const files = [];
(function walk(d) {
  for (const n of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, n.name);
    if (n.isDirectory()) walk(p);
    else if (n.name === 'index.html' || n.name === '404.html') files.push(p);
  }
})(dist);

const isRedirectStub = (h) => /http-equiv="refresh"/i.test(h);
const attr = (h, re) => h.match(re)?.[1];
const pages = [];
for (const f of files) {
  const h = readFileSync(f, 'utf8');
  if (isRedirectStub(h)) continue;
  pages.push({ f: f.slice(dist.length).replace(/\\/g, '/'), h });
}

const problems = [];
const titles = new Map();
const descs = new Map();
let noOg = 0, ldBlocks = 0, ldBad = 0, emptyAlt = 0, imgCount = 0, shortDesc = 0, longDesc = 0, noCanon = 0;
const types = new Map();

for (const { f, h } of pages) {
  const is404 = f.endsWith('404.html');
  const title = attr(h, /<title>([^<]*)<\/title>/);
  const desc = attr(h, /<meta name="description" content="([^"]*)"/);
  const canon = attr(h, /<link rel="canonical" href="([^"]*)"/);
  const ogImg = attr(h, /<meta property="og:image" content="([^"]*)"/);
  const twCard = attr(h, /<meta name="twitter:card" content="([^"]*)"/);

  if (!title || !title.trim()) problems.push(`${f}: empty <title>`);
  titles.set(title, [...(titles.get(title) || []), f]);
  if (!desc) problems.push(`${f}: no description`);
  else {
    descs.set(desc, [...(descs.get(desc) || []), f]);
    if (desc.length < 50) shortDesc++;
    if (desc.length > 200) longDesc++;
  }
  if (!is404) {
    if (!canon || !canon.startsWith(SITE)) { noCanon++; problems.push(`${f}: canonical missing or not absolute (${canon})`); }
    if (!ogImg || !ogImg.startsWith(SITE + '/')) { noOg++; problems.push(`${f}: og:image missing or not absolute (${ogImg})`); }
    else {
      const local = join(dist, ogImg.slice(SITE.length).replace(/\//g, '\\'));
      if (!existsSync(local)) problems.push(`${f}: og:image file not found in the build: ${ogImg}`);
    }
    if (!twCard) problems.push(`${f}: no twitter:card`);
  }
  for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    ldBlocks++;
    try {
      const j = JSON.parse(m[1]);
      for (const n of j['@graph'] || [j]) types.set(n['@type'], (types.get(n['@type']) || 0) + 1);
    } catch (e) { ldBad++; problems.push(`${f}: JSON-LD does not parse (${e.message})`); }
  }
  if (/^\/(design|vfx|kicks)\/[^/]+\/index\.html$/.test(f) || /toilet-town\/photos\/album/.test(f)) {
    for (const m of h.matchAll(/<img [^>]*?alt="([^"]*)"/g)) { imgCount++; if (m[1] === '') emptyAlt++; }
  }
}

const dup = (m) => [...m.entries()].filter(([, v]) => v.length > 1).sort((a, b) => b[1].length - a[1].length);
console.log(`pages audited (redirect stubs skipped): ${pages.length}`);
console.log(`problems: ${problems.length}`);
problems.slice(0, 15).forEach((p) => console.log('  ' + p));
console.log(`\nJSON-LD blocks: ${ldBlocks} (unparseable: ${ldBad}) | types: ${[...types.entries()].map(([k, v]) => `${k}=${v}`).join(', ')}`);
console.log(`pages missing og:image: ${noOg} | missing canonical: ${noCanon}`);
console.log(`descriptions: shorter than 50 chars: ${shortDesc}, longer than 200: ${longDesc}`);
console.log(`duplicate titles: ${dup(titles).length} groups`);
dup(titles).slice(0, 5).forEach(([t, v]) => console.log(`  "${t}" x${v.length} e.g. ${v.slice(0, 2).join(', ')}`));
console.log(`duplicate descriptions: ${dup(descs).length} groups`);
dup(descs).slice(0, 5).forEach(([t, v]) => console.log(`  "${t.slice(0, 80)}" x${v.length} e.g. ${v.slice(0, 2).join(', ')}`));
console.log(`photos on project and album pages: ${imgCount}, with empty alt text: ${emptyAlt}`);

console.log('\nSAMPLES');
for (const f of ['/index.html', '/design/kfc/index.html', '/vfx/longing/index.html', '/design/hershey/index.html', '/kicks/toilet-town/photos/album-03/index.html', '/about/index.html']) {
  const p = pages.find((x) => x.f === f);
  if (!p) { console.log(f, '(not found)'); continue; }
  console.log(`\n${f}\n  title: ${attr(p.h, /<title>([^<]*)<\/title>/)}\n  desc:  ${attr(p.h, /<meta name="description" content="([^"]*)"/)}\n  image: ${attr(p.h, /<meta property="og:image" content="([^"]*)"/)}\n  url:   ${attr(p.h, /<meta property="og:url" content="([^"]*)"/)}`);
}
