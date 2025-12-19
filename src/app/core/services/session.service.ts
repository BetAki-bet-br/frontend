import { computed, inject, Injectable, signal } from '@angular/core';
import { LocalStorageService } from './local-storage.service';

export interface Credentials {
  // Customize received credentials here
  username: string;
  jwt: string;
  sessionKey: string;
  userId: number;
  renewalToken: string;
  changeUsernameToken?: string;
  playerHash?: string;
  lastLoginTime?: string | undefined | null;
  logonTime?: string | null;
  // Terms and conditions
  updatedTCActionId?: number;
  // Required
  faceAuthRequired?: boolean;
  playerVerificationRequired?: boolean;
  // For verification iframe
  referenceId?: string;
  reverificationURL?: string;
  quickResponseCodeReverificationUrl?: string;
}

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_CREDENTIALS_KEY = 'auth_credentials';
@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private readonly localStorageService: LocalStorageService = inject(LocalStorageService);
  token = signal<string | null>(this.localStorageService.getItem(AUTH_TOKEN_KEY));
  credentials = signal<string | null>(this.localStorageService.getItem(AUTH_CREDENTIALS_KEY));
  isAuthenticated = computed(() => !!this.token());

  setToken(token: string): void {
    this.token.set(token);
    this.localStorageService.setItem(AUTH_TOKEN_KEY, token);
  }

  getCredentials(): Credentials | null {
    const creds = this.credentials();
    if (creds) {
      try {
        return JSON.parse(creds) as Credentials;
      } catch (e) {
        console.error('Error parsing credentials from localStorage', e);
        return null;
      }
    }
    return null;
  }

  setCredentials(credentials: Credentials): void {
    this.credentials.set(JSON.stringify(credentials));
    this.localStorageService.setItem(AUTH_CREDENTIALS_KEY, JSON.stringify(credentials));
  }

  clearSession(): void {
    this.token.set(null);
    this.credentials.set(null);
    this.localStorageService.removeItem(AUTH_TOKEN_KEY);
    this.localStorageService.removeItem(AUTH_CREDENTIALS_KEY);
  }
}
