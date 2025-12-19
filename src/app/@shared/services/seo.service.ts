import { Injectable, DOCUMENT, inject } from '@angular/core';

import { Logger } from '@shared';

const log = new Logger('App');

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private dom = inject<Document>(DOCUMENT);

  updateCanonicalUrl(url: string) {
    const head = this.dom.getElementsByTagName('head')[0];
    var element: HTMLLinkElement | null = this.dom.querySelector(`link[rel='canonical']`);

    // Remove parameters from URL - if any
    const [urlNoParam] = url.split('?');

    if (element == null) {
      element = this.dom.createElement('link') as HTMLLinkElement;
      head.appendChild(element);
    }
    log.debug('Updating canonical link element with: ', urlNoParam);
    element.setAttribute('rel', 'canonical');
    element.setAttribute('href', urlNoParam);
  }

  updateRobotsMetaTags(robostTags: string[]) {
    const head = this.dom.getElementsByTagName('head')[0];
    var element: HTMLMetaElement | null = this.dom.querySelector(`meta[name='robots']`);

    // Check if Robot tags provided
    if (robostTags && robostTags.length > 0) {
      if (element == null) {
        element = this.dom.createElement('meta') as HTMLMetaElement;
        head.appendChild(element);
      }

      // Set robots tags
      log.debug('Updating robots meta tag element with: ', robostTags.join(', '));
      element.setAttribute('name', 'robots');
      element.setAttribute('content', robostTags.join(', '));
    }
    // Otherwise, remove robots meta element - if exists
    else if (element) {
      element.remove();
    }
  }
}
