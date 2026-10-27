import * as cheerio from 'cheerio';
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2];
const section = process.argv[3] ?? 'vfx';
const onlySlug = process.argv[4];
const P = join(root, 'src/content/projects');
const GAL = join(root, 'public/images/gallery');
// SITE-SPECIFIC EXAMPLE: scrapes project pages from the OLD site (use the *.webflow.io address if
// the live domain has already moved). Set ORIGIN, and adjust urlBase below to the old URL pattern.
const ORIGIN = process.env.ORIGIN || 'https://www.example.com';
mkdirSync(GAL, { recursive: true });

const clean = (s) => s.replace(/[​-‍﻿]/g, '').replace(/\s+/g, ' ').trim();
const problems = [];

async function fetchBuf(url) {
  for (const u of [url, url.replace(/%25/g, '%')]) {
    try {
      const r = await fetch(u);
      if (r.ok) return Buffer.from(await r.arrayBuffer());
    } catch {}
  }
  return null;
}

async function saveImage(url, base) {
  const buf = await fetchBuf(url);
  if (!buf) { problems.push('image ' + url); return null; }
  const name = `${base}.jpg`;
  const dest = join(GAL, name);
  if (existsSync(dest)) return name;
  try {
    await sharp(buf).rotate().resize({ width: 2000, withoutEnlargement: true }).flatten({ background: '#ffffff' }).jpeg({ quality: 82, mozjpeg: true }).toFile(dest);
    return name;
  } catch (e) { problems.push('sharp ' + url + ' ' + e.message); return null; }
}

async function pool(items, n, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; await fn(items[k], k); } }));
}

function videoFromIframe(src) {
  if (!src) return null;
  const dec = decodeURIComponent(src);
  const url = dec.match(/[?&]url=([^&]+)/)?.[1];
  if (url) return decodeURIComponent(url);
  const yt = dec.match(/youtube\.com\/embed\/([\w-]{11})/);
  if (yt) return `https://www.youtube.com/watch?v=${yt[1]}`;
  const vm = dec.match(/player\.vimeo\.com\/video\/(\d+)/);
  if (vm) return `https://vimeo.com/${vm[1]}`;
  return null;
}

function parse(html) {
  const $ = cheerio.load(html);
  $('.navigation, .footer, script, style').remove();
  const out = { credits: [], links: [], videos: [], images: [], caps: {}, paragraphs: [] };
  const main = $('body');
  const visible = (el) => !$(el).closest('.w-condition-invisible, .w-dyn-hide').length;

  // credits: visible project-info blocks, label = first p, value = second p
  main.find('.project-info').each((_, el) => {
    if (!visible(el)) return;
    const ps = $(el).find('p');
    const label = clean($(ps[0]).text()).replace(/:$/, '');
    const val = clean($(ps[1] ? ps[1] : '').text());
    if (label && val) out.credits.push({ label, value: val });
  });

  // description paragraphs + buttons sit together
  const btns = main.find('[class*="buttons-container"]').filter((_, el) => $(el).prev('p, div').length || $(el).parent().children('p').length).first();
  btns.parent().children('p').each((_, p) => { const t = clean($(p).text()); if (t) out.paragraphs.push(t); });
  btns.find('a').each((_, a) => {
    if (!visible(a)) return;
    const href = $(a).attr('href');
    const label = clean($(a).text());
    if (!href || href === '#' || !label) return;
    const nice = label.toUpperCase() === 'IMDB' ? 'IMDb' : label[0] + label.slice(1).toLowerCase();
    out.links.push({ label: nice, url: href });
  });

  out.hero = main.find('.project-page-image img, .full-width-image-holder img').first().attr('src') || null;

  main.find('.photo-grid img').each((_, img) => { if (visible(img)) { const s = $(img).attr('src'); if (s) out.images.push(s); } });

  main.find('.w-richtext').each((_, rt) => {
    if (!visible(rt)) return;
    $(rt).children().each((_, el) => {
      const tag = el.tagName;
      if (tag === 'p' || /^h\d$/.test(tag)) { const t = clean($(el).text()); if (t) out.paragraphs.push(t); }
      else if (tag === 'ul' || tag === 'ol') $(el).find('li').each((_, li) => { const t = clean($(li).text()); if (t) out.paragraphs.push('• ' + t); });
      else if (tag === 'figure') {
        const s = $(el).find('img').attr('src');
        const cap = clean($(el).find('figcaption').text());
        if (s) out.images.push(s), out.caps[s] = cap;
      }
    });
  });

  main.find('iframe').each((_, f) => { if (!visible(f)) return; const v = videoFromIframe($(f).attr('src')); if (v) out.videos.push(v); });
  return out;
}

const files = readdirSync(P).filter((f) => f.endsWith('.json'));
const targets = files
  .map((f) => ({ f, slug: f.replace('.json', ''), data: JSON.parse(readFileSync(join(P, f), 'utf8')) }))
  .filter((x) => x.data.section === section && (!onlySlug || x.slug === onlySlug));

const prefix = section === 'vfx' ? 'vfx-' : section === 'kicks' ? 'kicks-' : '';
const urlBase = { vfx: '/vfx/', design: '/huzzah/design/', kicks: '/huzzah/design/' }[section];

await pool(targets, 4, async ({ f, slug, data }) => {
  const res = await fetch(`${ORIGIN}${urlBase}${slug}`);
  if (!res.ok) { problems.push(`page ${slug} ${res.status}`); return; }
  const p = parse(await res.text());

  // keep existing credits/links/desc if scrape found nothing; otherwise replace
  if (p.credits.length) data.credits = p.credits;
  if (p.links.length) data.links = p.links;
  if (p.videos.length) data.videos = [...new Set(p.videos)];
  if (p.paragraphs.length) {
    data.description = p.paragraphs.join('\n\n');
    const first = p.paragraphs[0];
    data.summary = first.length > 170 ? first.slice(0, 170).replace(/\s+\S*$/, '') + '…' : first;
  }

  // gallery (dedupe by file id)
  const seen = new Set();
  const heroId = p.hero?.split('/').pop();
  const urls = p.images.filter((u) => { const id = u.split('/').pop(); if (seen.has(id) || id === heroId) return false; seen.add(id); return true; });
  const names = [];
  const caps = [];
  for (let i = 0; i < urls.length; i++) {
    const n = await saveImage(urls[i], `${prefix}${slug}-${String(i + 1).padStart(2, '0')}`);
    if (n) { names.push(n); caps.push(p.caps[urls[i]] || ''); }
  }
  data.gallery = names;
  data.galleryCaptions = caps.some(Boolean) ? caps : [];
  data.galleryUrls = [];

  // cover: only fill if missing
  if (!data.cover && p.hero) {
    mkdirSync(join(root, 'public/images/projects'), { recursive: true });
    const buf = await fetchBuf(p.hero);
    if (buf) {
      const name = `${prefix}${slug}.jpg`;
      await sharp(buf).resize({ width: 2000, withoutEnlargement: true }).flatten({ background: '#fff' }).jpeg({ quality: 82, mozjpeg: true }).toFile(join(root, 'public/images/projects', name));
      data.cover = name; data.coverUrl = '';
    }
  }

  writeFileSync(join(P, f), JSON.stringify(data, null, 2) + '\n');
  console.log(slug.padEnd(42), 'cred', p.credits.length, 'links', p.links.length, 'vid', data.videos.length, 'img', names.length + '/' + urls.length, 'text', p.paragraphs.length);
});

console.log('\nproblems:', problems.length ? problems : 'none');
