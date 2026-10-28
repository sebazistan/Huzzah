# Migration toolkit (scripts from the Huzzah migration)

These are the one-off scripts used to move huzzahdesign.com off Webflow. They are **examples to copy and adapt**, not a finished tool: the field names, URL patterns and folder layout are specific to that site. Read the matching phase in [`../WEBFLOW-MIGRATION-PLAYBOOK.md`](../WEBFLOW-MIGRATION-PLAYBOOK.md) before using any of them.

## Setup

Run them from a scratch folder **outside** the site repo, so the repo doesn't pick up their dependencies:

```
mkdir migration-scratch && cd migration-scratch
npm init -y
npm i cheerio sharp csv-parse
```

Put the Webflow CSV exports in `./csv/` (for example `csv/projects.csv`). Copy the scripts you need into the scratch folder.

## Scripts, in the order you would use them

| Script | What it does | When |
|---|---|---|
| `inspect-csv.mjs` | Prints each CSV's columns, row counts, draft and archived counts, category and type breakdown, and a sample row. | First look at the exports. |
| `peek.mjs` | Downloads-and-summarizes saved HTML pages: visible text, links, images, forms. | Understanding page templates, mini-sites and leftover pages. |
| `import-design-csv.mjs` | Turns CMS CSV rows into content JSON files and downloads and optimizes each row's images (sharp, 1400 px, JPEG). Skips drafts. Handles slug clashes with another collection. | Main content import. |
| `import-pages.mjs` | Scrapes the **old site's project pages** (cheerio) for what the CSV lacks: rich text, captions, YouTube embeds, buttons, galleries. Works on two different Webflow page layouts. | After the CSV import, to fill the gaps. |
| `import-ttown.mjs` | Example of importing a small photo mini-site (albums, about text, shop note). | Only as a pattern for sub-sites. |
| `reconcile.mjs` | Compares every **published** CSV row with the new content files: missing entries, fewer images or videos than the CSV. | After importing, before building pages. |
| `fix-vfx-titles.mjs` | Fills in missing `title` values from the CSV `Name` column. | Example of a repair; run the safety check early so you never need it. |
| `migrate-image-layout.mjs` | Moves photos into the folder layout the editor expects (`<collection dir>/<entry-slug>/file`) and rewrites stored paths to the full public path. | If you imported with bare filenames. Better: import in the right layout the first time. |
| `make-share-image.mjs` | Makes the 1200 x 630 default share image (collage of covers plus wordmark). | SEO phase. |
| `verify-seo.mjs` | Audits every built page: title, description, canonical, share image exists, JSON-LD parses. Reports duplicate titles and descriptions. | After every build in the SEO phase. |
| `crawl-live.mjs` | Fetches every page in the **live** sitemap: status codes, leftover Webflow references, blank titles, image spot-check. | After every deploy and before cancelling Webflow. |
| `shrink-images.mjs` | Shrinks oversized photos in `public/images` (over 1 MB or 2000 px wide): resizes, re-saves as JPEG, converts opaque PNGs to JPEG and fixes the paths in `src/content`. Idempotent. Copy it to `scripts/` and add `"shrink": "node scripts/shrink-images.mjs"` to `package.json`. | Once after the import, then automatically via the workflow below. |
| `shrink-images.workflow.yml` | GitHub Action: runs the script whenever photos are pushed to `main` (for example uploads from the browser editor) and commits the smaller versions. Copy it to `.github/workflows/shrink-images.yml`. | After browser editing is set up. |

The site's own safety check (`scripts/check.mjs`) and the Windows shortcuts (`Edit site.cmd`, `Publish site.cmd`) live in the repo root and are meant to be copied as they are.
