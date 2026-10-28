# Moving a Webflow site to Astro + Keystatic + Cloudflare: a playbook

Written from a real migration (huzzahdesign.com: about 340 CMS projects, 3,000 photos, three sections, a photo mini-site, contact forms) so the next one goes faster and avoids the mistakes made the first time. It is meant to be given to a Claude session that will do the work alongside the site's owner, who is not a developer.

**How to use this file:** give the whole thing to the new session (paste it, or attach it together with the `migration-toolkit/` folder), then paste the starter prompt below.

---

## 0. Starter prompt (paste this into the new session)

> I want to move my Webflow site **[YOUR DOMAIN]** off Webflow to a static site that I own: Astro, with the Keystatic editor, hosted on Cloudflare, code on GitHub, and Web3Forms for contact forms. I'm not a developer.
>
> A full playbook from a previous successful migration is attached (`WEBFLOW-MIGRATION-PLAYBOOK.md`, plus example scripts in `migration-toolkit/`). **Read all of it first**, then:
> 1. Ask me for the inputs and decisions in sections 2 and 3, one short batch at a time.
> 2. Discover **every** page from the live sitemap before you build anything (section 5, phase 1).
> 3. Work in phases and verify each phase with real checks (builds, audits, a crawl, screenshots), not assumptions.
> 4. **Ask me before** you push to GitHub, change DNS or nameservers, or do anything in my accounts. Follow the cutover order in phase 10 exactly.
> 5. Keep explanations short and in plain language, and tell me honestly when something went wrong.

**If the site is already partly migrated** (for example it already builds in Astro and is on Cloudflare), do not redo it: first compare the repo against the phase list and the verification checklist in section 9, report which phases are done, missing or wrong, and only then do the missing ones in order. Check these in particular: favicon, redirects from old URLs, the safety check in `npm run build`, contact forms, share previews, domain cutover state, Webflow wind-down, the handover guide, and (if wanted) phase 9b.

---

## 1. The target setup, and why

| Piece | Choice | Why |
|---|---|---|
| Site | **Astro** (static pages) | Fast, no server or database to maintain or patch, easy to host for free. |
| Editing | **Keystatic**: local mode on the owner's computer, plus **Keystatic Cloud** for editing the live site in a browser | A friendly editor (like the Webflow CMS) that saves content as JSON files in the repo. Locally it writes the files directly; in the browser it commits to GitHub through Keystatic Cloud (free for up to 3 users per team). |
| Code and backup | **GitHub** | Every change is saved and undoable; it is also the backup. |
| Hosting | **Cloudflare** (a Worker serving static files) | Free, fast, no total site-size cap, real 301 redirects. GitHub Pages has a 1 GB published-site cap and only meta-refresh redirects. |
| Forms | **Web3Forms** | Free, emails each message; the access key is meant to sit in the page. |

Browser editing (Keystatic Cloud) is phase 9b; it needs the Cloudflare adapter, so decide early whether the owner wants it. Optional later: Cloudflare R2 for images if the repo nears about 1 GB.

---

## 2. What you need from the owner before starting

**Files and addresses**

- **Webflow CMS exports, as CSV, one per collection.** Webflow → CMS → pick the collection → Export. These are exact (slugs, dates, categories, rich text, image lists) and include drafts, which scraping cannot see. Ask for **every** collection, including small ones (categories, albums, team, awards).
- The **live sitemap**: `https://their-domain/sitemap.xml`. It is the authoritative list of pages.
- The site's **Webflow preview address**: `<shortname>.webflow.io`. The shortname is visible in the page source, in the CSS file name (`<shortname>.webflow.shared.….css`). **It keeps serving the old site after the domain moves**, so it is your way to read the old pages later.
- A **Webflow code export** (Designer → Export Code) *only if* the site has interactive custom code (maps, calculators). Plain pages and CMS content don't need it.
- The old site's **favicon and touch icon**. Read the `<link rel="icon">` and `<link rel="apple-touch-icon">` tags in the live HTML (or the Internet Archive copy, `web.archive.org/web/2025/https://domain/`, if the live site has moved) and download those two image files. They sit on `cdn.prod.website-files.com` and stop working when the plan is cancelled. Without this step the new site silently ships Astro's default logo as its tab icon.
- Where the **domain is registered** (registrar) and where its **DNS is hosted** (these can differ), plus a screenshot of the current DNS records. **Email on the domain (MX and TXT records) must be preserved.**
- Anything else living under the same domain: separate sub-sites, shops, apps, other hosting. (On the first migration an "interactive map" turned out to be a separate site on its own domain, so nothing needed porting.)

**Accounts the owner creates and signs in to themselves** (you cannot create accounts or enter their passwords): GitHub (an empty repo), Cloudflare (free), Web3Forms (one form per contact page; each gives an access key emailed to them), Google Search Console (later). You can read screenshots they paste and tell them exactly where to click.

**Decisions to ask early**

1. Same look and layout, or "similar but better, more modern and professional"? (They usually want the second. Keep the structure and content.)
2. Are some sections meant to be **unlisted** (reachable only by direct link, not linked from the menus)? Should they appear in the sitemap and in Google?
3. Do separate sections or mini-sites deserve their own look?
4. Photos stored in the repo (simplest; keep under about 1 GB total, resized) or in Cloudflare R2?
5. How many contact forms, and which email should each go to?
6. Do they want the double-click Windows shortcuts for editing and publishing (non-technical owners usually do)?
7. Will anyone else (a client, a helper) edit in a browser? If so, plan phase 9b, and be upfront that Keystatic cannot limit a person to part of the site (see 9b).

---

## 3. Ground rules for the session

- **Verify, don't assume.** Say a thing is done only after a build, an audit, a crawl or a screenshot says so. Report failures plainly.
- **Ask before outward actions**: pushing to GitHub (each push needs a clear yes), DNS and nameserver changes, anything in their accounts. Local commits are fine.
- **Never reproduce text or images you don't have the right to**: if the old site quotes a book, song or article, ask the owner what to show instead. Use the owner's own words.
- Don't ask for secrets in chat. A Web3Forms access key is designed to be public and is fine to paste into the site settings; passwords and tokens are not.
- Give the owner **short, plain-language status updates**, and finish each phase with what was verified and what was **not**.
- **The preview browser pane may be shared with the owner**; they might click around while you test. Run scripted tests in a separate tab.

---

## 4. Time and order of work (rough)

Discovery and decisions → project setup → import and reconcile → pages and design → redirects → search and sharing → safety check → forms → deploy to a test address → domain cutover → Webflow wind-down → handover guide. The import and the cutover are the two parts that deserve the most care.

---

## 5. The phases

### Phase 1: Discover (do this before building anything)

1. Fetch the **sitemap**, group the URLs by path pattern and **count them**. Compare with what the home page shows. *On the first migration only the 12 featured projects were imported at first, and 244 more pages (in other categories) were missed until the sitemap was checked.*
2. Identify what each URL group is: CMS collection pages, static pages, **mini-sites under their own path**, separate domains, e-commerce and checkout template pages (often empty), search pages, interactive apps.
3. Look at the **raw HTML** (`curl -sL url -o page.html`) of one page per template. Do not rely on a summarizing fetch tool: it drops media. Search the HTML for `<video`, `w-background-video`, `data-poster-url`, `<source`, `.gif`, `<iframe`, `<form`, `w-richtext`, `w-lightbox`. *Autoplaying background videos and an animated GIF were nearly missed this way.*
4. Check the DNS now (phase 10 explains how) so you know where things are hosted.

### Phase 2: Set up the project

- Install **Node.js LTS** (Windows: `winget install OpenJS.NodeJS.LTS`). A running terminal or app will **not** see the new PATH; prepend `C:\Program Files\nodejs` in your shell.
- Scaffold Astro. Check where it actually put the files: `npm create astro@latest -- .` created a **randomly named subfolder** instead of using the current folder. Move the files into the repo clone if so.
- Add `@astrojs/react @keystatic/core @keystatic/astro react react-dom @astrojs/sitemap`.
- In `astro.config.mjs`, start with the Keystatic integration **only in dev** (`const isDev = process.argv.includes('dev')`), so the production build stays purely static. Phase 9b changes this if browser editing is wanted.
- Add `.nvmrc` containing `24`, and `.gitattributes` with `*.cmd text eol=crlf`.
- Content as JSON: collections at `src/content/<name>/*` with `format: { data: 'json' }`.

### Phase 3: Content model and import

**Model**: a `projects`-style collection (title, section, category, type, date, featured, summary, description, cover, credits, links, videos, gallery, captions, `seoDescription`, `legacySlug`), a `categories` collection, and singletons for site settings, services, contact pages, awards and similar one-off pages. Keep the admin tidy: friendly labels, short descriptions, advanced fields last.

**Import from the CSVs** (see `migration-toolkit/`):

- Parse with `csv-parse`. Skip `Draft` and `Archived` rows **but check each against the live site**: one "draft" item was live on the old site.
- **Save `title`** in every record. With `slugField: 'title'` the title lives in the JSON; leaving it out gives blank titles on the built pages (this happened for 55 projects).
- `Slug` becomes the file name. Watch for **the same slug in two collections**; suffix one (`-design`) and keep the old slug in `legacySlug` so its old URL still redirects.
- Dates: Webflow exports `Thu Aug 01 2024 00:00:00 GMT+0000`; convert to `YYYY-MM-DD` in UTC.
- **Images**: CSV image columns are semicolon-separated URL lists on `cdn.prod.website-files.com` or `uploads-ssl.webflow.com`. Some URLs are **double-encoded** (`%2520`); try the raw URL, then with `%25` replaced by `%`. Process with **sharp**: `rotate()`, `resize({ width: 1400 to 2000, withoutEnlargement: true })`, `flatten` on white, JPEG quality about 74 to 82 (mozjpeg). PNG screenshots become JPEG. Keep an eye on total size (about 1 GB recommended maximum for a GitHub repo, counting history).
- **Animated GIFs**: convert to animated WebP with sharp (`sharp(gif, { animated: true }).webp({ quality: 70, loop: 0 })`). A 3.3 MB GIF became 0.7 MB and still loops. Provide a still frame for reduced-motion visitors.
- **Background videos** (`w-background-video`): download the MP4, WebM and poster image into `public/videos/…`. The Webflow CDN stops working when the plan is cancelled.
- **Rich text**: the CSV "Post Body" is HTML. Convert to paragraphs, keep image captions as gallery captions, and **tell the owner** that bold text, links and lists inside long texts were simplified. Re-join text that the scrape glued together ("Really.Toilets" needs a paragraph break).
- Where the CSV lacks something (video URLs inside embeds, gallery layout, button labels), **scrape the old page** with cheerio, using the `*.webflow.io` address if the domain has moved. Embedded YouTube appears as an `embedly` iframe; read the `url=` query parameter.
- Self-host every image. When finished, **grep the built site for `website-files.com`, `webflow.io`, `uploads-ssl`**: there must be none.
- **Reconcile**: run `reconcile.mjs` (CSV published rows vs content files; fewer images or videos than the CSV). Fix gaps from the CSV.

### Phase 4: Pages and design

- A shared `Base.astro` layout, one small `href()` helper (adds a base path only if hosting under a sub-path), and one `data-section` attribute per site section so each can have its own colors.
- Cards and listings, project pages with credits, buttons, YouTube embeds (youtube-nocookie) and galleries. **One photo carousel script for all galleries** (arrow keys, Esc, swipe, counter, captions, focus handling).
- Respect `prefers-reduced-motion`; autoplaying looping videos must be muted, `playsinline`, and play only while visible.
- Unlisted sections: simply don't link them from menus, logos, the 404 page or in-content buttons (check with a grep of the built HTML), and decide with the owner whether they stay in the sitemap.
- Every text the owner might edit (intro lines, footer, home title) belongs in the admin, not in the code.
- Build a **404 page** and set `noindex` on it.

### Phase 5: Redirects from the old URLs

- Generate the old-URL to new-URL map **from the content files** in `astro.config.mjs` (using `legacySlug` where present), including old category pages and any sub-site paths.
- Use it twice: Astro's `redirects` option (meta-refresh fallback) **and** a tiny integration that writes `dist/_redirects` with `301`s, which Cloudflare serves as real redirects.
- Point each rule at the **final trailing-slash address** so visitors get one hop, not two. Pages that moved to a separate domain redirect to it.
- Test with `curl -s -o /dev/null -w "%{http_code} %{redirect_url}"` on a sample, without following redirects.

### Phase 6: Search and sharing

- `@astrojs/sitemap` (filter out redirect stubs and the 404), `robots.txt`, a **canonical** address on every page, Open Graph and Twitter tags, and an `og:image` that is an **absolute** URL to a file that exists.
- Share image: each project uses its cover; every other page uses a default 1200 x 630 image (sharp can compose one from covers plus an SVG text overlay).
- **JSON-LD**: Organization and WebSite on the home page, `CreativeWork` + `BreadcrumbList` (+ `VideoObject` for YouTube links) on project pages. Escape `<` as `\u003c` when writing JSON into a script tag.
- Titles and descriptions assembled **only from facts in the data** (title, kind, year, credits, summary); never invent. Provide an optional per-project override field. Start descriptions with the project's name so near-identical jobs don't produce duplicate descriptions.
- Alt text from project names and captions, honestly: it does not describe photo contents.
- Audit with `verify-seo.mjs`.
- **Favicon and touch icon**: put the two files from section 2 in `public/` (for example `favicon-32.png` and `apple-touch-icon.png`), make a `favicon.ico` from the 32 px PNG (an ICO file can wrap a PNG: a 22-byte header plus the PNG bytes), delete Astro's default `favicon.svg`, and link them in `Base.astro`: `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">`, `<link rel="icon" href="/favicon.ico" sizes="any">`, `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`. Check the built `index.html` for the three links. Browsers cache icons hard: test in a private window. *On the first migration the Astro logo shipped for weeks before anyone noticed.* Note that the Keystatic editor tab has its own bolt icon; that is not the site's icon.

### Phase 7: Safety check (build this early)

A `scripts/check.mjs` that runs **inside `npm run build`**, so Cloudflare runs it too and a broken change can never go live (the site stays on the last good version). It should check: JSON validity; required fields (title, section, category); every image and video reference points at a file that exists; stored paths are in the editor's format; links between pages resolve; contact pages are well formed; oversized images warn. *On its first run it caught the 55 blank titles.* Pair it with a documentation table of every message and its fix.

### Phase 7b: Keep photos small, automatically

Photos are what fills the repo (Huzzah: 532 MB of a 550 MB repository), and browser uploads can arrive at any size. Two parts, both in `migration-toolkit/`:

1. **`scripts/shrink-images.mjs`** (`npm run shrink`, `-- --dry` to preview). For every JPEG or PNG in `public/images` that is over 1 MB or wider than 2000 px: resize to at most 2000 px wide, re-save as JPEG (quality 80, mozjpeg); an **opaque PNG becomes a JPEG** and every reference to it in `src/content/*.json` is rewritten; a PNG with real transparency stays PNG. A result is only kept if it is at least 10% smaller, so running it twice changes nothing. Run it **once** after the import (Huzzah: 95 photos, 157 MB down to 29 MB, safety-check warnings went from 12 to 0), then build and spot-check a few pages.
2. **`.github/workflows/shrink-images.yml`**: on every push to `main` that touches `public/images/**`, run the script and commit the smaller files back as `github-actions[bot]` (`permissions: contents: write`; skip when the actor is the bot so it cannot loop; `git pull --rebase` before pushing because the Keystatic bot may have committed meanwhile). Each browser upload then costs two Cloudflare builds (the upload, then the shrink); that is fine.

Gotchas found writing it (all on Windows or with sharp): **read each file into a Buffer** (`sharp(readFileSync(file))`) and set `sharp.cache(false)`, otherwise overwriting the same file fails with `UNKNOWN: unknown error, open ...`; **sharp reports `hasAlpha: true` for screenshots whose alpha channel is fully opaque**, so test `(await sharp(buf).stats()).isOpaque` before deciding to keep a PNG, or the "optimized" PNG just gets palette-quantized and looks blotchy; and apply the 10% rule, or a re-run re-compresses the same JPEGs forever. Tell the owner honestly that **shrinking does not reduce the GitHub repo size** (git keeps the old versions); it speeds up the site and slows future growth. Rewriting history to reclaim space (`git filter-repo` plus force push) loses the undo history and can break integrations, so only consider it near 1 GB.

### Phase 8: Contact forms (Web3Forms)

- The owner creates **one Web3Forms form per contact page** (name, website URL, destination email). Each has an **access key** (a UUID, public by design).
- The page posts a `FormData` to `https://api.web3forms.com/submit` with `access_key`, `name`, `email`, `subject`, `message` and a `page` field, header `Accept: application/json`. A reply of `{ success: true }` means sent; show friendly success and error messages. Keep a hidden honeypot field. If no key is set, fall back to opening the visitor's email app (`mailto:`).
- Admin fields: one site-wide key plus an optional key per contact page. Subject prefixes ("Site name: …") tell pages apart.
- **Test the logic with a stubbed `fetch`** in a browser (inspect what would be sent; check success and error handling). **Don't send real messages** with the owner's key unless they ask; they test on the live site and check spam.
- The free plan has a monthly cap; check the current number on Web3Forms.

### Phase 9: Deploy to Cloudflare, to a test address first

- The owner creates the GitHub repo and the Cloudflare account. Cloudflare → Workers & Pages → Create → connect the Git repo. Build command `npm run build`; the dashboard's default deploy command is `npx wrangler deploy`.
- **Add `wrangler.jsonc` before the first deploy**, or the deploy step fails:
  ```jsonc
  { "name": "project-name", "compatibility_date": "2026-01-01",
    "assets": { "directory": "./dist", "not_found_handling": "404-page" } }
  ```
  Validate locally with `npx wrangler deploy --dry-run` (it reads the files and checks limits: **25 MB per file, 20,000 files**).
- Node: `.nvmrc` (24) is picked up automatically; no environment variables are needed.
- The first successful deploy gives `<name>.<account>.workers.dev`. **Test everything there** (crawl, redirects, forms' HTML, 404) before touching DNS.

### Phase 9b: Optional: editing in a browser (Keystatic Cloud)

Lets the owner, or a client, edit at `https://domain/keystatic` from any browser with nothing to install. Each save is a commit to GitHub by `keystatic-cloud[bot]`; Cloudflare then runs the safety check and rebuilds (about 2 minutes). Local editing keeps working. This was done on Huzzah after the site was live, and it needed three fixes that you can skip by following this list.

1. **Owner creates** a free account at **https://keystatic.cloud** (not keystatic.com/cloud), a team and a project connected to the GitHub repo (branch `main`). The project settings page shows the **project key** (`team/project`) and a **Primary URL** field: set it to the live domain, or sign-in is refused. Leave "Allow local development" ticked. Free plan: up to 3 users per team.
2. `npm i @astrojs/cloudflare`, then in `astro.config.mjs`:
   ```js
   import cloudflare from '@astrojs/cloudflare';
   const isDev = process.argv.includes('dev');
   // ...
   adapter: isDev ? undefined : cloudflare({ prerenderEnvironment: 'node', imageService: 'passthrough' }),
   integrations: [ /* ... */ keystatic() ],   // now always on, not dev-only
   ```
   - **`prerenderEnvironment: 'node'` is required** if any page reads files with `node:fs` (the Keystatic reader does). Without it the build fails with `No such module "node:path"`.
   - **Use the adapter for builds only (`isDev ? undefined`).** With the adapter on, `npm run dev` runs inside Cloudflare's sandbox, and the local editor fails with `exports is not defined` (HTTP 500 on `/api/keystatic/...`).
   - Pages stay static; only `/keystatic` and `/api/keystatic` run on the server. The build output moves to `dist/client/` (static) and `dist/server/` (Worker). `_redirects` written in the `astro:build:done` hook still lands in `dist/client/`.
3. `keystatic.config.ts`: `storage: import.meta.env?.PROD ? { kind: 'cloud' } : { kind: 'local' }` plus `cloud: { project: 'team/project' }`. Local dev keeps writing files directly.
4. `wrangler.jsonc`: add `"compatibility_flags": ["nodejs_compat"]` and, inside `assets`, **`"run_worker_first": ["/keystatic", "/keystatic/*", "/api/keystatic/*"]`**. Keep `directory` and `not_found_handling` as they are; the adapter generates `dist/server/wrangler.json` and `wrangler deploy` follows it automatically. Add `.wrangler/` to `.gitignore`. The adapter also declares a `SESSION` KV binding that the site does not use; the dry run and the real deploy accepted it.
5. **Why `run_worker_first` matters:** with `not_found_handling: "404-page"`, Cloudflare answers real *browser* navigations to any address without a static file by serving the 404 page **before the Worker runs**. A plain `curl` of `/keystatic` returned 200, but browsers got the 404 page. Test with browser-like headers: `curl -H "Sec-Fetch-Mode: navigate" -H "Sec-Fetch-Dest: document" -H "Accept: text/html" https://domain/keystatic`.
6. Validate: `npm run build`, `npx wrangler deploy --dry-run` (expect the Worker around 1 MB and the same file count), `npx astro preview` for the editor page, and `npm run dev` for the local editor. Push, wait for a green build, then the owner signs in at `/keystatic`, makes one tiny edit, saves, and checks a new build appears.
7. **Check which field a page actually shows** before calling an edit "not working": on Huzzah the owner edited `summary` (cards only) and looked for it on the page, which shows `description`.
8. After the first browser save, expect Keystatic to **move photos into a `gallery/` subfolder** (`01.jpg` becomes `gallery/0.jpg`) and rewrite the paths. That is normal; the safety check accepts it. Pull before the next local edit, because the bot commits on `main` while the owner may be editing locally (the Publish shortcut pulls first).
9. Optional list tidy: `columns: ['section', 'category', 'date']` on the main collection shows extra columns in the editor's list (read-only; search still works).

**Limits to tell a client honestly.** Keystatic Cloud documents access **per team only**: no roles, no per-collection limits, no delete restrictions, nothing about review branches. Anyone invited can edit or delete any content, including site settings and form keys. Mitigations, from lightest to heaviest: a written briefing of what is theirs and what to leave alone; the owner glancing at GitHub's commit history or Cloudflare's builds; a custom simplified editor view (medium work, hides but does not lock); a branch-and-approve flow (not verified on this setup). Everything is undoable from git history, and the safety check keeps broken content from going live.

### Phase 10: Domain cutover (the dangerous part; follow this order)

**Why order matters:** on the first migration the nameservers were changed *before* the Cloudflare zone had any records, so the domain resolved to nothing and the site was **down** until records were added.

0. **Find out where things are.** `nslookup -type=NS domain.com a.gtld-servers.net` shows the **real** delegation at the registry (resolvers cache). Query each existing record at the current nameserver: apex A, `www`, MX, TXT, CNAMEs. Note email and verification records. Lower TTLs a day ahead if you can. *If the registrar shows a "using custom nameservers" banner, the records it lists are inactive.*
1. In Cloudflare, **add the domain as a site (zone) in the SAME account as the Worker** (free plan). It shows two nameservers. **Do not change nameservers yet.**
2. In that zone, **recreate every DNS record that must survive** (MX, SPF/DKIM TXT, verification CNAMEs), but **not** the web records that point to Webflow.
3. Attach the apex to the Worker: Worker → Settings → Domains & Routes → Add → **Custom domain**. This only works once the zone is in the account. The dialog may refuse a `www` subdomain ("No zones match"); instead add a **proxied A record `www` → `192.0.2.1`** (a placeholder, never reached) and a **Redirect Rule**: hostname equals `www.domain` → dynamic `concat("https://domain", http.request.uri.path)`, status 301, preserve the query string. (Or serve `www` and redirect the apex, whichever the owner prefers as the main address; match the `site` setting and canonical links.)
4. **Now change the nameservers at the registrar** to Cloudflare's two. Everything is ready, so visitors see no gap beyond DNS caching.
5. **Remove the domains from the Webflow site** (Site settings → Publishing / custom domains). Until you do, Webflow's own Cloudflare setup can keep serving a **stale cached copy of the old site on `www`**, ignoring your DNS. Purge the Cloudflare cache if needed.
6. **Test from outside the cache**: Windows and ISP resolvers cache "does not exist" for up to about 30 minutes. Use `curl --resolve host:443:<cloudflare-ip>` and check `1.1.1.1` / `8.8.8.8`. Run `crawl-live.mjs`, old URLs, www to apex, HTTPS, the 404 page.
7. **Rollback** (minutes): in the Cloudflare zone, point the apex and `www` back at Webflow's records (DNS only), if the Webflow plan is still active.

Ignore Webflow's "Domain updates / Update domain" banner. It would re-point the domain at Webflow.

### Phase 11: Wind down Webflow

1. Export **form submissions** the owner wants (Webflow's forms area).
2. **Cancel the Site plan**, not the project. A **Workspace plan is billed separately**; check for one. Yearly plans may only end at renewal. Deleting a project is permanent and removes the CMS and the preview address, so advise waiting or never.
3. The cancel buttons are in the owner's account: you can only guide them.

### Phase 12: Handover

Leave the owner with:

- `MANAGING-THE-SITE.md`: quick start (Edit, Save, Publish), a "How do I…?" table, an **accounts table** (registrar, DNS and hosting, GitHub, forms, public email, other sites, what not to delete), the safety-check message table, troubleshooting, a yearly checklist (domain renewal, test forms), and example requests to give Claude. Put migration history in a separate file.
- **Windows shortcuts**: `Edit site.cmd` (starts the editor, opens the browser, installs tools on first run) and `Publish site.cmd` (runs the check, shows changes, asks for a note, commits, pulls, pushes). ASCII only, CRLF line endings, no `!` in echo text when delayed expansion is on, no parentheses inside `if` blocks. Test with a `DRYRUN` variable that prints the git commands instead of running them.
- Recommend two-step verification on registrar, Cloudflare and GitHub, and a second trusted person with access.

---

## 6. Keystatic gotchas (hard-won)

1. **Image and file fields must be stored in the format the editor expects, or it shows them as empty and saving erases them.** The stored value is `publicPath + [entry-slug/] + filename`. For **collections**, Keystatic adds a folder named after the entry: files live in `<directory>/<slug>/<file>` and the value is `/<publicPath>/<slug>/<file>`. For **singletons** there is no slug folder. If you store bare filenames, the admin shows "Choose file" everywhere. *After importing, open several entries in the admin and confirm thumbnails load.* The reader hands back the stored string untouched, so use it as the public path.
2. `slugField: 'title'` means `title` must exist in the JSON (see phase 3).
3. Collapsed array items hide their inputs from page inspection; verify array data through the built pages instead.
4. Remove migration leftovers (temporary URL fields) from the schema once done; keep advanced fields at the bottom with clear labels.
5. New schema fields are missing from old JSON; the reader returns defaults, but write code defensively and update the content files too.
6. Local mode needs the dev server and real file access. If you later add the Cloudflare adapter, keep it out of dev (phase 9b), or the local editor breaks.
7. Don't rename or move photo files by hand later; the editor tracks them by path. Warn the owner. (Browser saves do move them into a `gallery/` subfolder; that is Keystatic's own layout.)
8. Keystatic Cloud's list view shows an entry's file name, not its title, unless you add `columns`.
9. Keystatic Cloud has no roles or per-collection permissions (phase 9b). Don't promise a client a "limited" account.

---

## 7. Mistakes made the first time (so you can skip them)

| What went wrong | How to avoid it |
|---|---|
| Built from the home page and missed 244 of 284 pages. | Start from the sitemap and the CSVs (phase 1). |
| Saved 55 projects without titles; blank titles went live. | Safety check in the build from day one; look at real built pages, not only thumbnails. |
| Stored images in a format the editor couldn't read. | Phase 3 and gotcha 1; test the admin. |
| Reorganized the image folders twice. | Use Keystatic's native per-entry folders from the start. |
| Changed nameservers before the zone had records, causing an outage. | Phase 10 order. |
| First Cloudflare deploy failed. | `wrangler.jsonc` before connecting the repo. |
| `www` showed a stale copy of the old site. | Remove the domain from Webflow (phase 10, step 5). |
| Autoplay videos and an animated GIF were nearly missed. | Read raw HTML, not summaries (phase 1). |
| Scraped paragraphs came out glued together. | Check long texts after import. |
| Assumed everything on the domain was Webflow. | Check hosting for each sub-site and domain. |
| Photos of 3 to 4 MB piled up in the repo (PNG screenshots especially). | Shrink script once after import, and the GitHub Action for later uploads (phase 7b). |
| Shipped Astro's default logo as the tab icon. | Fetch the old favicon and touch icon in phase 1 and install them (phase 6). |
| Browser editing: `/keystatic` returned the 404 page in browsers while `curl` returned 200. | `run_worker_first` for the editor routes; test with browser-like headers (phase 9b). |
| Added the Cloudflare adapter and the local editor broke (`exports is not defined`). | Adapter for builds only (phase 9b). |
| Build failed with `No such module "node:path"` after adding the adapter. | `prerenderEnvironment: 'node'` (phase 9b). |
| Called a browser edit "not showing" when the page used a different field. | Check which field the page displays. |
| Told the owner to keep Webflow a week "as a fallback". | After the DNS move, rolling back means re-pointing DNS and re-paying: the real backup is the CSVs plus the repo. Be honest about that. |

---

## 8. Windows and tooling notes

- Shells: PowerShell 5.1 and Git Bash were both available. In PowerShell, `git` writes progress to stderr, so a successful commit or push shows **`NativeCommandError` and exit code 255**. Verify with `git log --oneline -1` and `git status -sb` instead of trusting the error. A commit message passed through a here-string once silently failed; check the log afterwards.
- `$home` is a reserved variable in PowerShell; don't reuse the name.
- Run long-lived processes (the dev server) in the background through the tool's background option; a hidden `Start-Process` did not stay up.
- `npm run dev -- --port 4321`; test pages by `Invoke-WebRequest` or the browser pane.
- Keep one-off scripts in a scratch folder with their own `node_modules`.
- Windows `.cmd` files: plain ASCII, CRLF, no nested quotes inside `start`.
- Always use **absolute paths**; the working directory moves.

---

## 9. Verification checklist (done means all of these are true)

- [ ] `reconcile`: every published CSV row exists in the new content; **no referenced file is missing**.
- [ ] `npm run build` passes with the safety check; `verify-seo` reports 0 problems.
- [ ] Built HTML contains no `website-files.com`, `webflow.io` or `uploads-ssl`.
- [ ] The admin opens and shows existing photos as thumbnails.
- [ ] `npm run shrink -- --dry` reports nothing left to shrink; the safety check shows no large-photo warnings; the "Shrink photos" workflow exists (phase 7b).
- [ ] The built `index.html` links the old site's favicon and touch icon (not Astro's); checked in a private window.
- [ ] If browser editing is on: browser-style `curl` of `/keystatic` returns 200; the owner signed in and one test edit produced a green build and showed on the page.
- [ ] Test address: crawl of the sitemap, 20 or more old URLs redirect correctly, 404 page, forms present.
- [ ] After cutover: `crawl-live.mjs` shows every page 200, 0 Webflow references, image spot-check clean; `www` to apex; HTTPS.
- [ ] The owner sent a test message through every contact page and it arrived (check spam).
- [ ] Search Console has the sitemap; the guide and accounts table are written.
- [ ] Export of form submissions done; plan cancelled by the owner.

---

## 10. Reference: the Huzzah repo as a pattern

| File | What to copy from it |
|---|---|
| `keystatic.config.ts` | Collections, singletons, field options, image `directory` and `publicPath` |
| `astro.config.mjs` | Dev-only Keystatic, redirect map generator, `_redirects` integration, sitemap filter |
| `scripts/check.mjs` | The safety check (adapt the content types) |
| `src/lib/content.ts`, `src/lib/seo.ts` | Readers, `href()`, descriptions, titles, JSON-LD |
| `src/layouts/Base.astro` | Head tags (canonical, Open Graph, Twitter, JSON-LD), menus, footer |
| `src/components/ContactForm.astro` | Web3Forms form with stub-friendly JavaScript |
| `src/scripts/lightbox.ts`, `src/styles/lightbox.css` | The photo carousel |
| `wrangler.jsonc`, `.nvmrc`, `.gitattributes` | Cloudflare deploy settings (incl. `nodejs_compat` and `run_worker_first`) |
| `scripts/shrink-images.mjs`, `.github/workflows/shrink-images.yml` | Automatic photo shrinking (phase 7b) |
| `docs/EDITING-IN-A-BROWSER.md` | Owner-facing setup notes for Keystatic Cloud |
| `public/favicon-32.png`, `favicon.ico`, `apple-touch-icon.png` | The icon set and how it is linked in `Base.astro` |
| `Edit site.cmd`, `Publish site.cmd` | The owner's shortcuts |
| `MANAGING-THE-SITE.md` | The handover guide structure |
| `migration-toolkit/` | The import, reconcile, audit and crawl scripts |
