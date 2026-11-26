// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Served from GitHub Pages with brandonlouisfox.dev attached as the custom domain
// (Settings > Pages). Deploys run through a custom Actions workflow, so no CNAME file
// is needed: GitHub ignores one in that mode.
export default defineConfig({
  site: 'https://brandonlouisfox.dev',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  build: {
    format: 'directory',
  },
});
