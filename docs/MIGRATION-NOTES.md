# Webflow migration notes (history)

Reference only. This records how the old Webflow site was moved into this one. You don't need it for day-to-day editing; the everyday guide is [`MANAGING-THE-SITE.md`](../MANAGING-THE-SITE.md).

## What was migrated

Checked against the Webflow CMS exports:

- All **284 published Design entries**: 135 Pre-vis, 103 Props, 18 Production Design, 28 For Kicks.
- All **54 published VFX projects**, plus one more that Webflow marks as a draft but that was live on the old VFX page ("I Hate People, People Hate Me").
- **Toilet Town**: 12 albums, About, Shop and its contact page.
- About and Awards for both sides, the VFX client logos, the Services videos and the animated awards trophy.
- Over 300 redirects from old Webflow addresses to the new ones.
- Every image. They are stored in this repository, not on Webflow.

## Left out on purpose

- The unpublished drafts in the Webflow export: `cibc2025`, `moose`, `stickers`, `webb` (Design) and `computer-girl-38aff`, `fish`, `sketch-comedy-intro` (VFX).
- The empty Webflow shop, the checkout template pages, the empty search page and the empty photography page.
- **Happy Trails** is not part of this site. It already lives on its own domain, <https://happytrailstoronto.com> (hosted on GitHub Pages, not Webflow), so cancelling Webflow doesn't affect it. The old `huzzahdesign.com/happy-trails/...` addresses redirect there.

## Things worth knowing

- Three projects exist on both the Design and VFX sides under the same name (Burnwatch, Don't Come Upstairs, My Dead Mom). The Design versions are stored with a `-design` suffix, and the old `/huzzah/design/...` links redirect to them. The project form's "Advanced: old Webflow address" field exists only for this.
- Long project texts were imported as plain paragraphs: bold text, links and bullet lists inside them were simplified. Image captions were kept.
- Some descriptions came from the page text rather than the CMS fields, so a few may read slightly differently from the original.
- An early import saved the 55 VFX projects without their titles. The safety check (`npm run check`) caught this, and the titles were restored from the Webflow export.

## How the old addresses keep working

`astro.config.mjs` builds the list of old Webflow addresses and where each should go. Every build writes it as a `_redirects` file, which Cloudflare serves as permanent (301) redirects. The old Webflow site itself is no longer connected to the domain.
