import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwind from '@astrojs/tailwind';

const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site: process.env.SITE_URL || 'https://aliennatione.github.io',
  base,
  integrations: [svelte(), tailwind()],
  output: 'static',
});
