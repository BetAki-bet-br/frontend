import { Injectable, Renderer2, RendererFactory2, inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatbotScriptLoader {
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

    const chatBotWidget = this.renderer.createElement('ra-chatbot-widget');
    this.renderer.setAttribute(chatBotWidget, 'id', 'ra_wc_chatbot');
    this.renderer.setAttribute(chatBotWidget, 'slug', 'xVQ8CmKj4WeWn77RDZeUiyty7VEivNYnpJmP4Y9Q');
    this.renderer.setAttribute(chatBotWidget, 'style', 'bottom: 30px;');
    this.renderer.appendChild(this.document.body, chatBotWidget);

    const script = this.renderer.createElement('script');
    this.renderer.setAttribute(script, 'id', 'ra_chatbot' + Math.floor(200 * Math.random()));
    this.renderer.setAttribute(script, 'defer', 'true');
    this.renderer.setAttribute(script, 'src', 'https://sitewidget.net/chatbot-sdk.js');

    script.onload = script.onreadystatechange = () => {
      this.checkIfWidgetReady();
    };

    this.renderer.appendChild(this.document.body, script);
  }

  private checkIfWidgetReady(): void {
    const interval = setInterval(() => {
      const widget = this.document.querySelector('ra-chatbot-widget');
      if (widget) {
        this.readySubject.next(true);
        clearInterval(interval);
      }
    }, 200);
  }
}
