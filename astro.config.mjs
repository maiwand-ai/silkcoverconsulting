// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import sitemap from '@astrojs/sitemap';

/**
 * The admin (Keystatic, at /keystatic) needs a server. Locally it runs with `npm run dev`.
 * For editing on the live site, add a hosting adapter (e.g. @astrojs/vercel or @astrojs/netlify),
 * set KEYSTATIC_ADMIN=1 and PUBLIC_KEYSTATIC_GITHUB_REPO=owner/repo, and follow README → "Admin on the live site".
 * Without that, `npm run build` produces a fully static site (the admin is simply left out).
 */
const isDev = process.argv.includes('dev');
const adminInBuild = process.env.KEYSTATIC_ADMIN === '1';

// TODO(content): replace with the verified production domain before launch.
export default defineConfig({
  site: 'https://www.silkcover.example',
  build: { format: 'directory', inlineStylesheets: 'always' },
  integrations: [
    react(),
    ...(isDev || adminInBuild ? [keystatic()] : []),
    sitemap({
      filter: (page) => !page.includes('/keystatic'),
      i18n: { defaultLocale: 'en', locales: { en: 'en', fa: 'fa-AF', ps: 'ps-AF' } },
    }),
  ],
});
