import { ChatService } from '@app/@shared/services/chat.service';
import { AccountVerificationActionEnum, AuthDialogService, FaceAuthParams } from '@app/auth/auth-dialog.service';
import { BRAND } from '@app/@core/brand';
import {
  PixKeyType,
  PlayerProfile,
  TransactionStatus,
  WALLET_GATEWAY,
  WithdrawalInput,
  WithdrawalRefusal,
} from '@app/@core/gateway';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { catchError, map, of, Subscription, switchMap, throwError } from 'rxjs';
import { MatIcon } from '@angular/material/icon';
import { MatFormFieldModule, MatError } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Dialog } from '@angular/cdk/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  inject,
  ChangeDetectorRef,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  ReactiveFormsModule,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@angular/material/core';
import { DataStoreService } from '@app/@core';
import { ConfigurationService } from '@app/@core/configuration.service';
import { SnackbarService } from '@app/@core/snackbar.service';
import { Logger } from '@app/@shared';
import {
  PageBreadcrumbsComponent,
  Breadcrumbs,
} from '@app/@shared/components/page-breadcrumbs/page-breadcrumbs.component';
import {
  WithdrawalAuthenticationDialogResult,
  WithdrawalAuthenticationDialogComponent,
} from '@app/@shared/components/withdrawal-authentication-dialog/withdrawal-authentication-dialog.component';
import { WithdrawalDialogComponent } from '@app/@shared/components/withdrawal-dialog/withdrawal-dialog.component';
import { WithdrawalError } from '@app/@shared/models';
import { GoogleTagManagerImplementationService } from '@app/@shared/services/google-tag-manager-implementation.service';
import { NgxMaskDirective } from 'ngx-mask';

import { PlayerStatusService } from '@app/@shared/services/player.status.service';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { ButtonComponent } from '@app/@shared/components/button/button.component';

const log = new Logger('WalletWithdrawalComponent');

interface WithdrawalForm {
  type: FormControl<PixKeyType | null>;
  amount: FormControl<number | null>;
  key: FormControl<string | null>;
}

interface WithdrawalType {
  label: string;
  value: PixKeyType;
}

@Component({
  selector: 'app-wallet-withdrawal',
  templateUrl: './wallet-withdrawal.component.html',
  styleUrls: ['./wallet-withdrawal.component.scss'],
  providers: [{ provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageBreadcrumbsComponent,
    MatIcon,
    MatSelect,
    MatInputModule,
    MatButtonModule,
    MatTooltipModule,
    TranslateModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    NgxMaskDirective,
    MatOption,
    ButtonComponent,
  ],
})
export class WalletWithdrawalComponent implements OnInit, OnDestroy {
  private cdr = inject(ChangeDetectorRef);
  private snackbarService = inject(SnackbarService);
  private translateService = inject(TranslateService);
  private dialog = inject(Dialog);
  private dataStoreService = inject(DataStoreService);
  private googleTagManagerServiceImpl = inject(GoogleTagManagerImplementationService);
  private chatService = inject(ChatService);
  private playerService = inject(PlayerStatusService);
  private authDialogService = inject(AuthDialogService);
  private wallet = inject(WALLET_GATEWAY);
  private configurationService = inject(ConfigurationService);
  private destroyRef = inject(DestroyRef);
  private readonly brand = inject(BRAND);
  protected readonly ageBadge = this.brand.assets.ageBadge;

  balance = 0;
  balanceCurrency = '';
  balanceString = '';
  balanceVisible = true;

  minAmount = 20;
  minAmountTestMode = 1;
  maxAmount = 5000;
  currency: string | undefined = this.dataStoreService.defaultCurrency;

  withdrawStep = 1;
  withdrawSuccess = false;
  withdrawCanceled = true;
  faceAuthParams!: FaceAuthParams;

  withdrawalForm: FormGroup<WithdrawalForm> = new FormGroup({
    type: new FormControl<PixKeyType | null>(PixKeyType.Document, Validators.required),
    key: new FormControl<string | null>(null, Validators.required),
    amount: new FormControl<number | null>(null, [
      Validators.required,
      this.customMinMaxValidator(this.minAmount, this.maxAmount),
      this.minBalanceValidator(),
    ]),
  });

  typeList: WithdrawalType[] = [
    { label: this.translateService.instant('CPF'), value: PixKeyType.Document },
    { label: this.translateService.instant('Telephone'), value: PixKeyType.Phone },
    { label: this.translateService.instant('Email'), value: PixKeyType.Email },
  ];

  playerInfo: PlayerProfile | null = null;
  isLoading: boolean = false;
  faceAuthDialogOpen: boolean = false;

  sub = new Subscription();

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
      text: 'Withdrawal',
    },
  ];

  get amountControl() {
    return this.withdrawalForm.controls.amount;
  }

  get keyControl() {
    return this.withdrawalForm.controls.key;
  }

  get typeControl() {
    return this.withdrawalForm.controls.type;
  }

  get valuePlaceholder(): string {
    if (this.typeControl.value === PixKeyType.Document) {
      return 'CPF';
    } else if (this.typeControl.value === PixKeyType.Email) {
      return 'Email';
    } else if (this.typeControl.value === PixKeyType.Phone) {
      return 'Telephone';
    } else {
      return '';
    }
  }

  ngOnInit(): void {
    this.balanceVisible = this.dataStoreService.balanceVisible;

    this.playerService.balanceSub$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((balance) => {
      this.balance = balance?.withdrawableBalance ?? 0;
      const currencySymbol = this.dataStoreService.getCurrencySymbol(
        this.dataStoreService.defaultLanguage,
        balance?.currency ?? '',
      );
      this.balanceCurrency = currencySymbol;
      this.balanceString = this.dataStoreService.getNumberInLocalFormat(balance?.withdrawableBalance ?? 0, 2);
    });

    let paymentTestModeEnabled: any = this.brand.features.paymentTestMode;
    if (typeof paymentTestModeEnabled === 'string') {
      paymentTestModeEnabled = paymentTestModeEnabled.toLowerCase() === 'true';
    }
    if (paymentTestModeEnabled) {
      this.withdrawalForm.controls.amount?.setValidators([
        this.customMinMaxValidator(this.minAmountTestMode, this.maxAmount),
        this.minBalanceValidator(),
      ]);
      this.withdrawalForm?.updateValueAndValidity();
    }

    this.configurationService.getPlayerInfo().subscribe((res) => {
      this.playerInfo = res;
      this.setKeyValue(this.typeControl.value);
    });

    this.sub.add(
      this.typeControl.valueChanges.subscribe((res) => {
        this.setKeyValue(res);
      }),
    );

    this.sub.add(
      this.dataStoreService.balanceVisibilityChange.subscribe((res) => {
        this.balanceVisible = this.dataStoreService.balanceVisible;
        this.cdr.detectChanges();
      }),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  withdraw() {
    if (this.isLoading || this.faceAuthDialogOpen || this.withdrawalForm.invalid) {
      return;
    }

    const request: WithdrawalInput = {
      amount: this.amountControl.value ?? 0,
      keyType: this.typeControl.value ?? PixKeyType.Document,
      key: this.keyControl.value ?? '',
    };

    this.isLoading = true;

    this.authDialogService
      .initAccountVerification(AccountVerificationActionEnum.Withdrawal)
      .pipe(
        switchMap((result) => {
          this.withdrawCanceled = false;

          // Null is the player walking out of the re-verification the withdrawal is gated behind:
          // nothing was asked of the gateway, and nothing is said to the player.
          return result?.success ? this.wallet.checkWithdrawalEligibility(request) : of(null);
        }),
        switchMap((eligibility) => {
          log.debug('Withdrawal eligibility:', eligibility);

          if (eligibility === null) {
            return of(null);
          }

          if (eligibility.outcome === 'refused') {
            this.explainRefusal(eligibility.reason);
            return of(null);
          }

          return this.wallet.startWithdrawal(request);
        }),
        switchMap((ticket) => {
          if (!ticket?.referenceId) {
            return of(null);
          }

          this.faceAuthParams = {
            providerId: ticket.referenceId,
            faceAuthUrl: ticket.url,
            faceAuthUrlQR: ticket.qrCodeUrl,
          };

          const dialogRef = this.dialog.open<WithdrawalAuthenticationDialogResult>(
            WithdrawalAuthenticationDialogComponent,
            {
              data: {
                title: this.translateService.instant('Authentication'),
                description: this.translateService.instant(
                  'Click the button below to verify your account and identity, it’s quick and easy.',
                ),
              },
            },
          );

          return dialogRef.closed.pipe(
            switchMap((result) => {
              if (result && result?.auth) {
                return this.onVerify();
              }
              return of(null);
            }),
          );
        }),
      )
      .subscribe({
        next: (result) => {
          log.debug('Withdraw completed with result:', result);
          if (result !== null) {
            if (!this.withdrawCanceled) {
              if (this.withdrawSuccess) {
                this.withdrawalSuccessDialog();
              } else {
                this.withdrawalErrorDialog();
              }
              this.withdrawCanceled = true;
            }
          }
        },
        complete: () => {
          log.debug('Withdraw complete invoked');
          this.isLoading = false;
        },
        error: (err) => {
          this.withdrawSuccess = false;
          this.withdrawCanceled = true;
          this.withdrawalForm.reset();
          this.isLoading = false;

          // for declined withdrawals, show a specific error dialog
          if (err instanceof WithdrawalError && err.transactionError === TransactionStatus.Declined) {
            this.withdrawalDeclinedErrorDialog();
          } else {
            this.withdrawalErrorDialog();
          }
        },
      });
  }

  /** The gateway would not start the withdrawal, and the screen says so in the player's words. */
  private explainRefusal(reason: WithdrawalRefusal) {
    this.withdrawSuccess = false;

    if (reason === 'not-enough-funds') {
      this.withdrawalForm.controls.amount.setErrors({ notEnoughFunds: true });
      return;
    }

    if (reason === 'withdrawals-disabled') {
      this.withdrawalDisabledErrorDialog();
      return;
    }

    // Refused for something the amount field cannot explain, so the marker it may still be
    // carrying from a previous attempt comes off.
    const errors = { ...this.amountControl.errors };
    delete errors['notEnoughFunds'];
    this.amountControl.setErrors(Object.keys(errors).length === 0 ? null : errors);
  }

  private withdrawalSuccessDialog() {
    this.withdrawalForm.reset();
    this.dialog.open(WithdrawalDialogComponent, {
      width: '25rem',
      data: {
        title: this.translateService.instant('Withdrawal completed successfully'),
        success: true,
      },
    });
  }

  private withdrawalErrorDialog() {
    this.withdrawalForm.reset();
    this.dialog.open(WithdrawalDialogComponent, {
      width: '25rem',
      data: {
        title: this.translateService.instant('Withdrawal could not be completed'),
        description: this.translateService.instant(
          "To complete the withdrawal, use a Pix key linked to the account holder's CPF.",
        ),
        success: false,
      },
    });
  }

  private withdrawalDeclinedErrorDialog() {
    this.withdrawalForm.reset();
    this.dialog.open(WithdrawalDialogComponent, {
      width: '25rem',
      data: {
        title: this.translateService.instant('Withdrawal was declined'),
        description: '',
        success: false,
      },
    });
  }

  private withdrawalDisabledErrorDialog() {
    this.withdrawalForm.reset();
    this.dialog.open(WithdrawalDialogComponent, {
      width: '25rem',
      data: {
        title: this.translateService.instant('Withdrawal is disabled'),
        description: '',
        success: false,
        withdrawalDisabled: true,
      },
    });
  }

  onVerify() {
    if (!this.faceAuthParams) {
      return of(false);
    }

    return this.authDialogService
      .initAccountVerificationWithParams(AccountVerificationActionEnum.Withdrawal, this.faceAuthParams)
      .pipe(
        map((response) => {
          log.debug('Account verification response:', response);
          if (response?.success) {
            this.snackbarService.openCustomSuccess(
              this.translateService.instant('Withdrawal successful'),
              'center',
              'top',
            );
            this.googleTagManagerServiceImpl.pushGtmTag({ event: 'withdrawal' });
            this.withdrawSuccess = true;
            return true;
          } else {
            // this.snackbarService.openCustomError(this.translateService.instant('Error'));
            this.withdrawSuccess = false;
            return false;
          }
        }),
        catchError((err: HttpErrorResponse | WithdrawalError) => {
          log.warn('Withdrawal verification failed with error:', err);

          this.isLoading = false;
          this.withdrawSuccess = false;

          // for WithdrawalFaceAuthenticationStatusError errors, just rethrow the error
          if (err instanceof WithdrawalError) {
            return throwError(() => err);
          }
          // for the rest of the errors, show a snackbar message
          this.snackbarService.openCustomError(this.translateService.instant('Withdrawal failed.'), 'center', 'top');
          return of(false);
        }),
      );
  }

  updateBalance() {
    this.playerService.updatePlayerBalance().subscribe();
  }

  openPix() {
    this.withdrawStep = 2;
    this.breadcrumbs = [
      {
        svgIcon: 'essentials-home',
        url: '/',
      },
      {
        text: 'My account',
        url: '/profile',
      },
      {
        text: 'Withdrawal',
        url: '/profile/wallet/withdrawal',
      },
      {
        text: 'Pix',
      },
    ];
  }

  onCancel() {
    this.withdrawStep = 1;
    this.withdrawalForm.reset();
    this.breadcrumbs = [
      {
        svgIcon: 'essentials-home',
        url: '/',
      },
      {
        text: 'My account',
        url: '/profile',
      },
      {
        text: 'Withdrawal',
      },
    ];
  }

  onNewWithdrawal() {
    this.withdrawStep = 2;
    this.withdrawalForm.reset();
    this.breadcrumbs = [
      {
        svgIcon: 'essentials-home',
        url: '/',
      },
      {
        text: 'My account',
        url: '/profile',
      },
      {
        text: 'Withdrawal',
        url: '/profile/wallet/withdrawal',
      },
      {
        text: 'Pix',
      },
    ];
  }

  onChatClick() {
    this.chatService.showChat();
  }

  backButtonClicked() {
    if (this.withdrawStep === 2) {
      this.withdrawStep = 1;
      this.withdrawalForm.reset();
      this.breadcrumbs = [
        {
          svgIcon: 'essentials-home',
          url: '/',
        },
        {
          text: 'My account',
          url: '/profile',
        },
        {
          text: this.translateService.instant('Withdrawal'),
        },
      ];
      this.cdr.markForCheck();
    }
  }

  private setKeyValue(type: string | null) {
    switch (type) {
      case 'document':
        this.keyControl.setValue(this.playerInfo?.username ?? '');
        break;
      case 'email':
        this.keyControl.setValue(this.playerInfo?.email ?? '');
        break;
      case 'phone':
        this.keyControl.setValue(this.playerInfo?.mobilePhone ?? '');
        break;
    }
  }

  minBalanceValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value == null || isNaN(value)) {
        return null;
      }

      if (value > this.balance) {
        return { notEnoughFunds: true };
      }

      return null;
    };
  }

  customMinMaxValidator(min: number, max: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = Number(control.value);
      if (isNaN(value)) return null;

      if (value < min) {
        return { min: true };
      }
      if (value > max) {
        return { max: true };
      }
      return null;
    };
  }

  changeBalanceVisibility() {
    this.dataStoreService.balanceVisible = !this.dataStoreService.balanceVisible;
  }
}
