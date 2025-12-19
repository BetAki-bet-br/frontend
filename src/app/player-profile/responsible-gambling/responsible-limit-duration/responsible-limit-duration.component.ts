import { Dialog } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { PlayerLimit, TimePeriod } from '@app/@shared/models';
import { AuthDialogService } from '@app/auth/auth-dialog.service';
import { PlayerProfileService } from '@app/player-profile/player-profile.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { LimitStatusEnum, LimitTypeEnum } from '@icore/ngx-portalgateway-api-client-atl';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Subscription } from 'rxjs';
import {
  PausePeriodDialogComponent,
  PausePeriodDialogData,
  PausePeriodDialogResult,
} from '../pause-period-dialog/pause-period-dialog.component';

@Component({
  selector: 'app-responsible-limit-duration',
  templateUrl: './responsible-limit-duration.component.html',
  styleUrls: ['./responsible-limit-duration.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResponsibleLimitDurationComponent implements OnInit, OnDestroy, OnChanges {
  @Input() isSelfExclusion = false;
  @Input() limitTypeName = marker('No title');
  @Input() limitTypeDuration = '';
  @Input() limit: PlayerLimit = {};
  @Input() description = '';
  @Input() timePeriods: TimePeriod[] = [];

  @Output() updateLimit: EventEmitter<PlayerLimit> = new EventEmitter();
  @Output() deleteLimit: EventEmitter<number> = new EventEmitter();

  limitStatusEnum = LimitStatusEnum;

  extendContent = true;

  form = this.fb.group({
    time: this.fb.control<string>(''),
    // password: this.fb.control<string>(''),
  });

  hidePassword = true;

  private dialogSubscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private dialog: Dialog,
    private deviceService: DeviceDetectorService,
    private playerProfileService: PlayerProfileService,
    private authDialogService: AuthDialogService
  ) {}

  ngOnInit(): void {
    if (this.limit?.amountValue) {
      this.form.patchValue({
        time: this.limit.amountValue + '',
      });
    }

    if (this.isMobile()) {
      this.extendContent = false;
    }

    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.dialogSubscriptions.forEach((s) => s.unsubscribe());
    this.dialogSubscriptions = [];
  }

  ngOnChanges(changes: SimpleChanges): void {
    const change = changes['limit'];

    if (change !== undefined) {
      if (this.limit?.amountValue) {
        this.form.patchValue({
          time: change.currentValue?.amountValue,
        });
      }

      this.cdr.detectChanges();
    }
  }

  isMobile() {
    return this.deviceService.isMobile() || this.deviceService.isTablet();
  }

  setLimitDuration() {
    this.form.controls?.time?.setValidators([Validators.required]);
    // this.form.controls?.password?.setValidators([Validators.required]);

    this.form?.markAllAsTouched();

    this.form?.controls?.time?.updateValueAndValidity();
    // this.form?.controls?.password?.updateValueAndValidity();

    this.form?.updateValueAndValidity();

    if (!this.form || this.form?.invalid) {
      return;
    }

    const timeValue = this.form.get('time')?.value ?? '';
    const timeItem = this.timePeriods.find((t) => t.value === timeValue);

    // open dialog
    const dialogRef = this.dialog.open<PausePeriodDialogResult, PausePeriodDialogData, PausePeriodDialogComponent>(
      PausePeriodDialogComponent,
      {
        data: {
          limit: timeItem?.label ?? '',
          isSelfExclusion: this.isSelfExclusion,
        },
        autoFocus: false,
      }
    );

    // subscribe to dialog closed event
    this.dialogSubscriptions.push(
      // on dialog closed
      dialogRef.closed.subscribe((result) => {
        if (result?.confirm) {
          this.emitLimitChange();
        }

        // unsubscribe from dialog subscriptions
        this.dialogSubscriptions.forEach((s) => s.unsubscribe());
        this.dialogSubscriptions = [];

        this.cdr.markForCheck();
      })
    );
  }

  private emitLimitChange() {
    const timeValue = this.form.get('time')?.value ?? '';
    const time = timeValue.length > 0 ? +timeValue : -1;

    const playerSessionLimit: PlayerLimit = {
      ...this.limit,
      amountValue: time > -1 ? +time : null,
      amountLeft: time > -1 ? +time : null,
      reason: 'Player changed session limit',
      time: undefined,
      locked: false,
      limitStatus: LimitStatusEnum.Active,
      limitType: LimitTypeEnum.SiteSessionDuration,
    };

    this.updateLimit.emit(playerSessionLimit);
  }

  deleteLimitDuration() {
    this.deleteLimit.emit(this.limit.id);
  }
}
