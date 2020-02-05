/**
 * @license
 * Copyright 2016 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

const HEADLESS_LAUNCHERS = {
  'ChromeHeadlessNoSandbox': {
    base: 'ChromeHeadless',
    flags: ['--no-sandbox'],
  },
  'FirefoxHeadless': {
    base: 'Firefox',
    flags: ['-headless'],
  },
};
const SAUCE_LAUNCHERS = {
  'sl-ie': {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    version: '11',
    platform: 'Windows 10',
  },
};
const USE_SAUCE = Boolean(process.env.SAUCE_USERNAME && process.env.SAUCE_ACCESS_KEY);
const PROGRESS = USE_SAUCE ? 'dots' : 'progress';
const customLaunchers = Object.assign({}, USE_SAUCE ? SAUCE_LAUNCHERS : {}, HEADLESS_LAUNCHERS);
const browsers = USE_SAUCE ? Object.keys(customLaunchers) : ['Chrome'];

// Files to include in Jasmine tests.
const FILES_TO_USE = [
  'packages/*/!(node_modules)/**/!(*.d).ts',
  'packages/*/!(*.d).ts',
  'testing/**/*.ts',
];

// Files to exclude in Jasmine tests.
const EXCLUDE_FILES = [
  'packages/**/*.scss.test.ts',
  'testing/featuretargeting/**',
  'testing/ts-node.register.js',
  'scripts/**/*.ts',
];

module.exports = function(config) {
  config.set({
    // Jasmine/TS config.
    basePath: '',
    files: FILES_TO_USE,
    exclude: EXCLUDE_FILES,
    frameworks: ['jasmine', 'karma-typescript'],
    karmaTypescriptConfig: {
      exclude: EXCLUDE_FILES,
      coverageOptions: {
        threshold: {
          global: {
            // TODO: Raise threshold to at least 90% after more tests have been migrated.
            statements: 80,
            branches: 70,
            functions: 50,
            lines: 80,
            excludes: [
              'testing/**/*.ts',
            ],
          },
        },
      },
      reports: {
        html: 'coverage',
        lcovonly: 'coverage',
        json: {
          directory: 'coverage',
          filename: 'coverage.json',
        },
      },
      tsconfig: './tsconfig-base.json',
    },
    preprocessors: FILES_TO_USE.reduce((obj, file) => {
      obj[file] = 'karma-typescript';
      return obj;
    }, {}),
    reporters: [PROGRESS, 'karma-typescript'],

    // Test runner config.
    logLevel: config.LOG_INFO,
    port: 9876,
    colors: true,
    browsers: browsers,
    browserDisconnectTimeout: 40000,
    browserNoActivityTimeout: 120000,
    captureTimeout: 240000,
    concurrency: USE_SAUCE ? 10 : Infinity,
    customLaunchers: customLaunchers,
  });

  if (USE_SAUCE) {
    const sauceLabsConfig = {
      username: process.env.SAUCE_USERNAME,
      accessKey: process.env.SAUCE_ACCESS_KEY,
      testName: 'Material Components Web Unit Tests - CI',
      build: process.env.SAUCE_BUILD_ID,
      tunnelIdentifier: process.env.SAUCE_TUNNEL_ID,
    };

    config.set({
      sauceLabs: sauceLabsConfig,
      // Attempt to de-flake Sauce Labs tests.
      transports: ['polling'],
      browserDisconnectTolerance: 3,
    });
  }
};
