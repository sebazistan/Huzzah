import * as cheerio from 'cheerio';
import sharp from 'sharp';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2];
// SITE-SPECIFIC EXAMPLE: imported a small photo mini-site (albums + about + shop) by scraping it.
const ORIGIN = process.env.ORIGIN || 'https://www.example.com';
const IMG = join(root, 'public/images/ttown');
mkdirSync(IMG, { recursive: true });
mkdirSync(join(root, 'src/content/albums'), { recursive: true });
const clean = (s) => s.replace(/[​-‍﻿]/g, '').replace(/\s+/g, ' ').trim();
const problems = [];

async function page(path) {
  const r = await fetch(ORIGIN + path);
  if (!r.ok) { problems.push('page ' + path); return cheerio.load(''); }
  const $ = cheerio.load(await r.text());
  $('.navigation, .footer, script, style').remove();
  return $;
}
async function save(url, name, width = 1600) {
  const dest = join(IMG, name);
  if (existsSync(dest)) return name;
  for (const u of [url, url.replace(/%25/g, '%')]) {
    try {
      const r = await fetch(u);
      if (!r.ok) continue;
      await sharp(Buffer.from(await r.arrayBuffer())).rotate().resize({ width, withoutEnlargement: true }).flatten({ background: '#fff' }).jpeg({ quality: 80, mozjpeg: true }).toFile(dest);
      return name;
    } catch {}
  }
  problems.push('img ' + url);
  return null;
}
async function pool(items, n, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; await fn(items[k], k); } }));
}
const assetImgs = ($) => $('img').map((_, i) => $(i).attr('src')).get().filter((s) => s && /c052c97|62e49ab216c2b10748052c8c/.test(s) && !/\.svg/.test(s) && !/logo/i.test(s));

// ---- albums
const photos = await page('/ttown/photos');
const covers = assetImgs(photos);
const albums = [];
for (let n = 1; n <= 12; n++) {
  const $ = await page(`/ttown/albums/album-${n}`);
  const urls = [...new Set(assetImgs($))];
  const id = `album-${String(n).padStart(2, '0')}`;
  const names = new Array(urls.length);
  await pool(urls, 6, async (u, i) => { names[i] = await save(u, `${id}-${String(i + 1).padStart(3, '0')}.jpg`); });
  const cover = covers[n - 1] ? await save(covers[n - 1], `${id}-cover.jpg`, 900) : null;
  const title = clean($('h1, h2').first().text()) || `Album ${String(n).padStart(2, '0')}`;
  albums.push({ id, n, title, cover, photos: names.filter(Boolean) });
  writeFileSync(join(root, 'src/content/albums', `${id}.json`), JSON.stringify({ title: `Album ${String(n).padStart(2, '0')}`, order: n, cover, photos: names.filter(Boolean) }, null, 2) + '\n');
  console.log(id, urls.length, 'photos');
}

// ---- text pages
const home = await page('/ttown/ttown');
const homeHero = await save(assetImgs(home)[0], 'home-hero.jpg', 2000);
const about = await page('/ttown/about');
const aboutPs = about('main, body').find('p').map((_, p) => clean(about(p).text())).get().filter(Boolean);
const aboutImg = await save(assetImgs(about)[0], 'about.jpg', 1400);
const shop = await page('/ttown/shop');
const photosIntro = clean(photos('p').first().text());

const data = {
  heading: 'Toilet Town',
  subheading: 'The street toilets of Toronto',
  intro: '',
  heroImage: homeHero,
  photosIntro,
  aboutHeading: 'Toilet Talk',
  aboutText: aboutPs.join('\n\n'),
  aboutImage: aboutImg,
  contactIntro: 'Get in touch! Send your street toilet photos to the address below.',
  shopText: clean(shop('p').first().text()) || 'Beautiful things for you beautiful people.',
  shopNote: 'Nothing yet! Check back.',
};
writeFileSync(join(root, 'src/content/toilet-town.json'), JSON.stringify(data, null, 2) + '\n');
console.log('about paragraphs:', aboutPs.length, '| photos intro:', photosIntro);
console.log('problems:', problems.length ? problems : 'none');
