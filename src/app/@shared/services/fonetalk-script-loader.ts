import { Injectable, Renderer2, RendererFactory2, inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FonetalkScriptLoader {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private renderer: Renderer2;
  private readySubject = new BehaviorSubject<boolean>(false);
  public readonly isReady$: Observable<boolean> = this.readySubject.asObservable();
  private scriptLoaded = false;

  constructor() {
    const rendererFactory = inject(RendererFactory2);
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  public loadScript(): void {
    if (this.scriptLoaded || !isPlatformBrowser(this.platformId)) {
      return;
    }

    this.scriptLoaded = true;
    const w = window as any;

    w.UC2BChat =
      w.UC2BChat ||
      function (c: any) {
        w.UC2BChat._.push(c);
      };
    w.UC2BChat._ = w.UC2BChat._ || [];
    w.UC2BChat.url = 'https://chatvanguard.fonetalk.com.br/livechat';

    const script = this.renderer.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://chatvanguard.fonetalk.com.br/livechat/livechat.min.js?_=201903270000';

    script.onload = () => {
      this.checkIfWidgetReady();
    };

    this.renderer.appendChild(this.document.head, script);

    w.UC2BChat(function (this: any) {
      this.setLinkedToFlow('');
    });
  }

  public showWidget(): void {
    const w = this.document.defaultView as any;
    if (w.UC2BChat) {
      w.UC2BChat(function (this: any) {
        this.showWidget();
      });
    }
  }

  public hideWidget(): void {
    const w = this.document.defaultView as any;
    if (w.UC2BChat) {
      w.UC2BChat(function (this: any) {
        this.hideWidget();
      });
    }
  }

  private checkIfWidgetReady(): void {
    const interval = setInterval(() => {
      const widget = this.document.querySelector('.rocketchat-widget');
      if (widget) {
        this.readySubject.next(true);
        clearInterval(interval);
      }
    }, 200);
  }
}
