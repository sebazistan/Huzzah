// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';

// The Keystatic admin (/keystatic) is a dev-time editor: it runs locally and
// commits content to the repo. The published site itself is fully static.
const isDev = process.argv.includes('dev');

export default defineConfig({
  site: 'https://www.huzzahdesign.com',
  integrations: [react(), ...(isDev ? [keystatic()] : [])],
});
