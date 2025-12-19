import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Logger } from '@app/@shared/logger.service';
import { filter } from 'rxjs';

const log = new Logger('App');

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

  constructor() {
    window.dataLayer = window.dataLayer || [];
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      this.trackPageView(event.urlAfterRedirects);
    });
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
