import { config, fields, collection, singleton } from '@keystatic/core';

const sections = [
  { label: 'Design', value: 'design' },
  { label: 'VFX', value: 'vfx' },
  { label: 'For Kicks', value: 'kicks' },
] as const;

export default config({
  storage: { kind: 'local' },
  ui: { brand: { name: 'Huzzah' } },

  singletons: {
    site: singleton({
      label: 'Site settings',
      path: 'src/content/site',
      format: { data: 'json' },
      schema: {
        heroHeading: fields.text({ label: 'Home heading' }),
        tagline: fields.text({ label: 'Tagline', multiline: true }),
        bio: fields.text({ label: 'About / bio', multiline: true }),
        email: fields.text({ label: 'Contact email' }),
        formEndpoint: fields.text({
          label: 'Contact form endpoint (e.g. Formspree URL)',
          description: 'Leave empty to fall back to a mailto: link.',
        }),
        instagram: fields.url({ label: 'Instagram URL' }),
        imdb: fields.url({ label: 'IMDb URL' }),
        clients: fields.array(fields.text({ label: 'Client' }), {
          label: 'Clients',
          itemLabel: (p) => p.value,
        }),
      },
    }),
    services: singleton({
      label: 'Services',
      path: 'src/content/services',
      format: { data: 'json' },
      schema: {
        items: fields.array(
          fields.object({
            title: fields.text({ label: 'Title' }),
            text: fields.text({ label: 'Description', multiline: true }),
            link: fields.text({ label: 'Link (path)' }),
          }),
          { label: 'Services', itemLabel: (p) => p.fields.title.value },
        ),
      },
    }),
  },

  collections: {
    categories: collection({
      label: 'Categories',
      slugField: 'name',
      path: 'src/content/categories/*',
      format: { data: 'json' },
      schema: {
        name: fields.slug({ name: { label: 'Name' } }),
        section: fields.select({ label: 'Section', options: [...sections], defaultValue: 'design' }),
        order: fields.integer({ label: 'Order', defaultValue: 0 }),
        blurb: fields.text({ label: 'Short blurb', multiline: true }),
        coverUrl: fields.text({ label: 'Cover image URL (temporary, until images are uploaded)' }),
        cover: fields.image({
          label: 'Cover image',
          directory: 'public/images/categories',
          publicPath: '/images/categories/',
        }),
      },
    }),

    projects: collection({
      label: 'Projects',
      slugField: 'title',
      path: 'src/content/projects/*',
      format: { data: 'json' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        section: fields.select({ label: 'Section', options: [...sections], defaultValue: 'design' }),
        category: fields.relationship({ label: 'Category', collection: 'categories' }),
        type: fields.select({
          label: 'Type',
          options: [
            { label: '—', value: '' },
            { label: 'Series', value: 'Series' },
            { label: 'Commercial', value: 'Commercial' },
            { label: 'Feature', value: 'Feature' },
            { label: 'Short', value: 'Short' },
            { label: 'Music Video', value: 'Music Video' },
            { label: 'Promo', value: 'Promo' },
            { label: 'Personal', value: 'Personal' },
          ],
          defaultValue: '',
        }),
        date: fields.date({ label: 'Date' }),
        featured: fields.checkbox({ label: 'Show in Featured Work', defaultValue: false }),
        summary: fields.text({ label: 'Card summary', multiline: true }),
        description: fields.text({
          label: 'About (blank line = new paragraph)',
          multiline: true,
        }),
        coverUrl: fields.text({ label: 'Cover image URL (temporary, until images are uploaded)' }),
        cover: fields.image({
          label: 'Cover image',
          directory: 'public/images/projects',
          publicPath: '/images/projects/',
        }),
        credits: fields.array(
          fields.object({
            label: fields.text({ label: 'Role' }),
            value: fields.text({ label: 'Name' }),
          }),
          { label: 'Credits', itemLabel: (p) => `${p.fields.label.value}: ${p.fields.value.value}` },
        ),
        links: fields.array(
          fields.object({
            label: fields.text({ label: 'Button label' }),
            url: fields.text({ label: 'URL' }),
          }),
          { label: 'Buttons / links', itemLabel: (p) => p.fields.label.value },
        ),
        videos: fields.array(fields.text({ label: 'YouTube or Vimeo URL' }), {
          label: 'Videos',
          itemLabel: (p) => p.value,
        }),
        gallery: fields.array(
          fields.image({
            label: 'Image',
            directory: 'public/images/gallery',
            publicPath: '/images/gallery/',
          }),
          { label: 'Gallery' },
        ),
        galleryUrls: fields.array(fields.text({ label: 'Image URL' }), {
          label: 'Gallery image URLs (temporary, until images are uploaded)',
          itemLabel: (p) => p.value,
        }),
      },
    }),
  },
});
