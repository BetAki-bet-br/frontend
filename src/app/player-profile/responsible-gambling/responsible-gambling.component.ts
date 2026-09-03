import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DataStoreService } from '@app/@core';
import { ConfigurationService } from '@app/@core/configuration.service';
import { Logger } from '@app/@shared';
import {
  Breadcrumbs,
  PageBreadcrumbsComponent,
} from '@app/@shared/components/page-breadcrumbs/page-breadcrumbs.component';
import { PlayerLimit, TimePeriod } from '@app/@shared/models';
import { AccountVerificationActionEnum, AuthDialogService, FaceAuthParams } from '@app/auth/auth-dialog.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { LimitTypeEnum, PlayerDetails, TimeTypeEnum } from '@icore/ngx-portalgateway-api-client-atl';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';
import { forkJoin, of, Subscription, switchMap } from 'rxjs';
import { PlayerProfileService } from '../player-profile.service';
import { SnackbarService } from '@app/@core/snackbar.service';
import { MatTabGroup, MatTab, MatTabsModule } from '@angular/material/tabs';
import { ResponsibleLimitsComponent } from './responsible-limits/responsible-limits.component';
import { ResponsibleLimitDurationComponent } from './responsible-limit-duration/responsible-limit-duration.component';
import { MatInputModule } from '@angular/material/input';

const log = new Logger('ResponsibleGamblingComponent');

@Component({
  selector: 'app-responsible-gambling',
  templateUrl: './responsible-gambling.component.html',
  styleUrls: ['./responsible-gambling.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatTabsModule,
    MatInputModule,
    PageBreadcrumbsComponent,
    ResponsibleLimitsComponent,
    ReactiveFormsModule,
    ResponsibleLimitDurationComponent,
    TranslateModule,
  ],
})
export class ResponsibleGamblingComponent implements OnInit, OnDestroy {
  private playerProfileService = inject(PlayerProfileService);
  private configurationService = inject(ConfigurationService);
  private cdr = inject(ChangeDetectorRef);
  private translateService = inject(TranslateService);
  private _change = inject(ChangeDetectorRef);
  private authDialogService = inject(AuthDialogService);
  private snackbarService = inject(SnackbarService);
  private destroyRef = inject(DestroyRef);

  currentRoute: 'Responsible gambling' | null = null;

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
      text: 'Player protection',
    },
  ];

  limits: PlayerLimit[] = [];

  limitTypeEnum = LimitTypeEnum;

  playerInfo: PlayerDetails | null = null;

  depositLimits: PlayerLimit[] = [];
  lossLimits: PlayerLimit[] = [];
  wagerLimits: PlayerLimit[] = [];
  sessionLimits: PlayerLimit[] = [];

  sessionLimit: PlayerLimit = {
    amountValue: undefined,
    amountLeft: undefined,
    amountRatio: undefined,
    id: undefined,
    limitStatus: undefined,
    limitType: LimitTypeEnum.SiteSessionDuration,
    time: TimeTypeEnum.Hour,
  };

  coolingOffLimit: PlayerLimit = {
    amountValue: undefined,
    amountLeft: undefined,
    amountRatio: undefined,
    id: undefined,
    limitStatus: undefined,
    limitType: LimitTypeEnum.SiteSessionDuration,
    time: TimeTypeEnum.GameSession,
  };

  selfExcludeLimit: PlayerLimit = {
    amountValue: undefined,
    amountLeft: undefined,
    amountRatio: undefined,
    id: undefined,
    limitStatus: undefined,
    limitType: LimitTypeEnum.SiteSessionDuration,
    time: TimeTypeEnum.GameSession,
  };

  realityCheckLimit: PlayerLimit = {
    amountValue: undefined,
    amountLeft: undefined,
    amountRatio: undefined,
    id: undefined,
    limitStatus: undefined,
    limitType: LimitTypeEnum.SiteSessionDuration,
    time: TimeTypeEnum.GameSession,
  };

  form = new FormGroup({
    advancedModeEnabled: new FormControl(false),
    limit: new FormControl<Number>(0),
  });

  /**
   * lists generated in constructor, format
   * [
   *    {
   *      label: '1 day',
   *      value: '1',
   *    },
   *    ...
   * ]
   */
  coolingOffPeriods: TimePeriod[] = [];
  selfExclusionPeriods: TimePeriod[] = [];

  realityCheckPeriods: TimePeriod[] = [
    {
      label: '15 min',
      value: '15min',
    },
    {
      label: '30 min',
      value: '30min',
    },
    {
      label: '45 min',
      value: '45min',
    },
    {
      label: '60 min',
      value: '60min',
    },
  ];

  isDataLoading = false;

  private langChangeSubscription!: Subscription;

  constructor() {
    // Warning: this subscription will always be alive for the app's lifetime
    this.langChangeSubscription = this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.createCoolingOffPeriodsList();
      this.createSelfExclusionPeriodsList();
    });

    this.createCoolingOffPeriodsList();
    this.createSelfExclusionPeriodsList();
  }

  destroy() {
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {}

  get advancedModeEnabled() {
    return this.form.get('advancedModeEnabled')?.value;
  }

  loadData() {
    this.isDataLoading = true;

    forkJoin({
      playerLimits: this.playerProfileService.getPlayerLimits(),
      playerDetails: this.configurationService.getPlayerInfo(),
    }).subscribe({
      next: (data) => {
        this.limits = data.playerLimits;
        this.playerInfo = data.playerDetails;
        this.depositLimits = this.getLimits(this.limits, LimitTypeEnum.Deposit);
        this.lossLimits = this.getLimits(this.limits, LimitTypeEnum.TotalLost);
        this.wagerLimits = this.getLimits(this.limits, LimitTypeEnum.TotalWager);
        this.sessionLimits = this.getLimits(this.limits, LimitTypeEnum.SiteSessionDuration);
        // split remaining amount to hours and minutes
        this.sessionLimits.forEach((limit) => {
          if (limit.amountLeft) {
            const hours = Math.trunc(limit.amountLeft);
            const float_part = limit.amountLeft - hours;
            let minutes = 0;
            if (float_part > 0) {
              minutes = Math.round(float_part * 60);
            }

            limit.amountLeftHours = hours;
            limit.amountLeftMinutes = minutes;

            limit.amountLeft = Math.round(limit.amountLeft * 100) / 100;
          }
        });

        if (this.sessionLimits.length > 0) {
          this.sessionLimit = this.sessionLimits[0];
        }

        this.cdr.markForCheck();
      },
      complete: () => {
        this.isDataLoading = false;
      },
      error: () => {
        this.isDataLoading = false;
      },
    });
  }

  getLimits(list: PlayerLimit[], limitType: LimitTypeEnum, time?: TimeTypeEnum): PlayerLimit[] {
    let result: PlayerLimit[] = list.filter((element) => {
      if (
        element.limitType === limitType &&
        (time === undefined || element.time === undefined || element.time === time)
      ) {
        return true;
      }
      return false;
    });

    return result ?? [];
  }

  updateSessionDuration(limit: PlayerLimit) {
    this.isDataLoading = true;

    this.playerProfileService.setPlayerLimit(limit).subscribe({
      next: () => {
        this.loadData();
      },
      complete: () => {
        this.isDataLoading = false;
      },
      error: () => {
        this.isDataLoading = false;
      },
    });
  }

  deleteSessionDuration(limitId: number) {
    this.isDataLoading = true;

    this.playerProfileService.deletePlayerLimit(limitId).subscribe({
      next: () => {
        this.loadData();
      },
      complete: () => {
        this.isDataLoading = false;
      },
      error: () => {
        this.isDataLoading = false;
      },
    });
  }

  setSelfExclusion(limit: PlayerLimit) {
    log.debug('setSelfExclusion() invoked with limit: ', limit);
    this.isDataLoading = true;

    const today = new Date();
    const newDate = this.addMonths(today, limit.amountValue ?? 0).toISOString();

    this.playerProfileService
      .playerSelfExclusion(newDate)
      .pipe(
        switchMap((response) => {
          if (response?.referenceId) {
            const faceAuthParams: FaceAuthParams = {
              providerId: response.referenceId,
              faceAuthUrl: response?.url ?? undefined,
              faceAuthUrlQR: response?.quickResponseCodeUrl ?? undefined,
            };
            return this.authDialogService.initAccountVerificationWithParams(
              AccountVerificationActionEnum.Account,
              faceAuthParams,
            );
          }

          return of(null);
        }),
      )
      .subscribe({
        next: (result) => {
          if (result?.success) {
            this.snackbarService.openCustomSuccess(
              this.translateService.instant('Self-exclusion completed successfully.'),
              'center',
              'top',
              4000,
            );
            this.loadData();
          }
        },
        complete: () => {
          this.isDataLoading = false;
        },
        error: () => {
          this.snackbarService.openCustomError(
            this.translateService.instant('Error setting limit'),
            'center',
            'top',
            4000,
          );
          this.isDataLoading = false;
        },
      });
  }

  setTimeoutLimit(limit: PlayerLimit) {
    log.debug('setTimeoutLimit() invoked with limit: ', limit);
    this.isDataLoading = true;

    const today = new Date();
    const newDate = this.addDays(today, limit.amountValue ?? 0).toISOString();

    this.playerProfileService
      .playerSetTimeout(newDate)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.snackbarService.openCustomSuccess(
            this.translateService.instant('Pause successfully activated.'),
            'center',
            'top',
            4000,
          );
          this.loadData();
        },
        error: () => {
          this.snackbarService.openCustomError(
            this.translateService.instant('Error setting limit'),
            'center',
            'top',
            4000,
          );
          this.isDataLoading = false;
        },
        complete: () => {
          this.isDataLoading = false;
        },
      });
  }

  private addDays(date: Date, days: number) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private addMonths(date: Date, months: number) {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  private createCoolingOffPeriodsList() {
    log.debug('createCoolingOffPeriodsList() invoked');

    // generate Pause periods - 1-45 days
    this.coolingOffPeriods = [];
    this.coolingOffPeriods.push({
      label: '1 ' + this.translateService.instant(marker('day')),
      value: '1',
    });
    for (var i = 2; i <= 42; i++) {
      this.coolingOffPeriods.push({
        label: `${i} ` + this.translateService.instant(marker('days')),
        value: i.toString(),
      });
    }
    this._change.markForCheck();
  }

  private createSelfExclusionPeriodsList() {
    log.debug('createSelfExclusionPeriodsList() invoked');

    // generate Self Exclusion periods - needed because of translations
    this.selfExclusionPeriods = [
      {
        label: '3 ' + this.translateService.instant(marker('months')),
        value: '3',
      },
      {
        label: '6 ' + this.translateService.instant(marker('months')),
        value: '6',
      },
      {
        label: '1 ' + this.translateService.instant(marker('year')),
        value: '12',
      },
      {
        label: '2 ' + this.translateService.instant(marker('years')),
        value: '24',
      },
      {
        label: '3 ' + this.translateService.instant(marker('years')),
        value: '36',
      },
      {
        label: '4 ' + this.translateService.instant(marker('years')),
        value: '48',
      },
      {
        label: '5 ' + this.translateService.instant(marker('years')),
        value: '60',
      },
      {
        label: this.translateService.instant(marker('Permanent')),
        value: '1200',
      },
    ];
    this._change.markForCheck();
  }
}
