import { Component, Renderer2, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { TawkMessengerService } from './tawk-messenger.service';

@Component({
  selector: 'app-tawk',
  template: '',
  styles: [],
})
export class Tawk {
  private readonly scriptSrc = 'https://embed.tawk.to/665338ba981b6c564774d393/1huqhb6hp';
  private tawkMessengerService = inject(TawkMessengerService);
  private readonly document = inject(DOCUMENT);
  private readonly renderer = inject(Renderer2);

  constructor() {
    this.loadScript();
  }

  private loadScript(): void {
    const script = this.renderer.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = this.scriptSrc;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    this.renderer.appendChild(this.document.head, script);
  }
}
