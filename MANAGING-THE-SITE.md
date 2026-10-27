# Managing the Huzzah site

How to edit content, add images and video, and publish changes.

## How it works (30 seconds)

- The site is built with **Astro** and hosted on **Cloudflare** (a Worker serving static files), deployed from the GitHub repo `sebazistan/Huzzah`.
- Content (projects, categories, text) is stored as small JSON files in `src/content/`. Images are in `public/images/`.
- You edit content in a web admin called **Keystatic**. It runs **on your computer only** (not on the live site) and saves changes into the project folder.
- You then **commit and push** to GitHub. Cloudflare rebuilds the site and publishes it, usually within a minute or two.

```
edit in admin  →  save  →  commit + push  →  live in ~1–2 min
```

## One-time setup (per computer)

1. Install Node.js LTS: `winget install OpenJS.NodeJS.LTS` (then reopen your terminal).
2. Clone the repo and install:
   ```
   git clone https://github.com/sebazistan/Huzzah.git
   cd Huzzah
   npm install
   ```

## Everyday editing

1. In the project folder, run:
   ```
   npm run dev
   ```
2. Open <http://localhost:4321/keystatic> in your browser.
3. Choose what to edit:
   - **Projects**: every design, VFX and For Kicks project.
   - **Categories**: Production Design, Pre-Vis, Props, For Kicks, VFX.
   - **Site settings**: home heading, tagline, bio, email, social links, client list, contact form endpoint.
   - **Services**: the three service blurbs.
4. Click **Save** in the admin. Preview the real site at <http://localhost:4321>.
5. When happy, publish (see below). Stop the server with `Ctrl+C`.

## Adding a project

In the admin: **Projects → +**

| Field | What it does |
|---|---|
| Title | Shows on cards and the project page. Also sets the URL. |
| **Section** | **Design**, **VFX** or **For Kicks**. Decides which part of the site it appears on. |
| Category | Design projects only: Production Design, Pre-Vis or Props. |
| Type | Series, Commercial, Feature, Short, Music Video, Promo. VFX uses this for its filter buttons. |
| Date | Projects are sorted newest first. |
| Show in Featured Work | Puts a Design project on the Design home page grid. |
| Card summary | Short text for cards and search/social previews. |
| About | Main description. A blank line starts a new paragraph. |
| Cover image | The big image on the project page and its card. |
| Credits | Role/name pairs (Client, Director, Production Designer, Awards…). |
| Buttons / links | e.g. IMDb, Watch link. Use a full `https://…` URL, or a site path like `/design/other-project`. |
| Videos | Paste YouTube or Vimeo links. They embed automatically. |
| Gallery | Upload images; they show as a grid. |

Leave the "(temporary) URL" fields empty. They were only used for the migration from Webflow.

### For Kicks projects (e.g. Toilet Town)

Add a project with **Section = For Kicks**. It appears on `/kicks`, which is linked from the Design side. A category isn't required.

## Contact pages and forms

Admin → **Contact pages**. Each entry in the list is one contact page at `/contact/<name>`:

| Entry | Page | Menu it appears in |
|---|---|---|
| `design` | `/contact/design` | Design |
| `vfx` | `/contact/vfx` | VFX |
| `kicks` | `/contact/kicks` | For Kicks |
| `toilet-town` | `/contact/toilet-town` | Toilet Town |

To add another contact page (for example "Press" or "Hiring"), click **Add item**, give it a URL name, pick the **Site section** (this sets its look and menu), and fill in the heading and intro. Link to it from anywhere as `/contact/<name>`.

Each page has its own **email** and **form service URL**. If either is empty it falls back to the main email in **Site settings**.

**How a form delivers messages**
- **With a form service URL**: the message is sent to that service, which emails you. Free services: [Formspree](https://formspree.io), [Web3Forms](https://web3forms.com), [Basin](https://usebasin.com). Create a form there, copy its URL into the page's *Form service URL*, and publish. Use a separate form per page if you want them routed or labelled differently (the subject also carries a prefix like "Huzzah VFX: …").
- **Without one**: pressing Send opens the visitor's email app with the message filled in, addressed to the page's email. It works, but it is less smooth than a form service.

## Awards

Admin → **Awards**. Each entry says whether it shows on the Design or VFX awards page, plus the result, award name, what it was for, and an optional link.

## Toilet Town

Toilet Town is a mini-site inside For Kicks: `/kicks/toilet-town` (home), `/photos` (12 albums), `/about`, `/shop` and its own contact page.

- Page text and images: admin → **Toilet Town**.
- Albums: admin → **Toilet Town albums**. Add photos to an album or create a new one. Order controls the sequence.
- The home page quote area is empty on purpose. The original had a passage from a book; paste in whatever you want shown (and credit it) in **Toilet Town → Intro**.

## Images and video

- **Images**: upload in the admin. They are saved to `public/images/`.
  - Resize before uploading: about **2000 px on the long side**, JPG, under ~500 KB–1 MB each. Large originals bloat the repo.
  - Keep the whole repo comfortably under **1 GB** (GitHub's guideline). It's roughly 520 MB now, mostly images.
- **Video**: don't upload video files to the repo. Host on YouTube or Vimeo and paste the link in **Videos**. If you ever need self-hosted video, tell me and we'll set up Cloudflare R2 or Bunny Stream.

## Publishing changes

Using a terminal in the project folder:

```
git add -A
git commit -m "Describe what you changed"
git push
```

(GitHub Desktop works too: review changes, write a message, Commit, then Push.)

Then watch the deploy in **Cloudflare → Workers & Pages → huzzah → Deployments**. A green check means it's live. If it fails, open that build, click **Copy build log**, and paste the last lines to Claude.

## Deleting or hiding a project

- Delete: in the admin open the project and use **Delete**, then publish.
- Hide without deleting: change its Section to a different one, or remove it and restore from git history if needed. Everything is version-controlled, so you can always undo.

## Undoing a mistake

Every publish is a git commit, so nothing is lost. To undo the last published change:

```
git revert HEAD
git push
```

## Site structure

| URL | What it is |
|---|---|
| `/` | Landing page: Design / VFX |
| `/design` | Design home (featured work, categories, bio, contact) |
| `/design/<project>` | Design project page |
| `/design/category/<category>` | Category listing |
| `/vfx` | VFX archive with type filters |
| `/vfx/<project>` | VFX project page |
| `/kicks`, `/kicks/<project>` | For Kicks |
| `/about`, `/services` | Text pages |
| `/design/awards`, `/vfx/awards`, `/vfx/about` | Awards and VFX About |
| `/kicks/toilet-town/…` | Toilet Town mini-site |
| `/contact/<name>` | Contact pages (design, vfx, kicks, toilet-town) |

## Changing the look or layout

The design lives in code, not in the admin:

- Colors, fonts, spacing: `src/styles/global.css` (colors are at the top).
- Page layouts: `src/pages/` and `src/layouts/Base.astro`.
- Which fields projects have: `keystatic.config.ts`.

Ask Claude to make these changes; no need to edit by hand.

## Hosting and domain (how it's set up)

**Hosting: Cloudflare** (Workers & Pages → project **huzzah**), connected to this GitHub repo.
- Build command `npm run build`; deploy command `npx wrangler deploy`. The deploy settings live in `wrangler.jsonc` (publishes the `dist/` folder).
- Every push to `main` deploys automatically. Node 24 comes from `.nvmrc`. No environment variables are needed.
- The build also writes a `_redirects` file, so old Webflow addresses (`/huzzah/design/…`, `/huzzah/vfx-about`, `/ttown/…`, `/happy-trails/…`) get permanent (301) redirects. The list is generated from `astro.config.mjs` and the project files.
- Unknown addresses show the 404 page (`src/pages/404.astro`).
- Cloudflare has no total-size cap for a site like this (the limits are 25 MB per file and 20,000 files; the site has roughly 4,300).

**Domain: `huzzahdesign.com`**
- Registered at **Squarespace**, with its **nameservers set to Cloudflare** (`leo.ns.cloudflare.com` and `ruth.ns.cloudflare.com`). DNS records are therefore managed **in Cloudflare**. The DNS page in Squarespace shows old Webflow records, but they are inactive. Don't edit them and don't switch back to Squarespace nameservers.
- The bare domain `huzzahdesign.com` is attached to the Worker (Domains & Routes) and is the main address.
- `www.huzzahdesign.com` has a placeholder record (type A, `www`, `192.0.2.1`, proxied) plus a Redirect Rule that sends `www` to the bare domain (301, path kept). **Don't delete that record or the rule**, or `www` will stop working.
- Email: the domain had no email (MX) records when it moved, so nothing was affected.

**Webflow**: both domains were removed from the Webflow site, so Webflow no longer claims them. Ignore Webflow's "Domain updates" banner and don't click "Update domain".

**Search engines**: `sitemap-index.xml` and `robots.txt` are generated on every build. In Google Search Console, add `https://huzzahdesign.com` and submit `sitemap-index.xml`.

**Contact forms**: see "Contact pages and forms" above.

## Troubleshooting

- **`node` is not recognized**: close and reopen the terminal after installing Node.
- **Admin page is blank or won't load**: make sure `npm run dev` is running and use `http://localhost:4321/keystatic`.
- **Change doesn't appear on the live site**: you must commit **and push**; then check **Deployments** in Cloudflare for a failed build. If the page looks old, hard-refresh (Ctrl+F5); Cloudflare caches pages for a short while.
- **`www.huzzahdesign.com` stops working**: check the placeholder `www` DNS record and the Redirect Rule still exist in Cloudflare (see "Hosting and domain").
- **Images missing**: confirm they were committed (`git status` should be clean after `git add -A`).

## Status: what was migrated from Webflow

Done (checked against your Webflow CMS exports): all 284 published Design entries (135 Pre-vis, 103 Props, 18 Production Design, 28 For Kicks), all published VFX projects, Toilet Town (12 albums, About, Shop), About and Awards for both sides, VFX client logos, 300+ redirects for old URLs, and every image (stored in this repo, not on Webflow).

Left out on purpose: the 4 unpublished drafts in the Webflow export (`cibc2025`, `moose`, `stickers`, `webb`), the empty shop and checkout template pages, the empty search and photography pages. **Happy Trails** is not part of this site: it already lives on its own domain, <https://happytrailstoronto.com> (GitHub Pages, not Webflow), so cancelling Webflow doesn't affect it. The old `huzzahdesign.com/happy-trails/...` addresses redirect there.

Three projects exist on both the Design and VFX sides under the same name (Burnwatch, Don't Come Upstairs, My Dead Mom). The design versions are stored with a `-design` suffix, and the old `/huzzah/design/...` links redirect to them.

The domain has moved to the new site. Before cancelling the Webflow plan (keep it about a week as a fallback):

1. **Contact forms**: create a form at a form service and paste its URL into **Contact pages** (see above). Send a test message from each page.
2. **Check the pasted contact email** (taken from your old Contact page) in **Site settings** is the one you want public.
3. **Skim the imported text.** Captions on images are kept, but formatting inside long project texts (bold, links, bullet lists) is simplified to plain paragraphs.
4. **Export anything you still want from Webflow**, such as old form submissions, then downgrade or cancel the Site plan. Keep the project itself as a backup.

Images are about 520 MB in the repo. GitHub's 1 GB guideline counts the whole git history, which also stores every image once. Keep new uploads resized, and avoid re-uploading or replacing large images repeatedly, because every old version stays in history.
