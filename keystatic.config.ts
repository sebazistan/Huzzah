import { config, fields, collection, singleton } from '@keystatic/core';

const sections = [
  { label: 'Design', value: 'design' },
  { label: 'VFX', value: 'vfx' },
  { label: 'For Kicks', value: 'kicks' },
] as const;

// Editing on your own computer (npm run dev) saves straight to the files.
// The live site's editor (huzzahdesign.com/keystatic) saves through Keystatic Cloud,
// which commits to GitHub; Cloudflare then rebuilds the site.
const CLOUD_PROJECT = 'huzzah/huzzah'; // from keystatic.com, project settings

export default config({
  storage: import.meta.env?.PROD ? { kind: 'cloud' } : { kind: 'local' },
  cloud: { project: CLOUD_PROJECT },
  ui: { brand: { name: 'Huzzah' } },

  singletons: {
    site: singleton({
      label: 'Site settings',
      path: 'src/content/site',
      format: { data: 'json' },
      schema: {
        heroHeading: fields.text({ label: 'Home heading' }),
        tagline: fields.text({ label: 'Tagline', multiline: true }),
        homeTitle: fields.text({
          label: 'Home page title (shown in Google results and browser tabs)',
          description: 'About 60 characters. Include what you do and where, for example: Huzzah | Production Design, Pre-Vis & Props in Toronto',
        }),
        homeDescription: fields.text({
          label: 'Home page description (shown in Google results and when shared)',
          description: 'About 150 characters.',
          multiline: true,
        }),
        shareImage: fields.image({
          label: 'Default share image (the picture shown when a link is shared)',
          description: 'Used for pages without their own photo. Best size is 1200 x 630 pixels. Every project uses its own cover photo automatically.',
          directory: 'public/images/share',
          publicPath: '/images/share/',
        }),
        ownerName: fields.text({
          label: 'Owner name (for search engines)',
          description: 'Shown to Google as the person behind Huzzah.',
        }),
        bio: fields.text({ label: 'About / bio', multiline: true }),
        email: fields.text({ label: 'Contact email' }),
        web3formsKey: fields.text({
          label: 'Web3Forms access key (for all contact forms)',
          description: 'Paste the key Web3Forms emailed you. Messages from every contact page are sent to the email address you gave Web3Forms. Leave empty to open the visitor\'s email app instead.',
        }),
        formEndpoint: fields.text({
          label: 'Other form service address (only if not using Web3Forms)',
          description: 'For example a Formspree address. Leave empty if you use Web3Forms.',
        }),
        instagram: fields.url({ label: 'Instagram URL' }),
        imdb: fields.url({ label: 'IMDb URL' }),
        clients: fields.array(fields.text({ label: 'Client' }), {
          label: 'Clients (Design About page)',
          itemLabel: (p) => p.value,
        }),
        vfxBio: fields.text({ label: 'VFX About text', multiline: true }),
        vfxIntro: fields.text({
          label: 'VFX page intro (the paragraph under the VFX heading)',
          multiline: true,
        }),
        kicksIntro: fields.text({ label: 'For Kicks page intro (the line under the heading)' }),
        footerText: fields.text({
          label: 'Footer text',
          description: 'Shown after the © and the year, at the bottom of every page.',
        }),
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
            accessKey: fields.text({
              label: 'Web3Forms access key for this page (optional)',
              description: 'Leave empty to use the key from Site settings. Only fill this in if this page should send to a different email address.',
            }),
            endpoint: fields.text({
              label: 'Other form service address (optional)',
              description: 'Only for a service other than Web3Forms. Leave empty normally.',
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
        trophy: fields.file({
          label: 'VFX page: animated trophy (WebP, GIF or APNG)',
          description: 'Loops on its own. Keep it under about 1 MB.',
          directory: 'public/images/awards',
          publicPath: '/images/awards/',
        }),
        trophyStill: fields.image({
          label: 'VFX page: still version of the trophy (for visitors who prefer reduced motion)',
          directory: 'public/images/awards',
          publicPath: '/images/awards/',
        }),
        logo: fields.image({
          label: 'VFX page: award logo (shown above the photo)',
          directory: 'public/images/awards',
          publicPath: '/images/awards/',
        }),
        vfxPhoto: fields.image({
          label: 'VFX page: photo',
          directory: 'public/images/awards',
          publicPath: '/images/awards/',
        }),
        designPhoto: fields.image({
          label: 'Design page: photo',
          directory: 'public/images/awards',
          publicPath: '/images/awards/',
        }),
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
            linkLabel: fields.text({ label: 'Link text (e.g. Explore Props)' }),
            video: fields.file({
              label: 'Looping video (MP4)',
              description: 'Plays muted on a loop. Keep it short and under about 6 MB.',
              directory: 'public/videos/services',
              publicPath: '/videos/services/',
            }),
            videoWebm: fields.file({
              label: 'Looping video (WebM, optional, smaller in some browsers)',
              directory: 'public/videos/services',
              publicPath: '/videos/services/',
            }),
            poster: fields.image({
              label: 'Still image shown while the video loads',
              directory: 'public/videos/services',
              publicPath: '/videos/services/',
            }),
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
        seoDescription: fields.text({
          label: 'Search and share description (optional)',
          description: 'Shown in Google results and when the page is shared. About 150 characters. Leave empty and one is written for you from the title, category, year and credits.',
          multiline: true,
        }),
        description: fields.text({
          label: 'About (blank line = new paragraph)',
          multiline: true,
        }),
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
            directory: 'public/images/projects',
            publicPath: '/images/projects/',
          }),
          { label: 'Gallery' },
        ),
        galleryCaptions: fields.array(fields.text({ label: 'Caption' }), {
          label: 'Gallery captions (same order as the images; leave blank for none)',
          itemLabel: (p) => p.value,
        }),
        legacySlug: fields.text({
          label: 'Advanced: old Webflow address (leave empty)',
          description: 'Only used to redirect an old Webflow link to this project. Leave it empty for new projects.',
        }),
      },
    }),
  },
});
