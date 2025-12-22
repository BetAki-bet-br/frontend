import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { Injectable, inject } from '@angular/core';
import { ConfigurationService } from '@app/@core/configuration.service';
import { OptedInEnum } from '@icore/ngx-portalgateway-api-client-atl';
import { FillPlayerInfoDialogComponent } from '../components/fill-player-info-dialog/fill-player-info-dialog.component';
import { Logger } from '@app/@shared/logger.service';
import { PromotionsService } from '@app/promotions/promotions.service';
import { Observable, catchError, from, map, of, switchMap, tap } from 'rxjs';
import {
  HeaderPromotionDialogResult,
  HeaderPromotionDialogComponent,
  HeaderPromotionDialogData,
} from '@app/@shared/components/header-promotion-dropdown/header-promotion-dialog/header-promotion-dialog.component';
import { Router } from '@angular/router';
import { ActionType } from '@app/promotions/promotions.models';
import {
  PromotionActionDialogComponent,
  PromotionActionDialogData,
} from '@app/promotions/promotions/promotion-action-dialog/promotion-action-dialog.component';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { DepositDialogComponent } from '../components/deposit-dialog/deposit-dialog.component';
import { PlayerStatusService } from './player.status.service';
import { PromotionDetailsResolved } from '../models';
import { BonusesService } from './bonuses.service';

const log = new Logger('FirstDepositCheckService');

@Injectable({
  providedIn: 'root',
})
export class FirstDepositCheckService {
  private configurationService = inject(ConfigurationService);
  private dialog = inject(Dialog);
  private promotionService = inject(PromotionsService);
  private router = inject(Router);
  private playerStatusService = inject(PlayerStatusService);
  private bonusesService = inject(BonusesService);

  preDepositCheck(openDepositPage: boolean = false) {
    log.debug('Initializing preDeposit check with openDepositPage ' + openDepositPage);
    openDepositPage = this.router.url.match('profile/wallet/deposit') ? true : openDepositPage;

    // First check if player info is correctly filled
    return this.configurationService.isPlayerInfoFulfilled().pipe(
      switchMap((isFullfilled) => {
        // If all data is filled, then just continue
        if (isFullfilled) return of(true);

        // Else open the Form to fill data
        const dialogFulfillInfoRef = this.dialog.open(FillPlayerInfoDialogComponent, { autoFocus: false });
        return dialogFulfillInfoRef.closed.pipe(
          switchMap((result: any) => {
            log.debug('dialogFulfillInfoRef closed with result', result);

            if (result && result.fillInfoStatus === 'Fulfilled') {
              // Return that data is fulfilled
              return of(true);
            }
            // Return that data was not fulfilled
            return of(false);
          })
        );
      }),
      switchMap((isFullfilled) => {
        // If the data was not fulfilled, then cancel the flow
        if (!isFullfilled) return of(null);

        // Else check if there is an first deposit promo available
        return this.checkFirstDepositPromotion().pipe(
          switchMap((promotion) => {
            if (promotion)
              // Open the promotion dialog and handle the skip or opt-in flow
              return this.openFirstDepositPromotionDialog(promotion);
            else return of(null); // skip the first deposit bonus dialog
          }),
          switchMap(() => {
            if (openDepositPage) return from(this.router.navigate(['profile/wallet/deposit']));
            else return this.openDepositDialog();
          })
        );
      })
    );
  }

  /** Return the first deposit promotion, if it exists */
  private checkFirstDepositPromotion(): Observable<PromotionDetailsResolved | null> {
    return this.promotionService.getPromotions(OptedInEnum.PossibleOptinOrOptinNotRequiredPromotions).pipe(
      map((result) => {
        return this.promotionService.findFirstDepositPromotion(result);
      })
    );
  }

  /**
   * Open the promotion dialog and handle the skip and opt-in flow
   */
  private openFirstDepositPromotionDialog(promotion: PromotionDetailsResolved) {
    const dialogRef = this.dialog.open<
      HeaderPromotionDialogResult,
      HeaderPromotionDialogData,
      HeaderPromotionDialogComponent
    >(HeaderPromotionDialogComponent, {
      data: { promotion: promotion, displaySkip: true },
    });

    // on dialog closed
    return dialogRef.closed.pipe(
      switchMap((result) => {
        log.debug('promotion closed', result);

        if (result && result.type === 'OptIn') {
          // Start the opt-in flow
          return this.optInFirstDepositPromotion(result.type, promotion);
        } else {
          // On skip just return null and do nothing
          return of(null);
        }
      })
    );
  }

  /** Opens the deposit dialog an calls the balance refresh api. */
  private openDepositDialog() {
    // open dialog
    const dialogRef = this.dialog.open(DepositDialogComponent);

    // on dialog closed
    return dialogRef.closed.pipe(
      switchMap((result: any) => {
        log.debug('deposit closed', result);
        return this.playerStatusService.updatePlayerBalance();
      })
    );
  }

  /**
   * The opt-in flow. Calls the opt-in api and opens  the loading dialog.
   * After the api call opens the success or error info dialog.
   */
  private optInFirstDepositPromotion(type: ActionType, promotion: PromotionDetailsResolved) {
    let loadingDialogRef: DialogRef<PromotionActionDialogComponent, unknown> | null = null;

    // open loading dialog
    loadingDialogRef = this.openLoadingDialog(type, promotion);
    // open dialog
    return this.openDialog(type, promotion, loadingDialogRef);
  }

  private openDialog(
    type: ActionType,
    bonus: PromotionDetailsResolved,
    loadingDialogRef: DialogRef<PromotionActionDialogComponent, unknown> | null
  ) {
    let bonusAction$ = null;
    let description = '';
    let descriptionError = '';

    bonusAction$ = this.bonusesService.bonusOptIn({
      optInCode: bonus?.optInCode ?? '',
      promotionId: bonus.promotionId,
    });
    description = marker(
      'You have successfully opt in to this promotion. See bonus history to check your active promotions.'
    );
    descriptionError = marker(
      'Something went wrong while processing your opt in. Please try again or contact our support.'
    );

    return bonusAction$?.pipe(
      switchMap((response) => {
        log.debug('bonusAction reponse:', response);

        // close loading dialog
        loadingDialogRef?.close();

        // open dialog
        const dialogRef = this.dialog.open<any, PromotionActionDialogData>(PromotionActionDialogComponent, {
          data: {
            type,
            subtitle: bonus?.promotionType,
            description,
            isLoading: false,
          },
        });

        // on dialog closed
        return dialogRef.closed;
      }),
      catchError((err) => {
        log.debug('bonusAction error:', err);

        // close loading dialog
        loadingDialogRef?.close();

        // open dialog
        const dialogRef = this.dialog.open<any, PromotionActionDialogData>(PromotionActionDialogComponent, {
          data: {
            type,
            subtitle: bonus?.promotionType,
            description: descriptionError,
            isLoading: false,
            error: true,
          },
        });

        // on dialog closed
        return dialogRef.closed;
      })
    );
  }

  private openLoadingDialog(type: ActionType, bonus: PromotionDetailsResolved) {
    let description = marker('Processing your opt in. This may take a moment.');

    // open loading dialog
    return this.dialog.open<PromotionActionDialogComponent, PromotionActionDialogData>(PromotionActionDialogComponent, {
      data: {
        type,
        subtitle: bonus?.promotionType,
        description,
        isLoading: true,
      },
    });
  }
}
