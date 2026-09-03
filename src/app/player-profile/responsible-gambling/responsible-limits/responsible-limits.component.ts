import { Dialog } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  inject,
  input,
  output,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataStoreService } from '@app/@core';
import { SnackbarService } from '@app/@core/snackbar.service';
import { Logger } from '@app/@shared';
import { PlayerLimit } from '@app/@shared/models';
import { validateNumber } from '@app/@shared/utils/validate-number';
import { PlayerProfileService } from '@app/player-profile/player-profile.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { LimitStatusEnum, LimitTypeEnum, TimeTypeEnum } from '@icore/ngx-portalgateway-api-client-atl';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { finalize, Subscription } from 'rxjs';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule, MatExpansionPanelHeader } from '@angular/material/expansion';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { TimeLeftPipe } from '@app/player-profile/promo/active-promo-tile/time-left.pipe';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { AsyncPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';

export const RESPONSIBLE_MAXIMUM_LIMIT = 50000000;
export const RESPONSIBLE_DEPOSIT_MAXIMUM_LIMIT = 100000000000000000;

interface TimePeriodOption {
  label: string;
  value: TimeTypeEnum;
}

const log = new Logger('ResponsibleLimitsComponent');

export interface ResponsibleLimitForm {
  limitPeriod: FormControl<TimeTypeEnum | null>;
  limitValue?: FormControl<number | null>;
}

@Component({
  selector: 'app-responsible-limits',
  templateUrl: './responsible-limits.component.html',
  styleUrls: ['./responsible-limits.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslateModule,
    MatIcon,
    MatInputModule,
    MatExpansionModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatExpansionPanelHeader,
    TimeLeftPipe,
    AsyncPipe,
    MatFormFieldModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
  ],
})
export class ResponsibleLimitsComponent implements OnInit, OnDestroy, OnChanges {
  private fb = inject(FormBuilder);
  private translate = inject(TranslateService);
  private playerProfileService = inject(PlayerProfileService);
  private snackbarService = inject(SnackbarService);
  private dialog = inject(Dialog);
  private dataStoreService = inject(DataStoreService);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('timeLeftTemplate', { static: true }) timeLeftTemplate?: TemplateRef<any>;
  @ViewChild('statusTemplate', { static: true }) statusTemplate?: TemplateRef<any>;

  readonly limits = input<PlayerLimit[]>([]);
  readonly currencyCode = input('');

  readonly refreshLimits = output<void>();

  limitStatusEnum = LimitStatusEnum;

  isDataLoading = false;

  LimitTypeEnum = LimitTypeEnum;

  limitMax = 99999999;

  limitList = [
    {
      type: LimitTypeEnum.Deposit,
      title: marker('Deposit limits'),
      description: marker(
        'Set a maximum amount you can deposit in a chosen time period. Period limitations can be set to 24 hours, 7 days, or 30 consecutive days. Once you reach the specified limit, you will not be able to add any more funds until the set time period has ended. If you reduce the limit, the change will take effect immediately. If you choose to increase the limit, the change will take effect 24 hours after the change.',
      ),
    },
    {
      type: LimitTypeEnum.TotalWager,
      title: marker('Betting limits'),
      description: marker(
        'Set a maximum amount you can bet in a chosen time period. Period limitations can be set to 24 hours, 7 days or 30 consecutive days. Once you reach the specified limit, you will not be able to place any new bets until the set time has elapsed. If you reduce the limit, the change will be applied immediately. If you choose to increase the limit, the change will take effect 24 hours after the change.',
      ),
    },
    {
      type: LimitTypeEnum.TotalLost,
      title: marker('Loss limits'),
      description: marker(
        'Set a maximum amount you are willing to lose in a chosen period of time. Period limitations can be set to 24 hours, 7 days or 30 consecutive days. Once you reach the loss limit, you will not be able to continue playing until the set time has elapsed. If you reduce the limit, the change will take effect immediately. If you choose to increase the limit, the change will take effect 24 hours after the change.',
      ),
    },
    {
      type: LimitTypeEnum.SiteSessionDuration,
      title: marker('Time limits'),
      description: marker(
        'Set a time limit for how long you can play per session. Once you reach the set time, you will be automatically logged out and will only be able to play again after the time limit has ended or when you start a new session. If you reduce the limit, the change will take effect immediately. If you decide to increase the time, the change will take effect 24 hours later.',
      ),
    },
  ];

  depositForm = this.fb.group<ResponsibleLimitForm>({
    limitPeriod: this.fb.control<TimeTypeEnum | null>(null, Validators.required),
    limitValue: this.fb.control<number | null>(null, Validators.required),
  });

  totalWagerForm = this.fb.group<ResponsibleLimitForm>({
    limitPeriod: this.fb.control<TimeTypeEnum | null>(null, Validators.required),
    limitValue: this.fb.control<number | null>(null, Validators.required),
  });

  totalLostForm = this.fb.group<ResponsibleLimitForm>({
    limitPeriod: this.fb.control<TimeTypeEnum | null>(null, Validators.required),
    limitValue: this.fb.control<number | null>(null, Validators.required),
  });

  siteSessionDurationForm = this.fb.group<ResponsibleLimitForm>({
    limitPeriod: this.fb.control<TimeTypeEnum | null>(null, Validators.required),
    limitValue: this.fb.control<number | null>(null, Validators.required),
  });

  formGroups: Map<LimitTypeEnum, FormGroup<ResponsibleLimitForm>> = new Map();

  depostLimis: PlayerLimit[] = [];
  totalWagerLimits: PlayerLimit[] = [];
  totalLostLimits: PlayerLimit[] = [];
  siteSessionDurationLimits: PlayerLimit[] = [];

  limitPeriodOptions: TimePeriodOption[] = [
    {
      label: 'Daily',
      value: TimeTypeEnum.Day,
    },
    {
      label: 'Weekly',
      value: TimeTypeEnum.Week,
    },
    {
      label: 'Monthly',
      value: TimeTypeEnum.Month,
    },
  ];

  limitPeriodOptionsSession: TimePeriodOption[] = [
    {
      label: 'Daily',
      value: TimeTypeEnum.Day,
    },
    {
      label: 'Monthly',
      value: TimeTypeEnum.Month,
    },
  ];

  selectedTimePeriodTable = TimeTypeEnum.Day;
  lastAddedPeriodTable = TimeTypeEnum.Day;

  // export to template
  validateNumber = validateNumber;

  private subscriptions: Subscription = new Subscription();
  private dialogSubscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.depositForm.controls.limitPeriod?.updateValueAndValidity();
    this.depositForm.controls.limitValue?.updateValueAndValidity();

    this.depositForm.updateValueAndValidity();

    this.formGroups.set(LimitTypeEnum.Deposit, this.depositForm);
    this.formGroups.set(LimitTypeEnum.TotalWager, this.totalWagerForm);
    this.formGroups.set(LimitTypeEnum.TotalLost, this.totalLostForm);
    this.formGroups.set(LimitTypeEnum.SiteSessionDuration, this.siteSessionDurationForm);
  }

  ngOnDestroy(): void {
    this.subscriptions?.unsubscribe();

    this.dialogSubscriptions.forEach((s) => s.unsubscribe());
    this.dialogSubscriptions = [];
  }

  ngOnChanges(changes: SimpleChanges): void {
    const limitsChange = changes['limits'];

    if (limitsChange) {
      const limits = limitsChange.currentValue as PlayerLimit[];

      this.depostLimis = this.getExistingLimits(limits, LimitTypeEnum.Deposit);
      this.totalWagerLimits = this.getExistingLimits(limits, LimitTypeEnum.TotalWager);
      this.totalLostLimits = this.getExistingLimits(limits, LimitTypeEnum.TotalLost);
      this.siteSessionDurationLimits = this.getExistingLimits(limits, LimitTypeEnum.SiteSessionDuration);

      this.cdr.detectChanges();
    }
  }

  getForm(limitType: LimitTypeEnum): FormGroup<ResponsibleLimitForm> {
    return this.formGroups.get(limitType) ?? this.depositForm;
  }

  getLimits(limitType: LimitTypeEnum): PlayerLimit[] {
    switch (limitType) {
      case LimitTypeEnum.Deposit:
        return this.depostLimis;
      case LimitTypeEnum.TotalWager:
        return this.totalWagerLimits;
      case LimitTypeEnum.TotalLost:
        return this.totalLostLimits;
      case LimitTypeEnum.SiteSessionDuration:
        return this.siteSessionDurationLimits;
    }

    return [];
  }

  onAddLimit(limitType: LimitTypeEnum) {
    const formGroup = this.getForm(limitType);

    // formGroup.controls.limitPeriod?.setValidators([Validators.required]);
    // formGroup.controls.limitValue?.setValidators([Validators.required]);

    formGroup.markAllAsTouched();

    formGroup.controls.limitPeriod?.updateValueAndValidity();
    formGroup.controls.limitValue?.updateValueAndValidity();

    formGroup.updateValueAndValidity();

    if (!formGroup || formGroup?.invalid) {
      return;
    }

    const request: PlayerLimit = {
      id: undefined,
      limitType: limitType,
      limitStatus: LimitStatusEnum.Active,
      amountValue: formGroup?.get('limitValue')?.value ?? undefined,
      amountLeft: formGroup?.get('limitValue')?.value ?? undefined,
      locked: false,
      time: formGroup.get('limitPeriod')?.value ?? undefined,
      reason: 'Added from player portal',
    };

    this.subscriptions.add(
      this.playerProfileService
        .setPlayerLimit(request)
        .pipe(
          finalize(() => {
            this.isDataLoading = false;
            this.cdr.markForCheck();
          }),
        )
        .subscribe({
          next: (response) => {
            log.debug(`Returned response`, response);

            this.snackbarService.openCustomSuccess(this.translate.instant('Limit set successfully'), 'center', 'top');

            formGroup.markAsPristine();
            formGroup.reset();
            formGroup.controls?.limitPeriod?.setErrors(null);
            formGroup.updateValueAndValidity();

            this.cdr.markForCheck();
          },
          error: (error) => {
            log.debug(`Save limit error: ${error}`);

            this.snackbarService.openCustomError(this.translate.instant('Error setting limit'), 'center', 'top');
          },
        }),
    );

    setTimeout(() => {
      this.refreshLimits.emit();
    }, 200);
  }

  getLimitAmountValue(value: number | undefined): string {
    return '';
  }

  getLimitPeriod(time: TimeTypeEnum | undefined): string {
    const timeResolved = this.limitPeriodOptions.find((item) => item.value === time)?.label ?? '-';

    return this.translate.instant(timeResolved ?? '-');
  }

  getExistingLimits(limits: PlayerLimit[], limitType: LimitTypeEnum): PlayerLimit[] {
    return limits.filter((item) => item.limitType === limitType).map((item) => this.mapLimitItem(item));
  }

  private mapLimitItem(item: PlayerLimit): PlayerLimit {
    const amount = this.dataStoreService.getNumberInLocalFormat((item.amountValue ?? 0) - (item.amountLeft ?? 0), 2);
    const amountTotal = this.dataStoreService.getNumberInLocalFormat(item.amountValue ?? 0, 2);
    const amountString = item.dateActivated ? `${amount} / ${amountTotal}` : `${amountTotal}`;
    const duration = `${item.amountLeftHours ?? 0}h ${item.amountLeftMinutes ?? 0}m`;

    return {
      ...item,
      currencyResolved: this.resolveCurrency(item),
      limitTypeResolved: this.resolveLimitType(item),
      limitResolved: this.resolveLimitText(item),
      timeLeftDate: this.calculateTimeLeftDate(item),
      amountResolved: item.limitType === LimitTypeEnum.SiteSessionDuration ? duration : amountString,
    };
  }

  private resolveCurrency(item: PlayerLimit): string {
    const isDurationType = [LimitTypeEnum.SiteSessionDuration, LimitTypeEnum.GameSessionDuration].includes(
      item.limitType as any,
    );

    return isDurationType ? this.translate.instant('hours') : this.currencyCode();
  }

  getTimeLeft(record: null | string | undefined): string {
    let result = '/';

    if (!record) {
      return result;
    }

    result = this.translate.instant('{{ timeLeft }} left', { timeLeft: record });

    return result;
  }

  private resolveLimitType(item: PlayerLimit): string {
    return item.limitTypeResolved ? this.translate.instant(item.limitTypeResolved) : '';
  }

  private resolveLimitText(item: PlayerLimit): string {
    const amountValue = this.getLimitAmountValue(item.amountValue ?? undefined);
    if (amountValue === 'No limit') return '';

    const isDurationType = [LimitTypeEnum.SiteSessionDuration, LimitTypeEnum.GameSessionDuration].includes(
      item.limitType as any,
    );

    return isDurationType ? this.formatDurationLimit(item) : this.formatCurrencyLimit(item);
  }

  private formatCurrencyLimit(item: PlayerLimit): string {
    if (item.limitStatus === LimitStatusEnum.Pending) return `${item.amountLeft} ${this.currencyCode()}`;

    return `${item.amountLeft} ${this.translate.instant('of')} ${item.amountValue} ${this.currencyCode()} ${this.translate.instant('left')}`;
  }

  private formatDurationLimit(item: PlayerLimit): string {
    const hours = item.amountLeftHours ? `${item.amountLeftHours}h` : '';
    const minutes = item.amountLeftMinutes ? `${item.amountLeftMinutes}m` : '';
    const duration = [hours, minutes].filter(Boolean).join(' ');

    if (item.limitStatus === LimitStatusEnum.Pending) return `${duration} ${this.translate.instant('hours')}`;

    return `${duration} ${this.translate.instant('of')} ${item.amountValue} ${this.translate.instant(
      'hours left',
    )}`.trim();
  }

  private calculateTimeLeftDate(item: PlayerLimit): Date | null {
    if (item.limitStatus !== 'Active' || item.time === TimeTypeEnum.GameSession) {
      return null;
    }

    const date = new Date();
    const setEndOfDay = () => date.setUTCHours(23, 59, 59);

    switch (item.time) {
      case TimeTypeEnum.Day:
        setEndOfDay();
        break;

      case TimeTypeEnum.Week: {
        const nextWeek = date.getUTCDate() + (7 - date.getUTCDay());
        date.setUTCDate(nextWeek);
        setEndOfDay();
        break;
      }

      case TimeTypeEnum.Month: {
        const lastDayOfMonth = new Date(date.getUTCFullYear(), date.getUTCMonth() + 1, 0);
        date.setUTCDate(lastDayOfMonth.getUTCDate());
        setEndOfDay();
        break;
      }
    }

    return date;
  }
}
