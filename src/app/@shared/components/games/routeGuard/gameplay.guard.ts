import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { AccountVerificationActionEnum, AuthDialogService } from '@app/auth/auth-dialog.service';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class GameplayGuard implements CanActivate {
  private authDialogService = inject(AuthDialogService);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.authDialogService.initAccountVerification(AccountVerificationActionEnum.GameLaunch).pipe(
      switchMap((result) => {
        if (result?.canPlayGame) {
          return of(true);
        } else {
          return of(false);
        }
      })
    );
  }
}
