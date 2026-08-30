import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://astro.build/config
export default defineConfig({
  // Site URL for canonical links and sitemap
  site: 'https://namantaneja167.github.io',

  // Base path for GitHub Pages project site
  // Change to '/' if deploying as a user site (username.github.io)
  base: '/MyPortfolio',

  // Static output — zero JS by default, perfect for a portfolio
  output: 'static',

  // Build to dist/ (default; explicit for clarity)
  build: {
    assets: '_astro',
  },

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@infinibay/harbor': path.resolve(__dirname, './harbor_source/src/components/index.ts'),
        '@infinibay/harbor/src': path.resolve(__dirname, './harbor_source/src'),
        '@infinibay/harbor/components': path.resolve(__dirname, './harbor_source/src/components'),
        '@infinibay/harbor/recipes': path.resolve(__dirname, './harbor_source/src/recipes'),
      }
    }
  },

  integrations: [react()],
});