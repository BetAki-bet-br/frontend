import { Injectable, RendererFactory2, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { BRAND } from '@app/@core/brand';
import { Logger } from '@app/@shared/logger.service';
import { filter } from 'rxjs';

const log = new Logger('App');

/** Id of the injected container script, so a second `install()` is a no-op. */
const GTM_SCRIPT_ID = 'gtm-container';

declare global {
  interface Window {
    dataLayer: GtmEvent[];
  }
}

interface GtmEvent {
  event: string;
  [key: string]: unknown;
}

/**
 * Event: registered-customer
 */
export interface RegisteredCustomerEvent extends GtmEvent {
  name: string;
  cpf: string;
  birthDate: string;
  email: string;
  phone: string;
  state: string;
  city: string;
  affiliateId?: string; // optional
  registrationDate: string;
}

/**
 * Event: deposit (QR Code created)
 * Event: first-deposit (QR Code created)
 */
export interface DepositQrCodeEvent extends GtmEvent {
  name: string;
  cpf: string;
  email: string;
  phone: string;
  affiliateId?: string;
  transactionId: string;
  transactionValue: number;
  url: string; // QRCode URL
  expirationDate: string;
  creationDate: string;
}

/**
 * Event: deposit (payment confirmed)
 * Event: first-deposit (payment confirmed)
 */
export interface DepositPaymentEvent extends GtmEvent {
  name: string;
  cpf: string;
  email: string;
  phone: string;
  affiliateId?: string;
  transactionId: string;
  transactionValue: number;
  ipAddress: string;
  creationDate: string;
  paymentDate: string;
}

/**
 * Event: withdrawal-request
 */
export interface WithdrawalRequestEvent extends GtmEvent {
  name: string;
  cpf: string;
  email: string;
  phone: string;
  affiliateId?: string;
  transactionId: string;
  transactionValue: number;
  creationDate: string;
}

/**
 * Event: withdrawal (completed)
 */
export interface WithdrawalEvent extends GtmEvent {
  name: string;
  cpf: string;
  email: string;
  phone: string;
  affiliateId?: string;
  transactionId: string;
  transactionValue: number;
  creationDate: string;
  withdrawalDate: string;
}

@Injectable({
  providedIn: 'root',
})
export class GoogleTagManagerImplementationService {
  private router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly renderer = inject(RendererFactory2).createRenderer(null, null);
  private readonly gtmId = inject(BRAND).integrations.gtmId;

  constructor() {
    window.dataLayer = window.dataLayer || [];
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      this.trackPageView(event.urlAfterRedirects);
    });
  }

  /**
   * Loads the brand's Google Tag Manager container.
   *
   * Replaces the snippet that used to be inlined in `index.html`: the container id is brand
   * configuration, so a brand without `integrations.gtmId` simply gets no tag manager. Called once
   * from `AppStartupService`; calling it again does nothing.
   */
  install(): void {
    if (!this.gtmId) {
      log.debug('No GTM container configured for this brand');
      return;
    }
    if (this.document.getElementById(GTM_SCRIPT_ID)) {
      return;
    }

    // Same first event the official snippet pushes, before the container script loads.
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });

    const script = this.renderer.createElement('script');
    script.id = GTM_SCRIPT_ID;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(this.gtmId)}`;
    this.renderer.appendChild(this.document.head, script);

    // Parity with the snippet's `<noscript>` fallback. It never renders in a browser that got this
    // far, but crawlers and copy/paste audits expect the iframe to be part of the container.
    const noscript = this.renderer.createElement('noscript');
    const iframe = this.renderer.createElement('iframe');
    iframe.src = `https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(this.gtmId)}`;
    iframe.height = '0';
    iframe.width = '0';
    iframe.style.display = 'none';
    iframe.style.visibility = 'hidden';
    this.renderer.appendChild(noscript, iframe);
    this.renderer.insertBefore(this.document.body, noscript, this.document.body.firstChild);
  }

  pushGtmTag(tag: any) {
    this.pushToDataLayer(tag);
  }

  private pushToDataLayer(data: GtmEvent): void {
    window.dataLayer.push(data);
  }

  trackPageView(url: string): void {
    this.pushToDataLayer({
      event: 'pageview',
      page_path: url,
    });
  }
}
