// @ts-check
import { defineConfig } from 'astro/config';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';

// The Keystatic admin (/keystatic) is a dev-time editor: it runs locally and
// commits content to the repo. The published site itself is fully static.
const isDev = process.argv.includes('dev');

// Old Webflow URLs -> new URLs. Built from the content files so new projects
// that came from Webflow keep working; add lines here for anything else.
function legacyRedirects() {
  /** @type {Record<string, string>} */
  const r = {
    '/huzzah/vfx': '/vfx',
    '/huzzah/vfx-about': '/vfx/about',
    '/huzzah/vfx-awards': '/vfx/awards',
    '/huzzah/vfx-contact': '/contact/vfx',
    '/huzzah/about': '/about',
    '/huzzah/services': '/services',
    '/huzzah/contact': '/contact/design',
    '/huzzah/design-awards': '/design/awards',
    '/huzzah/project-categories/production-design': '/design/category/production-design',
    '/huzzah/project-categories/pre-vis': '/design/category/pre-vis',
    '/huzzah/project-categories/design': '/design/category/props',
    '/huzzah/project-categories/for-kicks-kws9y': '/kicks',
    '/ttown/ttown': '/kicks/toilet-town',
    '/ttown/photos': '/kicks/toilet-town/photos',
    '/ttown/about': '/kicks/toilet-town/about',
    '/ttown/shop': '/kicks/toilet-town/shop',
    '/ttown/contact': '/contact/toilet-town',
  };
  for (let n = 1; n <= 12; n++) r[`/ttown/albums/album-${n}`] = `/kicks/toilet-town/photos/album-${String(n).padStart(2, '0')}`;
  for (const f of readdirSync('src/content/projects')) {
    const slug = f.replace('.json', '');
    const { section, legacySlug } = JSON.parse(readFileSync(`src/content/projects/${f}`, 'utf8'));
    const old = legacySlug || slug; // legacySlug is set when the new file name differs from the Webflow URL
    if (section === 'design') r[`/huzzah/design/${old}`] = `/design/${slug}`;
    if (section === 'kicks') r[`/huzzah/design/${old}`] = slug === 'toilet-town' ? '/kicks/toilet-town' : `/kicks/${slug}`;
  }
  return r;
}

const redirects = legacyRedirects();

// Cloudflare Pages reads dist/_redirects and serves true 301s for old URLs.
// (Astro's own redirects below remain as a fallback on hosts without that file.)
const cloudflareRedirects = {
  name: 'cloudflare-redirects',
  hooks: {
    /** @param {{ dir: URL }} ctx */
    'astro:build:done': ({ dir }) => {
      const lines = Object.entries(redirects).map(([from, to]) => `${from} ${to} 301`);
      writeFileSync(new URL('_redirects', dir), lines.join('\n') + '\n');
    },
  },
};

export default defineConfig({
  // On the real domain these are unset. The GitHub Pages preview sets them
  // (see .github/workflows/deploy.yml) because it serves from /Huzzah/.
  site: process.env.SITE_URL || 'https://www.huzzahdesign.com',
  base: process.env.BASE_PATH || '/',
  redirects,
  integrations: [react(), cloudflareRedirects, ...(isDev ? [keystatic()] : [])],
});
