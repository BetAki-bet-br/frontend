import { Injectable } from '@angular/core';

declare const zE: any;

@Injectable({
  providedIn: 'root',
})
export class ZendeskScriptService {
  constructor() {}

  openChat() {
    // show and open chat bubble
    if (typeof zE === 'function') {
      try {
        zE('messenger', 'show');
        zE('messenger', 'open');
      } catch {
        console.warn('Zendesk error');
      }
    } else {
      console.warn('zE is not defined');
    }
  }
}
