# Managing the Huzzah site

How to edit content, add images and video, and publish changes.

## How it works (30 seconds)

- The site is built with **Astro** and published to **GitHub Pages** from the repo `sebazistan/Huzzah`.
- Content (projects, categories, text) is stored as small JSON files in `src/content/`. Images are in `public/images/`.
- You edit content in a web admin called **Keystatic**. It runs **on your computer only** (not on the live site) and saves changes into the project folder.
- You then **commit and push** to GitHub. GitHub rebuilds the site and publishes it, usually within a minute or two.

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

## Images and video

- **Images**: upload in the admin. They are saved to `public/images/`.
  - Resize before uploading: about **2000 px on the long side**, JPG, under ~500 KB–1 MB each. Large originals bloat the repo.
  - Keep the whole repo comfortably under **1 GB** (GitHub's guideline). It's about 175 MB now.
- **Video**: don't upload video files to the repo. Host on YouTube or Vimeo and paste the link in **Videos**. If you ever need self-hosted video, tell me and we'll set up Cloudflare R2 or Bunny Stream.

## Publishing changes

Using a terminal in the project folder:

```
git add -A
git commit -m "Describe what you changed"
git push
```

(GitHub Desktop works too: review changes, write a message, Commit, then Push.)

Then watch the deploy at **GitHub → Actions**. A green check means it's live. If it's red, open the run and read the error, or paste it to Claude.

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
| `/about`, `/services`, `/contact` | Text pages |

## Changing the look or layout

The design lives in code, not in the admin:

- Colors, fonts, spacing: `src/styles/global.css` (colors are at the top).
- Page layouts: `src/pages/` and `src/layouts/Base.astro`.
- Which fields projects have: `keystatic.config.ts`.

Ask Claude to make these changes; no need to edit by hand.

## Hosting and domain

- Hosting: GitHub Pages. Repo **Settings → Pages → Source: GitHub Actions**.
- To use `huzzahdesign.com`: add it under **Settings → Pages → Custom domain**, then point DNS at GitHub as instructed there. Do this only when you're ready to leave Webflow.
- Contact form: paste a form-service URL (for example Formspree) into **Site settings → Contact form endpoint**. Until then the page shows your email address instead.

## Troubleshooting

- **`node` is not recognized**: close and reopen the terminal after installing Node.
- **Admin page is blank or won't load**: make sure `npm run dev` is running and use `http://localhost:4321/keystatic`.
- **Change doesn't appear on the live site**: you must commit **and push**; check the Actions tab for a failed build.
- **Images missing**: confirm they were committed (`git status` should be clean after `git add -A`).

## Still to do before cancelling Webflow

- Fill in VFX project pages (text, videos, galleries), VFX About and Awards.
- Add your email address and Instagram/IMDb links in Site settings.
- Add redirects from the old `/huzzah/...` URLs so old links and Google results keep working.
- Add For Kicks projects.
- Point the domain at the new site.
