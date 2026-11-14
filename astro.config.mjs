// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://rvl.design',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
