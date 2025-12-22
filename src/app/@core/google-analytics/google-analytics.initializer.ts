import { isDevMode } from '@angular/core';
import { IGoogleAnalyticsSettings } from './interfaces/i-google-analytics-settings';
import { GtagFn } from './types/gtag.type';

/**
 * Create a script element on DOM and link it to Google Analytics tracking code URI.
 * After that, execute exactly same init process as tracking snippet code.
 *
 * NOTE: Code is from the github project [ngx-google-analytics](https://github.com/maxandriani/ngx-google-analytics)
 * We created a copy as the repository is not well maintained. Also we only need a small part, only the creation and running of
 * the GA script. The ngx-google-analytics library has additional features with custom tags and additional services.
 */
export function GoogleAnalyticsInitializer(settings: IGoogleAnalyticsSettings, gtag: GtagFn, document: Document) {
  return async () => {
    if (!settings.trackingCode) {
      if (!isDevMode()) {
        console.error(
          'Empty tracking code for Google Analytics. Make sure to provide one when initializing NgxGoogleAnalyticsModule.',
        );
      }

      return;
    }

    if (!gtag) {
      if (!isDevMode()) {
        console.error(
          'Was not possible create or read gtag() fn. Make sure this module is running on a Browser w/ access to Window interface.',
        );
      }

      return;
    }

    if (!document) {
      if (!isDevMode()) {
        console.error(
          'Was not possible to access Document interface. Make sure this module is running on a Browser w/ access do Document interface.',
        );
      }
    }

    // Set default ga.js uri
    settings.uri = settings.uri || `https://www.googletagmanager.com/gtag/js?id=${settings.trackingCode}`;

    // these commands should run first!
    settings.initCommands = settings?.initCommands ?? [];

    // assert config command
    if (!settings.initCommands.find((x) => x.command === 'config')) {
      settings.initCommands.unshift({ command: 'config', values: [settings.trackingCode] });
    }

    // assert js command
    if (!settings.initCommands.find((x) => x.command === 'js')) {
      settings.initCommands.unshift({ command: 'js', values: [new Date()] });
    }

    for (const command of settings.initCommands) {
      gtag(command.command, ...command.values);
    }

    const s: HTMLScriptElement = document.createElement('script');
    s.async = true;
    s.src = settings.uri;

    if (settings.nonce) {
      s.setAttribute('nonce', settings.nonce);
    }

    const head: HTMLHeadElement = document.getElementsByTagName('head')[0];
    head.appendChild(s);
  };
}
