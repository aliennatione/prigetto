// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';

const base = process.env.BASE_PATH || '';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  base: base || undefined,
  integrations: [svelte()],
});
