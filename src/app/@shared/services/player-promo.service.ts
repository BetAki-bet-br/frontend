import { Dialog } from '@angular/cdk/dialog';
import { Injectable, inject } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { CredentialsService } from '@app/auth';
import { BonusService } from '@icore/ngx-portalgateway-api-client-atl';
import { TranslateService } from '@ngx-translate/core';
import { catchError, filter, map, Observable, of, switchMap, take } from 'rxjs';
import { MessageDialogComponent } from '../components/message-dialog/message-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class PlayerPromoService {
  private activatedRoute = inject(ActivatedRoute);
  private dialog = inject(Dialog);
  private credentialsService = inject(CredentialsService);
  private router = inject(Router);
  private translateService = inject(TranslateService);
  private bonusService = inject(BonusService);

  /**
   * Handle promotion activation urls.
   */

  processPromoActivationUrl(): Observable<any> {
    return this.activatedRoute.queryParams.pipe(
      filter((params: Params) => params['promoShow']),
      take(1),
      map((params) => {
        const activationtoken: string = params['promoShow'];

        localStorage.setItem('promoShow', activationtoken);

        const dialogRef = this.dialog.open(MessageDialogComponent, {
          width: '31.125rem',
          data: {
            title: this.translateService.instant('Congratulations! You have won 20 Free Spins on Lucky Tiger.'),
            description: this.translateService.instant('Complete your registration and claim your gift.'),
          },
        });

        return of(null);
      }),
      switchMap((res) => {
        return this.handlePromoActivation();
      })
    );
  }

  handlePromoActivation(): Observable<any> {
    if (localStorage.getItem('promoShow')) {
      if (this.credentialsService.isAuthenticated()) {
        return this.bonusService
          .apiPortalV1BonusOptInPost({
            optInCode: localStorage.getItem('promoShow') ?? '',
          })
          .pipe(
            map((res) => {
              localStorage.removeItem('promoShow');
            }),
            catchError((err) => {
              localStorage.removeItem('promoShow');
              return of(null);
            })
          );
      } else {
        this.router.navigate(['/sign-in']);
        return of(null);
      }
    }
    return of(null);
  }
}
