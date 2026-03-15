import { Injectable, inject } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { Router } from '@angular/router';
import { CredentialsService } from '@app/auth';
import { SpinTheWheelDialogComponent } from './spin-the-wheel-dialog.component';

@Injectable({ providedIn: 'root' })
export class SpinTheWheelService {
  private dialog = inject(Dialog);
  private router = inject(Router);
  private credentialsService = inject(CredentialsService);

  open(): void {
    if (!this.credentialsService.isAuthenticated()) {
      this.router.navigateByUrl('/auth/login');
      return;
    }

    this.dialog.open(SpinTheWheelDialogComponent, {
      panelClass: 'spin-the-wheel-dialog',
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      disableClose: false,
      hasBackdrop: true,
    });
  }
}
