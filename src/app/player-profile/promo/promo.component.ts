import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
  DestroyRef,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTabChangeEvent, MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SnackbarService } from '@app/@core/snackbar.service';
import { Logger } from '@app/@shared';
import {
  Breadcrumbs,
  PageBreadcrumbsComponent,
} from '@app/@shared/components/page-breadcrumbs/page-breadcrumbs.component';
import { PlayerBonusDataResolved, PlayerBonusResolved } from '@app/@shared/models';
import { BonusesService } from '@app/@shared/services/bonuses.service';
import { BonusProductTypeSummary } from '@icore/ngx-portalgateway-api-client-atl';
import { BehaviorSubject, map, Observable, switchMap } from 'rxjs';
import { TemplateService } from '@app/@shared/services/template.service';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { ActionIdEnum } from '@app/@shared/models/template.model';
import { Banner } from '@app/@shared/models';
import {
  BonusOptInResultDialogComponent,
  BonusOptInResultEnum,
} from './bonus-opt-in-result-dialog/bonus-opt-in-result-dialog.component';
import { CmsService } from '@app/@shared/services/cms.service';
import { PlayerStatusService } from '@app/@shared/services/player.status.service';
import { DataStoreService } from '@app/@core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslateModule } from '@ngx-translate/core';
import { BonusOfferingComponent } from './bonus-offering/bonus-offering.component';
import { BonusOngoingComponent } from './bonus-ongoing/bonus-ongoing.component';
import { BonusActiveComponent } from './bonus-active/bonus-active.component';
import { BonusHistoryComponent } from './bonus-history/bonus-history.component';
import { MatTabScrollToCenterDirective } from '@app/@shared/directives/mat-tab-scroll-to-center.directive';

const log = new Logger('PromoComponent');

@Component({
  selector: 'app-promo',
  templateUrl: './promo.component.html',
  styleUrls: ['./promo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    TranslateModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    PageBreadcrumbsComponent,
    BonusOfferingComponent,
    BonusOngoingComponent,
    BonusActiveComponent,
    BonusHistoryComponent,
    DecimalPipe,
    DialogModule,
    MatTabScrollToCenterDirective,
  ],
})
export class PromoComponent implements OnInit {
  toastService = inject(SnackbarService);
  private bonusesService = inject(BonusesService);
  private cdr = inject(ChangeDetectorRef);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private templateService = inject(TemplateService);
  private dialog = inject(Dialog);
  private cmsService = inject(CmsService);
  private playerService = inject(PlayerStatusService);
  private destroyRef = inject(DestroyRef);
  dataStoreService = inject(DataStoreService);

  readonly tabGroup = viewChild(MatTabGroup);

  selectedIndex = 0;

  bannerOfferList: Banner[] | undefined;
  bonusOfferList: PlayerBonusResolved[] = [];
  bonusOngoingList: PlayerBonusResolved[] = [];
  bonusActiveList: PlayerBonusResolved[] = [];
  bonusSummaryPerProductType: BonusProductTypeSummary[] = [];

  casinoBonusBalanceAmount: number = 0;
  sportsbookBonusBalanceAmount: number = 0;
  currencySymbol: string | undefined;

  private refreshBonuses$ = new BehaviorSubject<void>(undefined);
  bonuses$: Observable<PlayerBonusDataResolved> = this.refreshBonuses$.pipe(
    switchMap(() => this.bonusesService.getBonusesData()),
  );

  bannerPromotions$ = this.cmsService.getBannersForPromotions();

  breadcrumbs: Breadcrumbs[] = [
    {
      svgIcon: 'essentials-home',
      url: '/',
    },
    {
      text: 'My account',
      url: '/profile',
    },
    {
      text: 'Promotions and bonuses',
    },
  ];

  ngOnInit(): void {
    this.playerService.balanceSub$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((balance) => {
      this.casinoBonusBalanceAmount = balance?.bonusCasinoBalance ?? 0;
      this.sportsbookBonusBalanceAmount = balance?.bonusSportsbookBalance ?? 0;

      this.currencySymbol = this.dataStoreService.getCurrencySymbol(
        this.dataStoreService.defaultLanguage,
        balance?.currency ?? '',
      );
    });

    this.activatedRoute.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const index = +params['tabIndex'];
      if (!isNaN(index)) {
        this.selectedIndex = index;
        this.cdr.markForCheck();
      }
    });

    this.bonuses$
      .pipe(
        map((bonuses) => {
          this.bonusOfferList = bonuses.playerBonusHistoryResolved.filter((item) => item.templateOffersHtml);
          this.bonusOngoingList = bonuses.playerBonusHistoryResolved.filter((item) => item.templateOngoingHtml);
          this.bonusActiveList = bonuses.playerBonusHistoryResolved.filter((item) => item.templateActiveHtml);
          this.cdr.markForCheck();
        }),
        switchMap(() => {
          return this.templateService.templateActionSub$;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((templateAction) => {
        if (templateAction) {
          if (templateAction?.actionId === ActionIdEnum.OptInPromotion) {
            this.bonusOptIn(templateAction.data?.bonusId);
          }
        }
      });

    this.bannerPromotions$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
      this.bannerOfferList = res.currentBannersLarge;

      this.cdr.markForCheck();
    });
  }

  bonusOptIn(playerBonusId: number | undefined) {
    if (playerBonusId) {
      let bonusAction$ = null;
      bonusAction$ = this.bonusesService.bonusOptInToBonus({
        playerBonusId: playerBonusId,
      });

      bonusAction$?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (response) => {
          log.debug('bonusAction reponse:', response);

          // open dialog
          const dialogRef = this.dialog.open<BonusOptInResultDialogComponent, BonusOptInResultEnum>(
            BonusOptInResultDialogComponent,
            {
              data: BonusOptInResultEnum.Success,
              disableClose: true,
            },
          );

          // on dialog closed
          dialogRef.closed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
            this.refreshBonuses$.next();
            // navigate to Offering tab
            this.router.navigate(['/profile/promo/ongoing']);
          });
        },
        error: (err) => {
          log.debug('bonusAction error:', err);

          // open dialog
          const dialogRef = this.dialog.open<BonusOptInResultDialogComponent, BonusOptInResultEnum>(
            BonusOptInResultDialogComponent,
            {
              data: BonusOptInResultEnum.Error,
              disableClose: true,
            },
          );

          // on dialog closed
          dialogRef.closed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
            this.refreshBonuses$.next();
          });
        },
        complete: () => {
          log.debug('bonusAction completed');
        },
      });
    }
  }

  onTabChange(event: MatTabChangeEvent): void {
    switch (event.index) {
      case 0:
        this.router.navigate(['profile/promo/offers']);
        break;
      case 1:
        this.router.navigate(['profile/promo/ongoing']);
        break;
      case 2:
        this.router.navigate(['profile/promo/active']);
        break;
      case 3:
        this.router.navigate(['profile/promo/history']);
        break;
      default:
        break;
    }
  }
}
