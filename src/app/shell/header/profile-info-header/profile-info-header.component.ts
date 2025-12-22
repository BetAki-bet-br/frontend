import { Dialog } from '@angular/cdk/dialog';
import {
  AfterViewInit,
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ViewChild,
  ChangeDetectionStrategy,
  ElementRef,
  inject,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatMenuTrigger, MatMenuModule } from '@angular/material/menu';
import { ActivatedRoute, Router } from '@angular/router';
import { DataStoreService } from '@app/@core';
import { Logger } from '@app/@shared';
import { AccountResolved, PromotionDetailsResolved } from '@app/@shared/models';
import { AuthenticationGuard, AuthenticationService } from '@app/auth';
import { PromotionsService } from '@app/promotions/promotions.service';
import { PlayerInfoDialogComponent } from '@app/shell/shell-player-profile/player-info-dialog/player-info-dialog.component';
import {
  ICoreAggregatedBonusStatusDtoEnum,
  Loyalty,
  OptedInEnum,
  PlayerDetails,
  PromotionDetails,
  PromotionStatusEnum,
  PromotionTypeDtoEnum,
} from '@icore/ngx-portalgateway-api-client-atl';
import { Subscription, map } from 'rxjs';
import { FirstDepositCheckService } from '@app/@shared/services/first-deposit-check.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { GoogleTagManagerImplementationService } from '@app/@shared/services/google-tag-manager-implementation.service';
import { PlayerStatusService } from '@app/@shared/services/player.status.service';
import { MatIcon } from '@angular/material/icon';
import { HeaderPromotionItemComponent } from '@app/@shared/components/header-promotion-dropdown/header-promotion-item/header-promotion-item.component';
import { CdnizePipe } from '@app/@pipes/cdnize.pipe';
import { DecimalPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

const log = new Logger('ProfileInfoHeaderComponent');

@Component({
  selector: 'app-profile-info-header',
  templateUrl: './profile-info-header.component.html',
  styleUrls: ['./profile-info-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatIcon,
    MatMenuModule,
    HeaderPromotionItemComponent,
    CdnizePipe,
    TranslateModule,
    DecimalPipe,
    MatProgressSpinner,
  ],
})
export class ProfileInfoHeaderComponent implements OnInit, OnDestroy, AfterViewInit {
  private authService = inject(AuthenticationService);
  private dialog = inject(Dialog);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  dataStoreService = inject(DataStoreService);
  private activatedRoute = inject(ActivatedRoute);
  private authGuard = inject(AuthenticationGuard);
  private promotionService = inject(PromotionsService);
  private cdr = inject(ChangeDetectorRef);
  private firstDepostiCheckService = inject(FirstDepositCheckService);
  private deviceService = inject(DeviceDetectorService);
  private googleTagManagerServiceImpl = inject(GoogleTagManagerImplementationService);
  private playerService = inject(PlayerStatusService);

  @ViewChild('dropdownRefProfileTrigger') dropdownRefProfileTrigger?: MatMenuTrigger;
  @ViewChild('dropdownRefNotificationsTrigger') dropdownRefNotificationsTrigger?: MatMenuTrigger;

  @Input() isProfile: boolean = false;
  @Input() balance: AccountResolved | null = null;
  @Input() loyaltyPoints: Loyalty | null = null;
  @Input() isDemoPlay: boolean | null = false;
  @Input() playerInfo: PlayerDetails | null = null;
  @ViewChild('fontIconsUser') profileIcon!: ElementRef;
  @ViewChild('fontIconsNotifications') notificationsIcon!: ElementRef;

  public notificationsData: PromotionDetailsResolved[] = [];
  private notificationSub = new Subscription();
  private profileFulfilledSub = new Subscription();
  private _showPromotions = false;

  balanceVisible = true;
  balanceUpdate = false;

  get showPromotions() {
    return this._showPromotions;
  }

  set showPromotions(value: boolean) {
    this._showPromotions = value;
  }

  balanceVisibilitySub = new Subscription();

  get notificationCount() {
    return this.notificationsData?.length ?? 0;
  }

  ngOnInit() {
    this.balanceVisible = this.dataStoreService.balanceVisible;

    this.notificationSub = this.promotionService
      .getPromotions(OptedInEnum.AllPromotions, true)
      .pipe(
        map((result) => {
          // Filter out expired and non-valid status promotions
          return result.filter((t) => !this.notEligibleForDisplay(t));
        }),
      )
      .subscribe((res) => {
        this.notificationsData = res;
        log.debug('notificationsData', this.notificationsData);
        this.cdr.markForCheck();
      });

    this.balanceVisibilitySub.add(
      this.dataStoreService.balanceVisibilityChange.subscribe((res) => {
        this.balanceVisible = this.dataStoreService.balanceVisible;
        this.cdr.detectChanges();
      }),
    );
  }

  ngOnDestroy(): void {
    this.notificationSub.unsubscribe();
    this.profileFulfilledSub.unsubscribe();
    this.balanceVisibilitySub.unsubscribe();
    document.removeEventListener('click', this.profileMenuClickListener);
    document.removeEventListener('click', this.notificationsMenuClickListener);
  }

  ngAfterViewInit(): void {
    this.dropdownRefProfileTrigger?.menuClosed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      document.removeEventListener('click', this.profileMenuClickListener);
      this.profileIcon?.nativeElement?.classList?.remove('active-link');
    });

    this.dropdownRefProfileTrigger?.menuOpened.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      document.addEventListener('click', this.profileMenuClickListener);
      this.profileIcon?.nativeElement?.classList?.add('active-link');
    });

    this.dropdownRefNotificationsTrigger?.menuClosed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      document.removeEventListener('click', this.notificationsMenuClickListener);
      this.notificationsIcon.nativeElement.classList.remove('active-link');
    });

    this.dropdownRefNotificationsTrigger?.menuOpened.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      document.addEventListener('click', this.notificationsMenuClickListener);
      this.notificationsIcon.nativeElement.classList.add('active-link');
    });
  }

  onDeposit(): void {
    // Push GTM event tag - Deposit button clicked
    this.googleTagManagerServiceImpl.pushGtmTag({ event: 'click_deposit_button' });
    //if (this.deviceService.isMobile())
    this.router.navigateByUrl('/profile/wallet/deposit');
    //else this.firstDepostiCheckService.preDepositCheck().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  onSignOut(): void {
    this.authService.logout().subscribe(async () => {
      log.debug('logout');
    });
  }

  getVipLevelPercent() {
    if (this.loyaltyPoints && this.loyaltyPoints.pointsNeededForNextVIPLevel && this.loyaltyPoints.vipPointsInPeriod) {
      return this.loyaltyPoints?.vipPointsInPeriod === 0
        ? 1
        : (this.loyaltyPoints?.vipPointsInPeriod / this.loyaltyPoints.pointsNeededForNextVIPLevel) * 100;
    } else {
      return 1;
    }
  }

  isActive(base: string) {
    return this.router.url.includes(`/${base}`);
  }

  openProfileMenu() {
    // open dialog
    const dialogRef = this.dialog.open(PlayerInfoDialogComponent, {
      width: '100%',
      height: '100%',
    });

    // on dialog closed
    dialogRef.closed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {});
  }

  // Checks whether the promotion is expired and its aggregated status is Available, Active, Success, Failed
  notEligibleForDisplay(promotion: PromotionDetails): boolean {
    if (
      promotion.iCoreAggregatedBonusStatus === ICoreAggregatedBonusStatusDtoEnum.Available ||
      promotion.iCoreAggregatedBonusStatus === ICoreAggregatedBonusStatusDtoEnum.Active ||
      promotion.iCoreAggregatedBonusStatus === ICoreAggregatedBonusStatusDtoEnum.Success ||
      promotion.iCoreAggregatedBonusStatus === ICoreAggregatedBonusStatusDtoEnum.Failed ||
      (promotion.promotionType === PromotionTypeDtoEnum.Custom &&
        promotion.promotionStatus === PromotionStatusEnum.OptedIn)
    )
      return true;

    const currentDate = new Date();
    if (promotion.bonusExpirationDate && new Date(promotion.bonusExpirationDate) <= currentDate) return true;
    if (promotion.promotionEndDate && new Date(promotion.promotionEndDate) <= currentDate) return true;

    return false;
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  updateBalance() {
    this.balanceUpdate = true;
    this.playerService.updatePlayerBalance().subscribe({
      complete: () => {
        this.balanceUpdate = false;
      },
      error: () => {
        this.balanceUpdate = false;
      },
    });
  }

  private profileMenuClickListener = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const isInside = this.findAncestor(target, 'header-dropdown-container');
    if (
      !isInside &&
      !target.classList.contains('mat-mdc-menu-trigger') &&
      !target.classList.contains('user-icon-dialog')
    ) {
      this.dropdownRefProfileTrigger?.closeMenu();
    }
  };

  private notificationsMenuClickListener = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const isInside = this.findAncestor(target, 'header-dropdown-container');
    if (
      !isInside &&
      !target.classList.contains('mat-mdc-menu-trigger') &&
      !target.classList.contains('push-notifications__icon') &&
      !target.classList.contains('notifications-icon-container')
      // Temporarily disabling this feature due to ICSPB-3098
      // && !target.classList.contains('notifications-number-container')
    ) {
      this.dropdownRefNotificationsTrigger?.closeMenu();
    }
  };

  private findAncestor = (element: HTMLElement, parentClass: string): boolean => {
    if (element.classList.contains(parentClass)) {
      return true;
    }

    if (element.parentElement) {
      return this.findAncestor(element.parentElement as HTMLElement, parentClass);
    }

    return false;
  };

  onLinkClick() {
    this.dropdownRefProfileTrigger?.closeMenu();
  }

  changeBalanceVisiblity() {
    this.dataStoreService.balanceVisible = !this.dataStoreService.balanceVisible;
  }
}
