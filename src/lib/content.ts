import { createReader } from '@keystatic/core/reader';
import config from '../../keystatic.config';

export const reader = createReader(process.cwd(), config);

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
  p.cover ? `/images/projects/${p.cover}` : p.coverUrl || '';

export const galleryImages = (p: Project) => [
  ...p.gallery.map((g) => `/images/gallery/${g}`),
  ...p.galleryUrls,
];

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
