// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html
//
// This project uses the `@angular/build:karma` builder (esbuild-based). That builder
// supplies `basePath`, `files`, `singleRun` and its own karma plugins, so this file only
// carries the bits it does not own: the test framework, launchers and reporters.
//
// Note: `@angular-devkit/build-angular` is NOT a dependency of this project, so its karma
// framework/plugin must not be referenced here.
const path = require('path');

// karma-chrome-launcher resolves Chrome from the environment. Fall back to the Chrome that
// puppeteer (a devDependency) downloads so test runs work on machines and CI images that
// have no system Chrome installed.
if (!process.env.CHROME_BIN) {
  try {
    process.env.CHROME_BIN = require('puppeteer').executablePath();
  } catch {
    // puppeteer unavailable - let karma-chrome-launcher do its own lookup.
  }
}

module.exports = function (config) {
  config.set({
    frameworks: ['jasmine'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-junit-reporter'),
      require('karma-coverage'),
    ],
    client: {
      jasmine: {
        // you can add configuration options for Jasmine here
        // the possible options are listed at https://jasmine.github.io/api/edge/Configuration.html
        // for example, you can disable the random execution with `random: false`
        // or set a specific seed with `seed: 4321`
      },
      captureConsole: Boolean(process.env.KARMA_ENABLE_CONSOLE),
    },
    junitReporter: {
      outputDir: path.join(__dirname, './reports/junit/'),
      outputFile: 'TESTS-xunit.xml',
      useBrowserName: false,
      suite: '', // Will become the package name attribute in xml testsuite element
    },
    coverageReporter: {
      dir: path.join(__dirname, './coverage'),
      subdir: '.',
      reporters: [{ type: 'html' }, { type: 'text-summary' }],
    },
    reporters: ['progress', 'junit'],
    port: 9876,
    colors: true,
    // Level of logging, can be: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,
    browsers: ['ChromeHeadlessNoSandbox'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
      },
    },
    restartOnFileChange: true,
  });
};
