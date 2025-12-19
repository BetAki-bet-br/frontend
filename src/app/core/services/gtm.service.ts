import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

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
export class GtmService {
  private router = inject(Router);

  constructor() {
    window.dataLayer = window.dataLayer || [];
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.trackPageView(event.urlAfterRedirects);
      });
  }

  private pushToDataLayer(data: GtmEvent): void {
    window.dataLayer.push(data);
  }

  private enctryptAccountId(accountId: string): string {
    return btoa(accountId);
  }

  // Generic page view event for homepage and landing pages
  trackPageView(url: string): void {
    this.pushToDataLayer({
      event: 'pageview',
      page_path: url,
    });
  }

  // Event for Registration Start
  trackRegistrationStart(): void {
    this.pushToDataLayer({
      event: 'regstart',
    });
  }

  // Event for Registration Confirm
  trackRegistrationConfirm(accountId: string): void {
    this.pushToDataLayer({
      event: 'registered-customer',
      accountId: accountId,
    });
  }

  // Event for Login
  trackLogin(accountId: string): void {
    this.pushToDataLayer({
      event: 'GSLoggedin',
      accountId: this.enctryptAccountId(accountId),
    });
  }

  // Event for First Deposit Confirm
  trackFirstDepositConfirm(accountId: string, value: number, currency: string): void {
    this.pushToDataLayer({
      event: 'firstdepositconfirm',
      accountId: accountId,
      value: value,
      currency: currency,
    });
  }

  // Event for Deposit Confirm
  trackDepositConfirm(accountId: string, value: number, currency: string): void {
    this.pushToDataLayer({
      event: 'depositconfirm',
      accountId: accountId,
      value: value,
      currency: currency,
    });
  }

  // Event for Bet Confirm
  trackBetConfirm(accountId: string, value: number, currency: string): void {
    this.pushToDataLayer({
      event: 'betconfirm',
      accountId: accountId,
      value: value,
      currency: currency,
    });
  }

  // Event for Cookie Exclusion
  trackCookieExclusion(): void {
    this.pushToDataLayer({
      event: 'cookie_exclusion',
    });
  }

  // Event for Self Exclusion
  trackSelfExclusion(): void {
    this.pushToDataLayer({
      event: 'exclusion',
    });
  }
}
