// @ts-check
'use strict';

/** @type {import('@lhci/cli').LhciConfig} */
module.exports = {
  ci: {
    collect: {
      // Build is done before this step; serve the dist/ folder directly
      staticDistDir: './dist',
      url: ['http://localhost/MyPortfolio/'],
      numberOfRuns: 3,
    },
    assert: {
      preset: 'lighthouse:no-pwa',
      assertions: {
        'categories:performance':     ['error', { minScore: 0.85 }],
        'categories:accessibility':   ['error', { minScore: 0.95 }],
        'categories:best-practices':  ['error', { minScore: 0.90 }],
        'categories:seo':             ['error', { minScore: 1.00 }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: './.lighthouseci',
    },
  },
};
