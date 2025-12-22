import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, DestroyRef, Input, OnInit, inject } from '@angular/core';
import {
  HeaderPromotionDialogComponent,
  HeaderPromotionDialogData,
  HeaderPromotionDialogResult,
} from '../header-promotion-dialog/header-promotion-dialog.component';
import { DeclinePlayerBonusContextRequest, PlayerBonusHistory } from '@icore/ngx-portalgateway-api-client-atl';
import { Router } from '@angular/router';
import { ActionType } from '@app/promotions/promotions.models';
import {
  PromotionActionDialogComponent,
  PromotionActionDialogData,
} from '@app/promotions/promotions/promotion-action-dialog/promotion-action-dialog.component';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import {
  PromotionConfirmationDialogComponent,
  PromotionConfirmationDialogData,
  PromotionConfirmationDialogResult,
} from '@app/promotions/promotions/promotion-confirmation-dialog/promotion-confirmation-dialog.component';
import { Logger } from '@app/@shared/logger.service';
import { CustomContentType, PromotionDetailsResolved } from '@app/@shared/models';
import { TemplateService } from '@app/@shared/services/template.service';
import { ActionIdEnum } from '@app/@shared/models/template.model';
import { DeviceDetectorService } from 'ngx-device-detector';
import { BonusesService } from '@app/@shared/services/bonuses.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

const log = new Logger('HeaderPromotionItemComponent');

@Component({
  selector: 'app-header-promotion-item',
  templateUrl: './header-promotion-item.component.html',
  styleUrls: ['./header-promotion-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderPromotionItemComponent implements OnInit {
  private dialog = inject(Dialog);
  private router = inject(Router);
  private templateService = inject(TemplateService);
  private deviceService = inject(DeviceDetectorService);
  private bonusesService = inject(BonusesService);
  private destroyRef = inject(DestroyRef);
  @Input() promotions: PromotionDetailsResolved[] = [];

  private bonusHistory: PlayerBonusHistory[] = [];
  private isMobile: boolean = this.deviceService.isMobile() || this.deviceService.isTablet();

  ngOnInit(): void {
    this.bonusesService
      .getBonuses()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.bonusHistory = response?.playerBonusHistory ?? [];
        },
        error: (err) => {
          log.debug('getBonuses error:', err);
        },
        complete: () => {
          log.debug('getBonuses completed');
        },
      });

    this.templateService.templateActionSub$?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      const promotionId = response?.data?.promotionId;
      if (response?.actionId === ActionIdEnum.PromotionShowMore && promotionId) {
        this.onPromotionClick(promotionId);
      }
    });
  }

  onPromotionClick(id: number): void {
    const dialogRef = this.dialog.open<
      HeaderPromotionDialogResult,
      HeaderPromotionDialogData,
      HeaderPromotionDialogComponent
    >(HeaderPromotionDialogComponent, {
      data: { promotion: this.promotions.find((value) => value.promotionId == id) },
    });
    // on dialog closed
    dialogRef.closed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
      log.debug('promotion closed', result);

      if (result && result?.promotion) {
        this.bonusAction(result.type, result.promotion);
      }
    });
  }

  // Emulates click on selected promotion item's 'Show More' button in order to preserve dispatchEvent' payload (url, promotionId, source)
  onPromotionClickMobile(event: MouseEvent) {
    const promotionItemElement = event.currentTarget as HTMLElement;
    const button = promotionItemElement.querySelector('.show-more-button');

    this.isMobile && button ? (button as HTMLButtonElement).click() : null;
  }

  private bonusAction(type: ActionType, promotion: PromotionDetailsResolved) {
    let loadingDialogRef: DialogRef<PromotionActionDialogComponent, unknown> | null = null;

    if (type === 'OptOut' || type === 'Decline') {
      // open confirmation dialog
      const confirmationDialogRef = this.openConfirmationDialog(type, promotion);

      // on confirmation dialog closed
      confirmationDialogRef.closed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
        if (result?.success == true) {
          // open loading dialog
          loadingDialogRef = this.openLoadingDialog(type, promotion);
          // open dialog
          this.openDialog(type, promotion, loadingDialogRef);
        }
      });
    } else {
      // open loading dialog
      loadingDialogRef = this.openLoadingDialog(type, promotion);
      // open dialog
      this.openDialog(type, promotion, loadingDialogRef);
    }
  }

  private openConfirmationDialog(type: ActionType, bonus: PromotionDetailsResolved) {
    let description = '';
    if (type === 'OptOut') {
      description = marker(
        'Are you sure your want to opt out? By opting out you shall not be eligible to claim this promotion in the future.',
      );
    } else if (type === 'Decline') {
      description = marker(
        'Are you sure your want to decline? By declining you shall not be eligible to claim this promotion in the future.',
      );
    }

    // open confirmation dialog
    return this.dialog.open<
      PromotionConfirmationDialogResult,
      PromotionConfirmationDialogData,
      PromotionConfirmationDialogComponent
    >(PromotionConfirmationDialogComponent, {
      data: {
        type,
        subtitle: bonus?.promotionType,
        description,
      },
    });
  }

  private openLoadingDialog(type: ActionType, bonus: PromotionDetailsResolved) {
    let description = '';
    if (type === 'OptIn') {
      description = marker('Processing your opt in. This may take a moment.');
    } else if (type === 'OptOut') {
      description = marker('Processing your opt out. This may take a moment.');
    } else if (type === 'Decline') {
      description = marker('Processing your decline. This may take a moment.');
    }

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

  private openDialog(
    type: ActionType,
    bonus: PromotionDetailsResolved,
    loadingDialogRef: DialogRef<PromotionActionDialogComponent, unknown> | null,
  ) {
    let bonusAction$ = null;
    let description = '';
    let descriptionError = '';
    if (type === 'OptIn') {
      bonusAction$ = this.bonusesService.bonusOptIn({
        optInCode: bonus?.optInCode ?? '',
        promotionId: bonus.promotionId,
      });
      description = marker(
        'You have successfully opt in to this promotion. See bonus history to check your active promotions.',
      );
      descriptionError = marker(
        'Something went wrong while processing your opt in. Please try again or contact our support.',
      );
    } else if (type === 'OptOut') {
      bonusAction$ = this.bonusesService.bonusOptOut({
        couponEventId: bonus?.couponEventId ?? 0,
        declineAllRelatedBonuses: false,
        promotionId: bonus.promotionId ?? 0,
      });
      description = marker(
        'You have successfully opt out to this promotion. See bonus history to check your active promotions.',
      );
      descriptionError = marker(
        'Something went wrong while processing your opt out. Please try again or contact our support.',
      );
    } else if (type === 'Decline') {
      const playerBonusId =
        this.bonusHistory.find((value) => value.promotionId === bonus.promotionId)?.playerBonusId ?? 0;

      const request: DeclinePlayerBonusContextRequest = {
        playerBonusContextId: playerBonusId,
      };

      bonusAction$ = this.bonusesService.declineBonus(request);
      description = marker(
        'You have successfully declined this promotion. See bonus history to check your active promotions.',
      );
      descriptionError = marker(
        'Something went wrong while processing your decline. Please try again or contact our support.',
      );
    }

    bonusAction$?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        log.debug('bonusAction reponse:', response);

        // close loading dialog
        loadingDialogRef?.close();

        // open dialog
        const dialogRef = this.dialog.open<PromotionActionDialogComponent, PromotionActionDialogData>(
          PromotionActionDialogComponent,
          {
            data: {
              type,
              subtitle: bonus?.promotionType,
              description,
              isLoading: false,
            },
          },
        );

        // on dialog closed
        dialogRef.closed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
          if (type === 'OptIn') {
            const extGameIdContent = this.getCustomContent(bonus, CustomContentType.ExtGameId);
            if (extGameIdContent) this.router.navigate(['/game', extGameIdContent]);
            else this.router.navigate(['profile/wallet/deposit']);
          } else {
            this.router.navigate(['profile/wallet/deposit']);
          }
        });
      },
      error: (err) => {
        log.debug('bonusAction error:', err);

        // close loading dialog
        loadingDialogRef?.close();

        // open dialog
        const dialogRef = this.dialog.open<PromotionActionDialogComponent, PromotionActionDialogData>(
          PromotionActionDialogComponent,
          {
            data: {
              type,
              subtitle: bonus?.promotionType,
              description: descriptionError,
              isLoading: false,
              error: true,
            },
          },
        );

        // on dialog closed
        dialogRef.closed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
          this.router.navigate(['profile/wallet/deposit']);
        });
      },
      complete: () => {
        log.debug('bonusAction completed');
      },
    });
  }

  private getCustomContent(bonus: PromotionDetailsResolved | undefined, type: CustomContentType): string | null {
    return bonus?.customContentList?.find((value) => value.type?.trim() === type.trim())?.content ?? null;
  }
}
