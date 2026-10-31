/**
 * Search and sharing helpers: page descriptions and titles, absolute addresses,
 * and the structured data (JSON-LD) that tells Google who Huzzah is and what each
 * project is. Everything here is built only from facts already in the content
 * files (title, category, year, credits, summary). Nothing is invented.
 */
import type { Project } from './content';

export const SITE = (import.meta.env.SITE ?? 'https://huzzahdesign.com').replace(/\/$/, '');
export const absUrl = (p: string) => (!p ? '' : /^https?:\/\//i.test(p) ? p : SITE + (p.startsWith('/') ? p : `/${p}`));
export const orgId = `${SITE}/#organization`;
export const personId = `${SITE}/#person`;

const MAX = 160;
const squash = (s: string) => s.replace(/\s+/g, ' ').trim();
const endSentence = (s: string) => (/[.!?…]$/.test(s) ? s : `${s}.`);

/** Trim to a search-result-friendly length without cutting a word in half. */
export function clip(text: string, max = MAX) {
  const s = squash(text);
  if (s.length <= max) return s;
  return s.slice(0, max - 1).replace(/\s+\S*$/, '').replace(/[,;:\-–—]$/, '') + '…';
}

/** What kind of work this is, in words: "Props", "Pre-vis", "VFX"... */
export function kindOf(p: Pick<Project, 'section'>, categoryName?: string) {
  if (p.section === 'vfx') return 'VFX';
  if (p.section === 'kicks') return 'For Kicks';
  return categoryName || 'Production design';
}

export function projectTitle(p: Project, categoryName?: string) {
  if (p.section === 'kicks') return p.title;
  const year = p.date ? ` (${p.date.slice(0, 4)})` : '';
  return `${p.title}: ${kindOf(p, categoryName)}${year}`;
}

/**
 * A description for search results and share previews. If someone wrote one in the
 * admin ("Search and share description") that is used. Otherwise one is assembled
 * from the real data: summary, kind of work, year and the main credits.
 */
export function projectDescription(p: Project & { seoDescription?: string }, categoryName?: string) {
  if (p.seoDescription && p.seoDescription.trim()) return clip(p.seoDescription);

  const credit = (label: string) => p.credits.find((c) => c.label.toLowerCase() === label)?.value?.trim();
  const year = p.date ? p.date.slice(0, 4) : '';
  const summary = squash(p.summary || '');
  const kind = kindOf(p, categoryName);

  const parts: string[] = [];
  // Lead with the project's name so jobs with the same one-line summary still read differently
  const summaryHasTitle = summary.toLowerCase().includes(p.title.toLowerCase());
  parts.push(summary ? (summaryHasTitle ? endSentence(summary) : endSentence(`${p.title}: ${summary}`)) : `${p.title}.`);

  const yearText = year ? ` (${year})` : '';
  const summaryHasKind = summary.toLowerCase().includes(kind.toLowerCase());
  parts.push(
    p.section === 'kicks'
      ? `A personal project by Huzzah${yearText}.`
      : summaryHasKind
        ? `By Huzzah, Toronto${yearText}.`
        : `${kind} by Huzzah, Toronto${yearText}.`,
  );

  for (const [label, text] of [['client', 'Client'], ['director', 'Director'], ['production designer', 'Production designer']] as const) {
    const v = credit(label);
    if (v) parts.push(`${text}: ${v}.`);
  }

  // add sentences while they fit
  let out = '';
  for (const part of parts) {
    const next = out ? `${out} ${part}` : part;
    if (next.length > MAX && out) break;
    out = next;
  }
  if (out.length < 90) out += ' See the photos and credits.';
  return clip(out);
}

type Site = { instagram?: string | null; imdb?: string | null; tagline?: string; ownerName?: string };

/** The person behind Huzzah. Full details, so it can stand alone on the About page as well as in the home page graph. */
function personNode(site: Site) {
  const sameAs = [site.instagram, site.imdb].filter(Boolean);
  return {
    '@type': 'Person',
    '@id': personId,
    name: site.ownerName,
    jobTitle: 'Production designer',
    url: `${SITE}/about/`,
    worksFor: { '@id': orgId },
    address: { '@type': 'PostalAddress', addressLocality: 'Toronto', addressRegion: 'ON', addressCountry: 'CA' },
    knowsAbout: ['Production design', 'Pre-visualization', 'Prop design and fabrication', 'Visual effects'],
    sameAs: sameAs.length ? sameAs : undefined,
  };
}

/** Who Huzzah is: the organization and the website. Used on the home page. */
export function siteJsonLd(site: Site, winners: string[], shareImage?: string) {
  const sameAs = [site.instagram, site.imdb].filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE}/#website`,
        url: `${SITE}/`,
        name: 'Huzzah',
        alternateName: site.ownerName ? [site.ownerName, `${site.ownerName} Huzzah`] : undefined,
        inLanguage: 'en-CA',
        publisher: { '@id': orgId },
      },
      site.ownerName ? personNode(site) : undefined,
      {
        '@type': 'Organization',
        '@id': orgId,
        name: 'Huzzah',
        url: `${SITE}/`,
        description: site.tagline || undefined,
        image: shareImage ? absUrl(shareImage) : undefined,
        sameAs: sameAs.length ? sameAs : undefined,
        address: { '@type': 'PostalAddress', addressLocality: 'Toronto', addressRegion: 'ON', addressCountry: 'CA' },
        knowsAbout: ['Production design', 'Pre-visualization', 'Prop design and fabrication', 'Visual effects'],
        founder: site.ownerName ? { '@id': personId } : undefined,
        award: winners.length ? winners : undefined,
      },
    ].filter(Boolean),
  };
}

/** The About page: who the person is, so searches for the name land here. */
export function aboutJsonLd(site: Site & { bio?: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: absUrl('/about/'),
    name: `About ${site.ownerName || 'Huzzah'}`,
    mainEntity: personNode(site),
  };
}

const ytId = (url: string) => url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/)?.[1];

/** A project page: the work itself, its videos, and the breadcrumb trail. */
export function projectJsonLd(
  p: Project,
  o: { url: string; description: string; image?: string; trail: { name: string; path: string }[] },
) {
  const url = absUrl(o.url);
  const videos = (p.videos || [])
    .map(ytId)
    .filter((id): id is string => Boolean(id))
    .map((id, i, all) => ({
      '@type': 'VideoObject',
      name: all.length > 1 ? `${p.title}, video ${i + 1}` : `${p.title}, video`,
      description: o.description,
      thumbnailUrl: [`https://i.ytimg.com/vi/${id}/hqdefault.jpg`],
      // Google wants a full date-time with a time zone, not just a day
      uploadDate: p.date ? `${p.date}T00:00:00-05:00` : undefined,
      embedUrl: `https://www.youtube.com/embed/${id}`,
      contentUrl: `https://www.youtube.com/watch?v=${id}`,
    }));

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CreativeWork',
        '@id': `${url}#work`,
        url,
        name: p.title,
        description: o.description,
        image: o.image ? absUrl(o.image) : undefined,
        dateCreated: p.date || undefined,
        genre: p.type || undefined,
        creator: { '@id': orgId },
        publisher: { '@id': orgId },
        inLanguage: 'en',
        video: p.date && videos.length ? videos : undefined,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [...o.trail, { name: p.title, path: o.url }].map((t, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: t.name,
          item: absUrl(t.path),
        })),
      },
    ],
  };
}
