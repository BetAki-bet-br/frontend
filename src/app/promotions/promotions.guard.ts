import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CredentialsService } from '@app/auth';

@Injectable({
  providedIn: 'root',
})
export class PromotionsGuard implements CanActivate {
  private credentialsService = inject(CredentialsService);
  private router = inject(Router);

  canActivate(): boolean {
    if (this.credentialsService.isAuthenticated()) {
      // Redirect authenticated user to Player profile Promotions page
      this.router.navigate(['/profile/promo']);
      return false;
    }
    return true;
  }
}
