// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Served from GitHub Pages at the account root until a custom domain is attached.
// When brandonfox.dev is live: set site to 'https://brandonfox.dev' and add public/CNAME.
export default defineConfig({
  site: 'https://brandon-fox.github.io',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  build: {
    format: 'directory',
  },
});
