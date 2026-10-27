# Huzzah

The source for [huzzahdesign.com](https://huzzahdesign.com): production design, pre-vis and props, plus an unlisted VFX section, For Kicks, and the Toilet Town photo gallery.

Built with [Astro](https://astro.build), edited with [Keystatic](https://keystatic.com), hosted on Cloudflare.

## Update the site (the short version)

1. Double-click **`Edit site.cmd`**. Your browser opens the editor.
2. Make your changes and click **Save**.
3. Close the editor window, then double-click **`Publish site.cmd`**. The site is live in about 2 minutes.

## Full guide

Everything else is in [**MANAGING-THE-SITE.md**](MANAGING-THE-SITE.md): how to add projects and photos, set up the contact forms, where each account lives, what to do when something breaks, and how to ask Claude for bigger changes.

## For developers

```
npm install       # first time only
npm run dev       # editor and preview at http://localhost:4321 (admin at /keystatic)
npm run check     # content safety check (also runs before every build)
npm run build     # check + build the site into dist/
```

Content is JSON in `src/content/`, photos are in `public/images/`, and the Cloudflare deploy settings are in `wrangler.jsonc`. The Webflow migration history is in [`docs/MIGRATION-NOTES.md`](docs/MIGRATION-NOTES.md).
