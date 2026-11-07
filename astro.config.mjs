// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

/**
 * Pages are pre-built as static HTML. The only server code is the admin (Keystatic at /keystatic),
 * which runs as a Vercel function when KEYSTATIC_ADMIN=1 is set on Vercel, and always in `npm run dev`.
 * See README → "Admin on the live site" for the GitHub App and environment variables it needs.
 */
const isDev = process.argv.includes('dev');
const adminInBuild = process.env.KEYSTATIC_ADMIN === '1';

// Live address. Set SITE_URL on Vercel once the custom domain is connected (e.g. https://www.silkcover.com).
const site = process.env.SITE_URL || 'https://silkcoverconsulting.vercel.app';

export default defineConfig({
  site,
  build: { format: 'directory', inlineStylesheets: 'always' },
  ...(adminInBuild ? { adapter: vercel() } : {}),
  integrations: [
    react(),
    ...(isDev || adminInBuild ? [keystatic()] : []),
    sitemap({
      filter: (page) => !page.includes('/keystatic'),
      i18n: { defaultLocale: 'en', locales: { en: 'en', fa: 'fa-AF', ps: 'ps-AF' } },
    }),
  ],
});
