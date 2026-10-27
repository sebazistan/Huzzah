# Huzzah site guide

How to update the site and add to it. Start with the **Quick start**, use the **"How do I…?"** list for everyday jobs, and keep the rest for reference.

**Contents**

1. [Quick start](#1-quick-start)
2. [How do I…?](#2-how-do-i)
3. [How the site works](#3-how-the-site-works)
4. [Adding a project](#4-adding-a-project)
5. [Photos and video](#5-photos-and-video)
6. [Contact pages and forms](#6-contact-pages-and-forms)
7. [The other editable pages](#7-the-other-editable-pages)
8. [Publishing, the safety check, and undoing](#8-publishing-the-safety-check-and-undoing)
9. [Accounts: where everything lives](#9-accounts-where-everything-lives)
10. [Asking Claude for changes](#10-asking-claude-for-changes)
11. [Site map](#11-site-map)
12. [Technical reference](#12-technical-reference)
13. [Troubleshooting](#13-troubleshooting)
14. [Yearly checklist](#14-yearly-checklist)
15. [Open to-do list](#15-open-to-do-list)

---

## 1. Quick start

Three steps. The two files are in the project folder (`Huzzah 2026\Huzzah`). Tip: right-click each one, choose **Send to → Desktop (create shortcut)** so they are one click away.

1. **Double-click `Edit site.cmd`.** A black window opens and, a few seconds later, your browser opens the editor. (The very first time on a computer it installs the site's tools, which takes a minute or two.)
2. **Make your changes** in the editor and click **Save**. To preview the real site, open <http://localhost:4321>.
3. **Close the black window**, then **double-click `Publish site.cmd`.** It checks your work for mistakes, shows what changed, asks you to type a few words about it, and sends it live. The site updates in about **2 minutes**.

That's the whole routine: **Edit → Save → Publish.**

If the check finds a problem, publishing **stops** and nothing goes live. The message tells you what to fix. See [section 8](#8-publishing-the-safety-check-and-undoing).

> You need an internet connection to publish, but not to edit. Edits are saved on your computer until you publish.

---

## 2. How do I…?

| I want to… | Where | Notes |
|---|---|---|
| **Add a project** | Editor → **Projects** → **Add** | See [section 4](#4-adding-a-project). |
| Edit a project's text, credits or buttons | **Projects** → click it | |
| **Add photos** to a project | Open the project → **Gallery** → **Add** | The editor files the photos in that project's folder for you. |
| Replace a project's cover photo | Open the project → **Cover image** → **Replace** | |
| Add a caption to a photo | **Gallery captions** | One caption per photo, in the same order as the photos. Leave blank for none. |
| Add a video | **Videos** → **Add** → paste a YouTube or Vimeo link | |
| Remove a project | Open it → the trash icon → Save → Publish | You can always get it back ([section 8](#8-publishing-the-safety-check-and-undoing)). |
| Show a Design project on the home page | Tick **Show in Featured Work** | |
| Change the home heading, tagline, bio, email or social links | **Site settings** | |
| Change the intro text on the VFX or For Kicks pages, or the footer | **Site settings** | |
| Change the Services text or one of its looping videos | **Services** | |
| Add or edit an award | **Awards** | |
| Add photos or a whole album to Toilet Town | **Toilet Town albums** | |
| Change the Toilet Town quote, About text or Shop note | **Toilet Town** | |
| **Add another contact page** | **Contact pages** → **Add item** | See [section 6](#6-contact-pages-and-forms). |
| Make the contact forms send email | **Contact pages** → **Form service URL** | See [section 6](#6-contact-pages-and-forms). |
| Change menu items, colors, fonts or layout, or add a new page or section | **Ask Claude** | Examples in [section 10](#10-asking-claude-for-changes). |
| Undo a mistake | | [Section 8](#8-publishing-the-safety-check-and-undoing). |

---

## 3. How the site works

```
Edit site  →  Save  →  Publish site  →  GitHub  →  Cloudflare builds it  →  live
              (your computer)           (safe copy)   (about 2 minutes)
```

- The site is a set of **ordinary web pages built ahead of time** (made with Astro). There is no database or server to look after, and nothing to patch or update on a schedule.
- Everything you type in the editor (projects, text, awards) is saved as small **JSON files** in `src/content/`. Photos are in `public/images/`.
- The editor (**Keystatic**) runs **on your computer only**, not on the live website, so visitors can never reach it.
- **GitHub** keeps every version of every file, so it is also your backup and your undo button.
- **Cloudflare** hosts the site and notices each upload, rebuilds, and publishes.

---

## 4. Adding a project

Editor → **Projects** → **Add**.

| Field | What it does |
|---|---|
| **Title** | Shown on cards and the project page. It also creates the page address. |
| **Section** | **Design**, **VFX** or **For Kicks**. Decides which part of the site it appears in. |
| **Category** | Design projects only: Production Design, Pre-Vis or Props. |
| **Type** | Series, Commercial, Feature, Short, Music Video, Promo or Personal. The VFX page uses it for its filter buttons. |
| **Date** | Projects are sorted newest first. |
| **Show in Featured Work** | Puts a Design project on the home page. |
| **Card summary** | The short text on cards and in search and social previews. |
| **About** | The main description. A blank line starts a new paragraph. |
| **Cover image** | The big image on the project page and its card. |
| **Credits** | Pairs like *Director: Name*. |
| **Buttons / links** | For example IMDb or a watch link. Use a full `https://…` address, or a site address like `/design/other-project`. |
| **Videos** | Paste YouTube or Vimeo links. They play on the page. |
| **Gallery** and **Gallery captions** | The photo grid. Click a photo to open the carousel. |
| *Advanced: old Webflow address* | **Leave empty.** It only exists to redirect old Webflow links. |

**For Kicks projects** (like Toilet Town) appear on `/kicks`. They don't need a category.

**Toilet Town is special:** it is its own mini-site (see [section 7](#7-the-other-editable-pages)), so its card links there rather than to a normal project page.

---

## 5. Photos and video

- **Photos live in one folder per project**, named after it:
  ```
  public/images/projects/kfc/        cover.jpg, 01.jpg, 02.jpg …
  public/images/projects/longing/    cover.png, 01.jpg …
  public/images/ttown/album-03/      cover.jpg, 001.jpg …
  ```
  Pages with a single set of pictures use one folder each: `public/images/awards/`, `public/images/clients/`, `public/videos/services/`, and `public/images/ttown/` for the Toilet Town home and About pictures.
- **Uploading in the editor files things for you.** Add a photo to a project and the editor saves it into that project's folder. Nothing to tidy afterwards.
- **Don't rename, move or delete photo files by hand.** Each project remembers its photos by path, so a renamed file shows up as missing (and the safety check will stop publishing until it's fixed). To reorganize, ask Claude.
- **Size:** resize photos before uploading, to about **2000 pixels on the long side** and **under 1 MB** each. Large originals bloat the repository (the check warns about anything over 3 MB).
- **Repository size:** GitHub recommends keeping a repository under about **1 GB**, and it counts the whole history, so every old version of a replaced photo still counts. It is roughly 550 MB now. If you ever plan a big batch of photos, ask Claude first. The fix for a very large archive is moving images to Cloudflare R2.
- **Video:** don't upload video files for projects. Host them on YouTube or Vimeo and paste the link. (The looping clips on the Services page are the one exception: see section 7.)
- **Photo carousel:** clicking any gallery photo (on project pages and Toilet Town albums) opens a full-screen carousel. It works with the arrow keys, Home and End, Esc to close, swiping on a phone, and clicking the dark area. Nothing to set up.

---

## 6. Contact pages and forms

Editor → **Contact pages**. Each entry is one page at `/contact/<name>`:

| Entry | Page | Menu it belongs to |
|---|---|---|
| `design` | `/contact/design` | Design |
| `vfx` | `/contact/vfx` | VFX |
| `kicks` | `/contact/kicks` | For Kicks |
| `toilet-town` | `/contact/toilet-town` | Toilet Town |

**To add another contact page** (for example "Press"): **Add item**, give it a URL name (lowercase letters, numbers and dashes), choose the **Site section** (this sets its look and menu), and write the heading and intro. Link to it from anywhere as `/contact/<name>`.

**How the forms send email: Web3Forms**

All the contact forms use **[Web3Forms](https://web3forms.com)**, a free service that emails you each message. The visitor stays on your page and sees "Thank you".

- **One key covers every page.** It's in Editor → **Site settings → Web3Forms access key**. Messages go to the email address you registered with Web3Forms.
- **You can tell the pages apart** by the subject, which starts with the page, for example *"Huzzah VFX: Hello"* or *"Toilet Town: …"*. The email also includes a "page" line.
- **To send one page to a different inbox:** create another key at web3forms.com using that email address, and paste it into that page's own **Web3Forms access key** box (Contact pages). Leave it empty otherwise.
- **To change or replace the key:** get a new one from web3forms.com (enter your email and they send it), paste it over the old one in Site settings, then Save and Publish.
- **The key is not a secret.** Web3Forms designs it to sit in the web page. The trade-off is that someone could in theory use it to send you junk, up to your monthly allowance. The form already has a hidden trap for simple spam bots, and Web3Forms has extra spam protection options in its dashboard if you ever need them.
- **Plan limits:** the free plan has a monthly cap on messages. Check your Web3Forms dashboard or pricing page for the current number.
- **No key set?** Pressing Send then opens the visitor's own email app with the message filled in. It works, but it's less smooth.
- **Other form services** (such as Formspree) still work: put their address in the "Other form service address" box.

**After any change to the forms, send a test message from each contact page** and confirm it arrives. Check your spam folder the first time.

---

## 7. The other editable pages

**Site settings**
Home heading, tagline, bio, contact email, the **Web3Forms access key** for the contact forms, Instagram and IMDb links, the client list (Design About page), the VFX About text and client logos, the **VFX page intro**, the **For Kicks page intro**, and the **footer text**.

**Services**
Each service has a title, text, button label, link and a **looping video** that plays on its own, muted, only while it is on screen. Upload an MP4 (required), optionally a WebM (smaller in some browsers), and a still image shown while it loads. Keep clips short and **under about 6 MB**, and **without sound** (browsers won't autoplay video that has sound). Visitors who prefer reduced motion see the still image.

**Awards**
Each entry says whether it appears on the Design or VFX awards page, the result (Winner or Nominated), the award, what it was for, and an optional link. The win and nomination counts update automatically. The same screen holds the VFX page's **rotating trophy** (an animated image under about 1 MB), its still version, the award logo, and one photo per page.

**Toilet Town** (a mini-site inside For Kicks)
Pages: home, Photos (12 albums), About, Shop and its own contact page.

- **Toilet Town** (editor): the home-page quote, the About essay and picture, and the Shop note.
- **Toilet Town albums** (editor): each album's cover and photos. The order field controls the sequence.
- It has its **own lighter look** (cream background, rounded fonts, teal and yellow accents). The styling is in `src/styles/toilet-town.css`; the colors are at the top of that file.

**Categories**
Production Design, Pre-Vis, Props, For Kicks and VFX: each has a name, section, order and a short blurb that shows on the home page tiles.

---

## 8. Publishing, the safety check, and undoing

### Publishing

Double-click **`Publish site.cmd`**. It does three things:

1. **Checks the site for mistakes** (below). If it finds a problem, it stops and tells you.
2. **Shows what changed** and asks for a few words describing it.
3. **Sends it to GitHub.** Cloudflare then rebuilds and the site updates in about 2 minutes. If someone else published in the meantime, it combines the changes first.

To watch the deploy: Cloudflare → **Workers & Pages → huzzah → Deployments**. A green check means it's live. (Hard-refresh with Ctrl+F5 if a page looks old.)

*Prefer to do it by hand?* In a terminal in the project folder: `git add -A`, `git commit -m "what you changed"`, `git push`. GitHub Desktop works too.

### The safety check

`npm run check` runs by itself every time you publish and every time Cloudflare builds the site. If it finds a **PROBLEM**, the build stops and **the live site stays exactly as it was**.

| Message | What it means | Fix |
|---|---|---|
| `PROBLEM … the file /images/projects/kfc/03.jpg is missing` | A photo was renamed, moved or deleted. | Put the file back, or remove that photo from the project's Gallery in the editor. |
| `PROBLEM … it has no title` | A project has an empty Title. | Type one. |
| `PROBLEM … Category … does not exist` | A Design project has no valid category. | Choose Production Design, Pre-Vis or Props. |
| `PROBLEM … the link /design/xyz does not match any design project` | A button points at a page that doesn't exist. | Fix or remove the button. |
| `PROBLEM … is not a full path` | A picture reference is in the wrong format. | Re-select the picture in the editor. |
| `PROBLEM … is not valid JSON` | A content file was edited by hand and broken. | Undo that edit, or ask Claude. |

**Warnings never stop anything.** They flag things like a very large photo, a project with no cover image, a video link that isn't YouTube or Vimeo, or unused leftover files.

If a build fails on Cloudflare, open the failed build, click **Copy build log**, and the PROBLEM lines near the end explain why.

### Undoing a mistake

Every publish is saved, so nothing is ever truly lost.

- **Undo the last publish:** ask Claude, or in a terminal: `git revert HEAD` then `git push`.
- **Bring back a deleted project or an old version:** ask Claude. The full history is in GitHub.

---

## 9. Accounts: where everything lives

| What | Where | Notes |
|---|---|---|
| **The domain name** `huzzahdesign.com` | **Squarespace** (the registrar) | Check the **renewal date** and that auto-renew is on. The domain's *nameservers* point to Cloudflare: don't switch them back. The DNS page in Squarespace shows old Webflow records that are **inactive**; leave them alone. |
| **Hosting and DNS** | **Cloudflare** (project `huzzah`) | Serves the site. `huzzahdesign.com` is attached to it. `www` has a placeholder DNS record (type A, `192.0.2.1`) and a Redirect Rule that sends `www` to the main address. **Don't delete either**, or `www` stops working. |
| **The site's files and history** | **GitHub:** `sebazistan/Huzzah` | Also your backup. |
| **Contact forms** | A form service (not set up yet) | See [section 6](#6-contact-pages-and-forms). |
| **Public email address** | Editor → Site settings → Contact email | Currently shown on the contact pages and the footer. |
| **Happy Trails** | Its own site, <https://happytrailstoronto.com> | Separate from this one. Old `huzzahdesign.com/happy-trails/…` addresses redirect to it. |
| **Webflow** | The old host | Still active until you cancel the plan. See [section 15](#15-open-to-do-list). |

**Good habits**

- Turn on **two-step verification** on Squarespace, Cloudflare and GitHub.
- Use a **password manager**.
- Add a **second trusted person** with access (Cloudflare: invite a member; GitHub: add a collaborator; Squarespace: add a contributor with domain permissions), so the site isn't locked to one login.

---

## 10. Asking Claude for changes

Anything not in the editor, such as **layout, colors, fonts, menus, new pages, new sections or new features**, you can ask for in plain words. A good request names the page and what you want. For example:

- "On the Services page, make the videos bigger."
- "Add a Press page to the Design menu with a list of articles I can edit."
- "Make the project cards on the home page a little larger, with the title over the photo."
- "Change the For Kicks pages to use the lighter Toilet Town look."
- "Bring back the project I deleted called Hershey."
- "A photo on the Hershey page shows as missing. Can you fix it?"

Helpful extras: a screenshot with the problem marked, a link to a page you like, or the feeling you want ("calmer", "more premium"). Say **"push it"** when you're happy and it goes live.

---

## 11. Site map

| Address | What it is |
|---|---|
| `/` | Home page (the Design home). `/design` redirects here. |
| `/design/<project>` | A Design project |
| `/design/category/<category>` | A category listing |
| `/design/awards` | Design awards |
| `/vfx` | VFX archive with filters. **Not linked from the Design side**: visitors reach it only with the direct link `https://huzzahdesign.com/vfx/` |
| `/vfx/<project>`, `/vfx/about`, `/vfx/awards` | VFX pages |
| `/kicks`, `/kicks/<project>` | For Kicks |
| `/kicks/toilet-town/…` | Toilet Town: home, photos, albums, about, shop |
| `/about`, `/services` | Text pages |
| `/contact/<name>` | Contact pages |

---

## 12. Technical reference

For developers, or for Claude when making changes.

| Where | What |
|---|---|
| `src/content/` | All content as JSON: `projects/`, `categories/`, `albums/`, plus `site.json`, `services.json`, `awards.json`, `contact.json`, `toilet-town.json` |
| `public/images/`, `public/videos/` | Photos and videos, served as-is |
| `keystatic.config.ts` | Defines what the editor shows (fields and labels) |
| `src/pages/` | The pages and their addresses |
| `src/layouts/Base.astro` | Page frame: header, menus, footer |
| `src/components/` | Reusable pieces (project card, project page, contact form, awards) |
| `src/styles/` | `global.css` (the main look, colors at the top), `toilet-town.css`, `lightbox.css` |
| `src/scripts/lightbox.ts` | The photo carousel |
| `scripts/check.mjs` | The safety check |
| `astro.config.mjs` | Site settings, the sitemap, and the list of old Webflow addresses and where they redirect |
| `wrangler.jsonc`, `.nvmrc` | Cloudflare deploy settings and Node version (24) |
| `Edit site.cmd`, `Publish site.cmd` | The double-click shortcuts |
| `docs/MIGRATION-NOTES.md` | History of the Webflow move |

**Build and deploy:** build command `npm run build` (runs the check, then Astro); deploy command `npx wrangler deploy`. Pushing to `main` triggers it. No environment variables are needed. The build writes `sitemap-index.xml`, `robots.txt` and a `_redirects` file (permanent redirects for old Webflow addresses). Unknown addresses show `src/pages/404.astro`.

**Images in content files** are stored as full public paths, such as `/images/projects/kfc/cover.jpg`, which is the format the editor expects. For editor-managed collections the editor adds a folder named after the entry.

**Limits:** Cloudflare serves files up to 25 MB each and up to 20,000 files per deploy (the site is roughly 4,300). There is no total size cap.

**Search engines:** `sitemap-index.xml` and `robots.txt` are generated automatically.

---

## 13. Troubleshooting

| What you see | What to do |
|---|---|
| Double-clicking **Edit site** says Node.js isn't installed | Run `winget install OpenJS.NodeJS.LTS` in a terminal, then double-click it again. |
| The editor page is blank or won't load | Make sure the black **Edit site** window is still open, then open <http://localhost:4321/keystatic>. |
| **Publish site** stops with PROBLEM lines | Read them; nothing was sent. See the table in [section 8](#8-publishing-the-safety-check-and-undoing). |
| **Publish site** says the upload failed | Check your internet connection and run it again. |
| **Publish site** says it couldn't combine changes | Ask Claude. This only happens if the site was changed from two places at once. |
| You published but the live site looks the same | Wait 2 minutes, then hard-refresh (Ctrl+F5). Check **Deployments** in Cloudflare for a failed build. |
| A Cloudflare build failed | Click **Copy build log**; the PROBLEM lines explain it. The live site is still on the last good version. |
| `www.huzzahdesign.com` stopped working | In Cloudflare, check that the placeholder `www` DNS record and the Redirect Rule still exist ([section 9](#9-accounts-where-everything-lives)). |
| A photo shows as missing | It was renamed, moved or deleted. The check will say which one. |
| The contact form doesn't send email | Check the Web3Forms key in Site settings is filled in and has no spaces, that you published after adding it, and your spam folder. Then try a test message ([section 6](#6-contact-pages-and-forms)). If it says "Oops", the key may be wrong or the monthly allowance used up: check the Web3Forms dashboard. |
| The editor shows an image field as empty | Reload the page. If it persists, ask Claude (don't save that project meanwhile). |

---

## 14. Yearly checklist

- [ ] **Domain renewal** at Squarespace (and auto-renew is on).
- [ ] Send a **test message** through each contact form.
- [ ] Click through each section of the live site.
- [ ] Open the editor (**Edit site**) and confirm it still works.
- [ ] Check the latest **Cloudflare deployment** is green.
- [ ] Update the [accounts table](#9-accounts-where-everything-lives) if anything changed.

---

## 15. Open to-do list

Delete items as you finish them.

- [ ] **Test the contact forms:** after the Web3Forms key is published, send a test message from each contact page and confirm it arrives ([section 6](#6-contact-pages-and-forms)).
- [ ] **Google Search Console:** add `https://huzzahdesign.com` and submit `sitemap-index.xml`.
- [ ] **Webflow:** keep it as a fallback for about a week after the switch, export any form submissions you want to keep, then downgrade or cancel the Site plan. Keep the project itself as a backup. Don't click Webflow's "Update domain" banner.
- [ ] Optional: free visitor stats (Cloudflare Web Analytics) and an uptime alert.
