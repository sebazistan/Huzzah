import { createReader } from '@keystatic/core/reader';
import config from '../../keystatic.config';

export const reader = createReader(process.cwd(), config);

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Prefix site-internal paths with the deploy base path (empty on the real domain). */
export const href = (p: string) =>
  /^([a-z]+:|#|\/\/)/i.test(p) ? p : BASE + (p.startsWith('/') ? p : `/${p}`);

export type Section = 'design' | 'vfx' | 'kicks';

export async function getSite() {
  return (await reader.singletons.site.read())!;
}

export async function getServices() {
  return (await reader.singletons.services.read())?.items ?? [];
}

export async function getCategories(section?: Section) {
  const all = await reader.collections.categories.all();
  return all
    .map((c) => ({ slug: c.slug, ...c.entry }))
    .filter((c) => !section || c.section === section)
    .sort((a, b) => a.order - b.order);
}

export async function getProjects(section?: Section) {
  const all = await reader.collections.projects.all();
  return all
    .map((p) => ({ slug: p.slug, ...p.entry }))
    .filter((p) => !section || p.section === section)
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
}

export type Project = Awaited<ReturnType<typeof getProjects>>[number];

export const image = (p: { cover?: string | null; coverUrl?: string }) =>
  p.cover ? href(p.cover) : p.coverUrl || '';

export const galleryImages = (p: Project) => [
  ...p.gallery.map((g, i) => ({ src: href(g), caption: p.galleryCaptions[i] ?? '' })),
  ...p.galleryUrls.map((src) => ({ src, caption: '' })),
];

export async function getContactForms() {
  return (await reader.singletons.contact.read())?.forms ?? [];
}

export async function getAwards(section: 'design' | 'vfx') {
  const items = (await reader.singletons.awards.read())?.items ?? [];
  return items.filter((a) => a.section === section);
}

export async function getAwardsMedia() {
  const a = await reader.singletons.awards.read();
  const img = (f: string | null | undefined) => (f ? href(f) : '');
  return {
    trophy: img(a?.trophy),
    trophyStill: img(a?.trophyStill),
    logo: img(a?.logo),
    vfxPhoto: img(a?.vfxPhoto),
    designPhoto: img(a?.designPhoto),
  };
}

export async function getToiletTown() {
  return (await reader.singletons.toiletTown.read())!;
}

export async function getAlbums() {
  const all = await reader.collections.albums.all();
  return all.map((a) => ({ slug: a.slug, ...a.entry })).sort((a, b) => a.order - b.order);
}

export const ttImg = (name: string | null) => (name ? href(name) : '');

export function formatDate(d: string | null) {
  if (!d) return '';
  return new Date(d + 'T12:00:00').toLocaleDateString('en-CA', { year: 'numeric', month: 'short' });
}

export function embedUrl(url: string) {
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
}

export function paragraphs(text: string) {
  return text.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
}
