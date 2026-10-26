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
          label: 'Clients (Design About page)',
          itemLabel: (p) => p.value,
        }),
        vfxBio: fields.text({ label: 'VFX About text', multiline: true }),
        vfxClientLogos: fields.array(
          fields.image({ label: 'Logo', directory: 'public/images/clients', publicPath: '/images/clients/' }),
          { label: 'Client logos (VFX About page)' },
        ),
      },
    }),
    contact: singleton({
      label: 'Contact pages',
      path: 'src/content/contact',
      format: { data: 'json' },
      schema: {
        forms: fields.array(
          fields.object({
            slug: fields.text({ label: 'URL name (page is /contact/<name>)', validation: { isRequired: true } }),
            section: fields.select({ label: 'Site section (sets look and menu)', options: [...sections], defaultValue: 'design' }),
            heading: fields.text({ label: 'Heading' }),
            intro: fields.text({ label: 'Intro text', multiline: true }),
            email: fields.text({
              label: 'Send to / show this email',
              description: 'Leave empty to use the main email from Site settings.',
            }),
            endpoint: fields.text({
              label: 'Form service URL (e.g. Formspree)',
              description: 'Where the form posts. Leave empty to open the visitor\'s email app instead.',
            }),
            subjectPrefix: fields.text({ label: 'Subject prefix' }),
          }),
          { label: 'Contact pages', itemLabel: (p) => `${p.fields.slug.value} (${p.fields.section.value})` },
        ),
      },
    }),
    awards: singleton({
      label: 'Awards',
      path: 'src/content/awards',
      format: { data: 'json' },
      schema: {
        items: fields.array(
          fields.object({
            section: fields.select({ label: 'Shows on', options: [{ label: 'Design', value: 'design' }, { label: 'VFX', value: 'vfx' }], defaultValue: 'design' }),
            result: fields.select({ label: 'Result', options: [{ label: 'Winner', value: 'Winner' }, { label: 'Nominated', value: 'Nominated' }], defaultValue: 'Winner' }),
            award: fields.text({ label: 'Award' }),
            detail: fields.text({ label: 'For' }),
            url: fields.text({ label: 'Link (optional)' }),
          }),
          { label: 'Awards', itemLabel: (p) => `${p.fields.result.value}: ${p.fields.award.value}` },
        ),
      },
    }),
    toiletTown: singleton({
      label: 'Toilet Town',
      path: 'src/content/toilet-town',
      format: { data: 'json' },
      schema: {
        heading: fields.text({ label: 'Heading' }),
        subheading: fields.text({ label: 'Subheading' }),
        intro: fields.text({ label: 'Intro / quote on home page', multiline: true }),
        heroImage: fields.image({ label: 'Home image', directory: 'public/images/ttown', publicPath: '/images/ttown/' }),
        photosIntro: fields.text({ label: 'Photos page intro' }),
        aboutHeading: fields.text({ label: 'About heading' }),
        aboutText: fields.text({ label: 'About text (blank line = new paragraph)', multiline: true }),
        aboutImage: fields.image({ label: 'About image', directory: 'public/images/ttown', publicPath: '/images/ttown/' }),
        contactIntro: fields.text({ label: 'Contact intro (used if the contact page has none)' }),
        shopText: fields.text({ label: 'Shop intro' }),
        shopNote: fields.text({ label: 'Shop note' }),
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

    albums: collection({
      label: 'Toilet Town albums',
      slugField: 'title',
      path: 'src/content/albums/*',
      format: { data: 'json' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        order: fields.integer({ label: 'Order', defaultValue: 0 }),
        cover: fields.image({ label: 'Cover', directory: 'public/images/ttown', publicPath: '/images/ttown/' }),
        photos: fields.array(
          fields.image({ label: 'Photo', directory: 'public/images/ttown', publicPath: '/images/ttown/' }),
          { label: 'Photos' },
        ),
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
        galleryCaptions: fields.array(fields.text({ label: 'Caption' }), {
          label: 'Gallery captions (same order as the images; leave blank for none)',
          itemLabel: (p) => p.value,
        }),
        galleryUrls: fields.array(fields.text({ label: 'Image URL' }), {
          label: 'Gallery image URLs (temporary, until images are uploaded)',
          itemLabel: (p) => p.value,
        }),
      },
    }),
  },
});
