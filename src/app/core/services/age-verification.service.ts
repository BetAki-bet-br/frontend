import { inject, Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class AgeVerificationService {
  private readonly AGE_VERIFICATION_KEY = 'age-verified';
  private localsStorageService = inject(LocalStorageService);
  isVerified(): boolean {
    if (this.isBrowser()) {
      const verified = this.localsStorageService.getItem(this.AGE_VERIFICATION_KEY);
      return verified === 'true';
    }
    return false;
  }

  setVerified(verified: boolean): void {
    if (this.isBrowser()) {
      this.localsStorageService.setItem(this.AGE_VERIFICATION_KEY, verified.toString());
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
}
