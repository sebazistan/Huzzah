# Huzzah

Astro site with a Keystatic editor. Three sections: `/design`, `/vfx`, `/kicks`.

## Editing content

```
npm install
npm run dev
```

Open <http://localhost:4321/keystatic>, edit projects, categories, site settings and services, then commit and push. GitHub Actions rebuilds and publishes the site.

Content lives in `src/content/` as JSON; images uploaded in the admin go to `public/images/`.

## Adding a project

- **Section** decides where it appears: Design, VFX, or For Kicks.
- **Featured** puts a Design project on the home page grid.
- **Videos**: paste YouTube or Vimeo links.
- `coverUrl` / `galleryUrls` are temporary hotlinks to the old Webflow CDN. Replace them with uploaded images before cancelling Webflow.

## Deploy

`.github/workflows/deploy.yml` publishes to GitHub Pages on every push to `main`
(repo Settings → Pages → Source: GitHub Actions).
