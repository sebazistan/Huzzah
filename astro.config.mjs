// @ts-check
import { defineConfig } from 'astro/config';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import keystatic from '@keystatic/astro';

// The Keystatic admin (/keystatic) is a dev-time editor: it runs locally and
// commits content to the repo. The published site itself is fully static.
const isDev = process.argv.includes('dev');

// Old Webflow URLs -> new URLs. Built from the content files so new projects
// that came from Webflow keep working; add lines here for anything else.
function legacyRedirects() {
  /** @type {Record<string, string>} */
  const r = {
    // /design used to be the Design home; the home page is now the site index
    '/design': '/',
    '/huzzah/vfx': '/vfx',
    '/huzzah/vfx-about': '/vfx/about',
    '/huzzah/vfx-awards': '/vfx/awards',
    '/huzzah/vfx-contact': '/contact/vfx',
    '/huzzah/about': '/about',
    '/huzzah/services': '/services',
    '/huzzah/contact': '/contact/design',
    '/huzzah/design-awards': '/design/awards',
    '/huzzah/all-awards': '/design/awards',
    '/huzzah/project-categories/production-design': '/design/category/production-design',
    '/huzzah/project-categories/pre-vis': '/design/category/pre-vis',
    '/huzzah/project-categories/design': '/design/category/props',
    '/huzzah/project-categories/for-kicks-kws9y': '/kicks',
    '/ttown/ttown': '/kicks/toilet-town',
    '/ttown/photos': '/kicks/toilet-town/photos',
    '/ttown/about': '/kicks/toilet-town/about',
    '/ttown/shop': '/kicks/toilet-town/shop',
    '/ttown/contact': '/contact/toilet-town',
    // Happy Trails now lives on its own domain (separate GitHub Pages site)
    '/happy-trails/happy-trails': 'https://happytrailstoronto.com/',
    '/happy-trails/happy-trails-backup': 'https://happytrailstoronto.com/',
    '/happy-trails/crossings': 'https://happytrailstoronto.com/',
    '/happy-trails/about': 'https://happytrailstoronto.com/about',
    '/happy-trails/trails': 'https://happytrailstoronto.com/trails',
    '/happy-trails/beltline': 'https://happytrailstoronto.com/beltline',
    '/happy-trails/contact': 'https://happytrailstoronto.com/contact',
  };
  for (let n = 1; n <= 12; n++) r[`/ttown/albums/album-${n}`] = `/kicks/toilet-town/photos/album-${String(n).padStart(2, '0')}`;
  for (const f of readdirSync('src/content/projects')) {
    const slug = f.replace('.json', '');
    const { section, legacySlug } = JSON.parse(readFileSync(`src/content/projects/${f}`, 'utf8'));
    const old = legacySlug || slug; // legacySlug is set when the new file name differs from the Webflow URL
    if (section === 'design') r[`/huzzah/design/${old}`] = `/design/${slug}`;
    if (section === 'kicks') r[`/huzzah/design/${old}`] = slug === 'toilet-town' ? '/kicks/toilet-town' : `/kicks/${slug}`;
  }
  // Point straight at the final (trailing-slash) address so visitors get one hop, not two.
  for (const [from, to] of Object.entries(r)) if (to.startsWith('/') && !to.endsWith('/')) r[from] = `${to}/`;
  return r;
}

const redirects = legacyRedirects();

// Cloudflare reads dist/_redirects and serves true 301s for old URLs.
// (Astro's own redirects below remain as a fallback on hosts without that file.)
const cloudflareRedirects = {
  name: 'cloudflare-redirects',
  hooks: {
    /** @param {{ dir: URL }} ctx */
    'astro:build:done': ({ dir }) => {
      const lines = Object.entries(redirects).flatMap(([from, to]) =>
        from === '/design' ? [`/design ${to} 301`, `/design/ ${to} 301`] : [`${from} ${to} 301`],
      );
      writeFileSync(new URL('_redirects', dir), lines.join('\n') + '\n');
    },
  },
};

export default defineConfig({
  // The main address is the bare domain; www redirects to it (Cloudflare redirect rule).
  site: 'https://huzzahdesign.com',
  redirects,
  integrations: [
    react(),
    sitemap({ filter: (page) => !/\/(huzzah|ttown|happy-trails)\//.test(page) && !/\/404\/?$/.test(page) && !/\/design\/?$/.test(page) }),
    cloudflareRedirects,
    ...(isDev ? [keystatic()] : []),
  ],
});
