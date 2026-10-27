// Usage: node crawl-live.mjs https://yourdomain.com
// Fetches every page in the live sitemap and reports failures, leftover Webflow references,
// blank titles and a spot-check of images/videos. Run it after every deploy.
const base = (process.argv[2] || 'https://example.com').replace(/\/$/, '');
const smap = await (await fetch(`${base}/sitemap-0.xml`)).text();
const urls = [...smap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
console.log('pages in the live sitemap:', urls.length);

const bad = [];
const wf = [];
const emptyTitle = [];
const imgs = new Set();
let ok = 0;
let i = 0;
async function worker() {
  while (i < urls.length) {
    const u = urls[i++];
    try {
      const r = await fetch(u, { redirect: 'follow' });
      if (!r.ok) { bad.push(`${r.status} ${u}`); continue; }
      const h = await r.text();
      ok++;
      if (/website-files\.com|webflow\.(com|io)|uploads-ssl/i.test(h)) wf.push(u);
      if (/<h1><\/h1>|<title>Huzzah<\/title>/.test(h) && /\/(design|vfx|kicks)\/[^/]+\/?$/.test(u) && !/\/(category|awards|about)\/?$/.test(u)) emptyTitle.push(u);
      for (const m of h.matchAll(/(?:src|poster)="(\/(?:images|videos)\/[^"]+)"/g)) imgs.add(m[1]);
    } catch (e) { bad.push(`ERR ${u} ${e.message}`); }
  }
}
await Promise.all(Array.from({ length: 10 }, worker));
console.log('pages that loaded OK:', ok, '| failed:', bad.length);
bad.slice(0, 8).forEach((b) => console.log('  ' + b));
console.log('pages still referencing Webflow:', wf.length);
wf.slice(0, 8).forEach((b) => console.log('  ' + b));
console.log('project pages with a blank title (live):', emptyTitle.length);

// spot-check that images and videos referenced on those pages really load
const list = [...imgs];
const sample = list.filter((_, k) => k % Math.ceil(list.length / 150) === 0);
let imgBad = 0;
let j = 0;
async function imgWorker() {
  while (j < sample.length) {
    const p = sample[j++];
    try { const r = await fetch(base + p, { method: 'HEAD' }); if (!r.ok) { imgBad++; console.log('  image problem', r.status, p); } } catch { imgBad++; }
  }
}
await Promise.all(Array.from({ length: 10 }, imgWorker));
console.log(`image/video spot-check: ${sample.length} of ${list.length} unique files checked, ${imgBad} problems`);
