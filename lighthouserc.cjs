// @ts-check
'use strict';

module.exports = {
  ci: {
    collect: {
      // Vite preview serves the site under its configured GitHub Pages base path.
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'Local:',
      url: ['http://localhost:4173/MyPortfolio/'],
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
