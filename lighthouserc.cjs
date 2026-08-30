// @ts-check
'use strict';

module.exports = {
  ci: {
    collect: {
      // The site is built for the `/MyPortfolio` base path, so it must be served
      // by `astro preview`. Serving dist/ as the web root 404s every asset.
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'ready in',
      url: ['http://localhost:4321/MyPortfolio/'],
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
      },
    },
    assert: {
      preset: 'lighthouse:no-pwa',
      assertions: {
        'categories:performance':     ['error', { minScore: 0.95 }],
        'categories:accessibility':   ['error', { minScore: 1.00 }],
        'categories:best-practices':  ['error', { minScore: 0.95 }],
        'categories:seo':             ['error', { minScore: 1.00 }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: './.lighthouseci',
    },
  },
};
