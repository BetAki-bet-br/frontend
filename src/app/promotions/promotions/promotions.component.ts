import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Logger } from '@app/@shared/logger.service';
import { CredentialsService } from '@app/auth';
import { PromotionsService } from '../promotions.service';
import {
  DeclinePlayerBonusContextRequest,
  ICoreAggregatedBonusStatusDtoEnum,
  OptedInEnum,
  PlayerBonusHistory,
} from '@icore/ngx-portalgateway-api-client-atl';
import {
  PromotionActionDialogComponent,
  PromotionActionDialogData,
} from './promotion-action-dialog/promotion-action-dialog.component';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { Router } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import {
  PromotionConfirmationDialogComponent,
  PromotionConfirmationDialogData,
  PromotionConfirmationDialogResult,
} from './promotion-confirmation-dialog/promotion-confirmation-dialog.component';
import { Observable, Subject, map, merge, switchMap, tap } from 'rxjs';
import { AuthDialogService } from '@app/auth/auth-dialog.service';
import { CustomContentType, PromotionDetailsResolved } from '@app/@shared/models';
import { Title } from '@angular/platform-browser';
import { TemplateService } from '@app/@shared/services/template.service';
import { GoogleTagManagerImplementationService } from '@app/@shared/services/google-tag-manager-implementation.service';
import { ActionIdEnum } from '@app/@shared/models/template.model';
import { BreakpointObserver } from '@angular/cdk/layout';
import { AppBreakpoints } from '@app/@shared';
import { CmsService } from '@app/@shared/services/cms.service';
import { HelpPagesLoaderComponent } from '@app/help/help-pages/help-pages-loader/help-pages-loader.component';
import { BonusesService } from '@app/@shared/services/bonuses.service';
import { MainBannerComponent } from '@app/@shared/components/main-banner/main-banner.component';
import { WinnersSectionComponent } from '@app/@shared/components/winners-section/winners-section.component';
import { WelcomeMessageComponent } from '@app/@shared/components/welcome-message/welcome-message.component';
import { AsyncPipe } from '@angular/common';

const log = new Logger('PromotionsComponent');

export type ActionType = 'OptIn' | 'OptOut' | 'Decline' | 'OptOutAndDecline' | 'Skip';

@Component({
  selector: 'app-promotions',
  templateUrl: './promotions.component.html',
  styleUrls: ['./promotions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MainBannerComponent, AsyncPipe, WinnersSectionComponent, WelcomeMessageComponent],
})
export class PromotionsComponent implements OnInit {
  private promotionsService = inject(PromotionsService);
  private bonusesService = inject(BonusesService);
  private destroyRef = inject(DestroyRef);
  credentialsService = inject(CredentialsService);
  private dialog = inject(Dialog);
  private router = inject(Router);
  private authDialogService = inject(AuthDialogService);
  private cdr = inject(ChangeDetectorRef);
  private titleService = inject(Title);
  private templateService = inject(TemplateService);
  private googleTagManagerServiceImpl = inject(GoogleTagManagerImplementationService);
  private breakpointObserver = inject(BreakpointObserver);
  private bonusTCOverlay = inject(Dialog);
  private cmsService = inject(CmsService);

  /** Used to manually trigger reloading of all the data observables  */
  private manualReloadTriggerSubject = new Subject<any>();

  /** Combined manual and isAuthenticated observable. Used to trigger reloads */
  private reloadTrigger$: Observable<any> = merge(
    this.manualReloadTriggerSubject,
    this.credentialsService.isAuthenticated$
  );

  promotionBannerBonus$ = this.reloadTrigger$.pipe(switchMap((_) => this.cmsService.getPromotionsBanners()));
  promotions$ = this.reloadTrigger$.pipe(
    tap(() => {
      this.bonusList = this.getDefaultPromotions();
    }),
    switchMap((_) => {
      return this.promotionsService.getPromotions(OptedInEnum.AllPromotions).pipe(
        map((promotions) => {
          // Filter out expired and non-valid status promotions
          return (promotions ?? []).filter((t) => !this.notEligibleForDisplay(t));
        })
      );
    })
  );

  bonusHistory: PlayerBonusHistory[] = [];

  readMoreHidden = true;
  defaultPromotionCount = 3;
  bonusList: PromotionDetailsResolved[] = [];

  ngOnInit(): void {
    this.bonusList = this.getDefaultPromotions();
    this.promotions$
      .pipe(
        map((promotions) => {
          this.bonusList = promotions;
          log.debug('bonusList', promotions);
          this.cdr.markForCheck();
        }),
        switchMap(() => {
          return this.templateService.templateActionSub$;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((templateAction) => {
        if (templateAction) {
          const promotionId = templateAction?.data?.promotionId;
          if (templateAction?.actionId === ActionIdEnum.PromotionDeposit) {
            this.promotionDepositClick();
          }
          if (templateAction?.actionId === ActionIdEnum.OpenTermsAndConditions) {
            this.openTermsAndConditions();
          } else if (
            templateAction?.actionId === ActionIdEnum.OptInPromotion &&
            promotionId &&
            templateAction?.data?.source === 'promotionsPage'
          ) {
            this.bonusClick(
              'OptIn',
              this.bonusList.find((value) => value.promotionId === promotionId)
            );
          } else if (templateAction?.actionId === ActionIdEnum.OptOutAndDeclinePromotion && promotionId) {
            this.bonusClick(
              'OptOutAndDecline',
              this.bonusList.find((value) => value.promotionId === promotionId)
            );
          }
        }
      });

    this.reloadTrigger$
      .pipe(
        switchMap((_) => {
          return this.bonusesService.getBonuses();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
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

    this.promotionBannerBonus$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
      const isMobile = this.breakpointObserver.isMatched(AppBreakpoints.LtSmall2);
      const records = isMobile ? res.currentBannersSmall : res.currentBannersLarge;
      /*
      this.updateRouteData(
        'Welcome ' +
          (res && records && records.length > 0 ? records[0]?.title?.toLowerCase() : '') +
          ' || Comtrade Gaming'
      );
      */
    });
  }

  openTermsAndConditions() {
    this.bonusTCOverlay.open(HelpPagesLoaderComponent, {
      data: {
        staticHtmlPath: '', //staticFilePaths.BonusTermsAndConditions,
        customClassName: 'bonus-terms-and-conditions',
      },
    });
  }

  promotionDepositClick() {
    if (!this.credentialsService.isAuthenticated()) {
      this.router.navigate(['/register']);
    } else {
      // Push GTM event tag - Deposit button clicked
      this.googleTagManagerServiceImpl.pushGtmTag({ event: 'click_deposit_button' });
      //if (this.deviceService.isMobile())
      this.router.navigateByUrl('/profile/wallet/deposit');
      //else this.firstDepostiCheckService.preDepositCheck().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    }
  }

  getCustomContent(bonus: PromotionDetailsResolved, type: CustomContentType): string | null {
    return bonus?.customContentList?.find((value) => value.type?.trim() === type.trim())?.content ?? null;
  }

  bonusClick(type: ActionType, promotion?: PromotionDetailsResolved) {
    if (!promotion) {
      return;
    }
    // If the player is not logged, the just open the register form
    if (!this.credentialsService.isAuthenticated()) {
      this.router.navigate(['/register']);
    }

    let loadingDialogRef: DialogRef<PromotionActionDialogComponent, unknown> | null = null;

    let confirmationDialogRef: DialogRef<PromotionConfirmationDialogResult, PromotionConfirmationDialogComponent>;

    switch (type) {
      case 'OptOut':
      case 'OptOutAndDecline':
      case 'Decline':
        // open confirmation dialog
        confirmationDialogRef = this.openConfirmationDialog(type, promotion);

        // on confirmation dialog closed
        confirmationDialogRef.closed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
          if (result?.success == true) {
            // open loading dialog
            loadingDialogRef = this.openLoadingDialog(type, promotion);
            // open dialog
            this.openDialog(type, promotion, loadingDialogRef);
          }
        });
        break;
      case 'OptIn':
        // open loading dialog
        loadingDialogRef = this.openLoadingDialog(type, promotion);
        // open dialog
        this.openDialog(type, promotion, loadingDialogRef);
        break;

      default:
        break;
    }
  }

  depositClick(): void {
    if (this.credentialsService.isAuthenticated()) {
      this.router.navigate(['/profile/wallet/deposit']);
    } else {
      this.router.navigate(['/sign-in']);
    }
  }

  private getDefaultPromotions() {
    const defaultPromotionList: PromotionDetailsResolved[] = [];
    for (let i = 0; i < this.defaultPromotionCount; i++) {
      defaultPromotionList.push({} as PromotionDetailsResolved);
    }
    return defaultPromotionList;
  }

  private openConfirmationDialog(type: ActionType, bonus: PromotionDetailsResolved) {
    let description = '';
    if (type === 'OptOut') {
      description = marker(
        'Are you sure your want to opt out? By opting out you shall not be eligible to claim this promotion in the future.'
      );
    } else if (type === 'Decline') {
      description = marker(
        'Are you sure your want to decline? By declining you shall not be eligible to claim this promotion in the future.'
      );
    } else if (type === 'OptOutAndDecline') {
      description = marker(
        'Are you sure your want to opt out? By opting out you shall not be eligible to claim this promotion in the future and the related active bonus shall be declined.'
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
    } else if (type === 'OptOut' || type === 'OptOutAndDecline') {
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
    promotion: PromotionDetailsResolved,
    loadingDialogRef: DialogRef<PromotionActionDialogComponent, unknown> | null
  ) {
    let bonusAction$ = null;
    let description = '';
    let descriptionError = '';

    if (type === 'OptIn') {
      bonusAction$ = this.bonusesService.bonusOptIn({
        optInCode: promotion?.optInCode ?? '',
        promotionId: promotion.promotionId,
      });
      description = marker(
        'You have successfully opt in to this promotion. See bonus history to check your active promotions.'
      );
      descriptionError = marker(
        'Something went wrong while processing your opt in. Please try again or contact our support.'
      );
    } else if (type === 'OptOut' || type === 'OptOutAndDecline') {
      bonusAction$ = this.bonusesService.bonusOptOut({
        couponEventId: promotion?.couponEventId ?? 0,
        declineAllRelatedBonuses: type === 'OptOutAndDecline',
        promotionId: promotion.promotionId ?? 0,
      });

      description =
        type === 'OptOut'
          ? marker(
              'You have successfully opted out to this promotion. See bonus history to check your active promotions.'
            )
          : marker(
              'You have successfully opted out to this promotion and bonuses. See bonus history to check your active promotions.'
            );
      descriptionError = marker(
        'Something went wrong while processing your opt out. Please try again or contact our support.'
      );
    } else if (type === 'Decline') {
      const playerBonusId =
        this.bonusHistory.find((value) => value.promotionId === promotion.promotionId)?.playerBonusId ?? 0;

      const request: DeclinePlayerBonusContextRequest = {
        playerBonusContextId: playerBonusId,
      };

      bonusAction$ = this.bonusesService.declineBonus(request);
      description = marker(
        'You have successfully declined this promotion. See bonus history to check your active promotions.'
      );
      descriptionError = marker(
        'Something went wrong while processing your decline. Please try again or contact our support.'
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
              subtitle: this.getCustomContent(promotion, CustomContentType.Promotion_Type) ?? '',
              description,
              isLoading: false,
            },
          }
        );

        // on dialog closed
        dialogRef.closed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
          if (type === 'OptIn') this.router.navigate(['profile/wallet/deposit']);
          else this.manualReloadTriggerSubject.next('reload');
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
              subtitle: this.getCustomContent(promotion, CustomContentType.Promotion_Type) ?? '',
              description: descriptionError,
              isLoading: false,
              error: true,
            },
          }
        );

        // on dialog closed
        dialogRef.closed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
          this.manualReloadTriggerSubject.next('reload');
        });
      },
      complete: () => {
        log.debug('bonusAction completed');
      },
    });
  }

  // Checks whether the promotion is expired and its aggregated status is Failed or Success
  notEligibleForDisplay(promotion: PromotionDetailsResolved): boolean {
    if (
      promotion.iCoreAggregatedBonusStatus === ICoreAggregatedBonusStatusDtoEnum.Failed ||
      promotion.iCoreAggregatedBonusStatus === ICoreAggregatedBonusStatusDtoEnum.Success
    )
      return true;

    const currentDate = new Date();
    if (promotion.bonusExpirationDate && new Date(promotion.bonusExpirationDate) <= currentDate) return true;
    if (promotion.promotionEndDate && new Date(promotion.promotionEndDate) <= currentDate) return true;

    return false;
  }

  private updateRouteData(title: string) {
    this.titleService.setTitle(title);
  }
}
