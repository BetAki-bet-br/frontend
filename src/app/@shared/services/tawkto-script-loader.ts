import { Injectable, Renderer2, RendererFactory2, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BRAND } from '@app/@core/brand';

@Injectable({
  providedIn: 'root',
})
export class TawktoScriptLoader {
  private readonly scriptSrc = inject(BRAND).integrations.tawkToSDK ?? '';
  private readonly document = inject(DOCUMENT);
  private renderer: Renderer2;

  constructor() {
    const rendererFactory = inject(RendererFactory2);

    this.renderer = rendererFactory.createRenderer(null, null);

    this.loadScript();
  }

  public loadScript(): void {
    const script = this.renderer.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.id = 'tawk-sdk';
    script.src = this.scriptSrc;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    this.renderer.appendChild(this.document.head, script);
  }
}
