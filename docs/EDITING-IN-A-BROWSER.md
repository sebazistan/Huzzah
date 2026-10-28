# Editing the site in a browser (Keystatic Cloud)

The editor can also run on the live site at **https://huzzahdesign.com/keystatic**, so a helper can edit from any browser with no installs. It saves through Keystatic Cloud, which commits to GitHub; Cloudflare then runs the safety check and rebuilds (about 2 minutes). Your own `Edit site` shortcut keeps working as before.

## One-time setup

1. Create a free account at https://keystatic.com/cloud and make a **team** and a **project**. Connect the project to the GitHub repo `sebazistan/Huzzah` (branch `main`).
2. On the project's settings page, copy the project name (`team/project`).
3. In `keystatic.config.ts`, set `CLOUD_PROJECT` to it (currently `huzzah/huzzah`), then publish. In the project settings also set Primary URL to `https://huzzahdesign.com`.
4. Open https://huzzahdesign.com/keystatic, sign in and check you can see the projects.
5. Invite helpers by email in the Keystatic Cloud team settings (free plan: up to 3 users per team).

## Things to know

- There is no Publish step in the browser: each save goes live after the rebuild. A failed safety check keeps the old site live.
- Photos uploaded in the browser are committed to the repo, then shrunk automatically by the "Shrink photos" GitHub job (anything over 1 MB or 2000 px wide) about a minute later, and the site rebuilds again. Smaller originals still save time.
- Anyone invited can change any content, including contact emails and form keys.
- Avoid editing in both places at once. Before using `Edit site`, pull the latest changes (Publish site does this for you).
- Pages stay static; only `/keystatic` and `/api/keystatic` run on the server.

## How it is wired

- `astro.config.mjs`: the Cloudflare adapter is added for builds only (`prerenderEnvironment: 'node'` so pages can read the content files); `npm run dev` runs without it.
- `keystatic.config.ts`: storage is `local` in dev and `cloud` in production.
- `wrangler.jsonc`: `nodejs_compat` flag; the adapter generates `dist/server/wrangler.json` and Cloudflare's `wrangler deploy` follows it automatically. Static files now build into `dist/client/`.
