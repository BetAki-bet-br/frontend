module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      //Array of URLs to collect results from
      startServerCommand: 'npm start',
      url: ['http://localhost:4200'],

      // static
      // staticDistDir: './dist',
      // isSinglePageApplication: true,
      settings: {
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        skipAudits: ['uses-http2'],
      },
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'service-worker': 'off',
        'color-contrast': 'off',
        'categories:performance': [
          'error',
          {
            minScore: 0.5,
            aggregationMethod: 'medium-run',
          },
        ],
        'categories:accessibility': [
          'error',
          {
            minScore: 0.5,
            aggregationMethod: 'medium-run',
          },
        ],
        'categories:best-practices': [
          'error',
          {
            minScore: 0.5,
            aggregationMethod: 'medium-run',
          },
        ],
        'categories:seo': [
          'error',
          {
            minScore: 0.5,
            aggregationMethod: 'medium-run',
          },
        ],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: './lighthouse_reports',
    },
  },
};
