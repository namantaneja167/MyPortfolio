import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Site URL for canonical links and sitemap
  site: 'https://namantaneja167.github.io',

  // Base path for GitHub Pages project site
  // Change to '/' if deploying as a user site (username.github.io)
  base: '/MyPortfolio',

  // Static output — the site ships no framework runtime
  output: 'static',

  // Astro 7 defaults to 'jsx', which drops the space between an inline element
  // and adjacent prose on the next line ("3+ years</strong>\ndelivering").
  // HTML-aware compression keeps that space, so copy can be edited safely.
  compressHTML: true,

  build: {
    assets: '_astro',
    // 'always' was measurably worse: a large inline <style> delays the preload
    // scanner from discovering the LCP image (LCP 1.7s -> 2.1s).
    inlineStylesheets: 'auto',
  },

  // Astro downloads, subsets and self-hosts these, and generates
  // metric-matched fallbacks so swapping the webfont in does not shift layout.
  fonts: [
    {
      name: 'Figtree',
      cssVariable: '--font-figtree',
      provider: fontProviders.fontsource(),
      weights: ['300 700'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
    },
    {
      name: 'Barlow Semi Condensed',
      cssVariable: '--font-barlow',
      provider: fontProviders.fontsource(),
      weights: [600, 700],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['sans-serif'],
    },
    {
      name: 'Inconsolata',
      cssVariable: '--font-inconsolata',
      provider: fontProviders.fontsource(),
      // Static weights only: the variable file carries a width axis we never
      // use and costs ~79kB against ~20kB for the two weights we do use.
      weights: [400, 700],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['monospace'],
    },
  ],

  integrations: [sitemap()],

  vite: {
    plugins: [tailwindcss()],
  },
});