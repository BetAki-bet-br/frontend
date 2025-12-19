import { MatButtonModule } from '@angular/material/button';
import { Clipboard } from '@angular/cdk/clipboard';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DataStoreService } from '@app/@core';
import { ExternalConfigsLoader } from '@app/@core/external-configs-loader';
import { SnackbarService } from '@app/@core/snackbar.service';
import {
  Breadcrumbs,
  PageBreadcrumbsComponent,
} from '@app/@shared/components/page-breadcrumbs/page-breadcrumbs.component';
import { Logger } from '@app/@shared/logger.service';
import { Banner } from '@app/@shared/models';
import { CategoryKeyEnum } from '@app/@shared/models/template.model';
import { CmsService } from '@app/@shared/services/cms.service';
import { GoogleTagManagerImplementationService } from '@app/@shared/services/google-tag-manager-implementation.service';
import { PaymentsService } from '@app/@shared/services/payment.service';
import { PlayerStatusService } from '@app/@shared/services/player.status.service';
import { TawkToScriptService } from '@app/@shared/services/tawkto-script.service';
import { AccountVerificationActionEnum, AuthDialogService } from '@app/auth/auth-dialog.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { environment } from '@env/environment';
import { CreatePaymentResponse, PaymentRequest } from '@icore/ngx-portalgateway-api-client-atl';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, switchMap } from 'rxjs';
import { MatFormField, MatHint, MatError } from '@angular/material/form-field';
import { CdnizePipe } from '@app/@pipes/cdnize.pipe';
import { MatInputModule } from '@angular/material/input';
import { A11yModule } from '@angular/cdk/a11y';

const log = new Logger('WalletDepositComponent');

interface DepositForm {
  amount: FormControl<string | null>;
}

@Component({
  selector: 'app-wallet-deposit',
  templateUrl: './wallet-deposit.component.html',
  styleUrls: ['./wallet-deposit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageBreadcrumbsComponent,
    MatFormField,
    MatHint,
    MatError,
    MatButtonModule,
    RouterLink,
    CdnizePipe,
    TranslateModule,
    MatInputModule,
    ReactiveFormsModule,
    A11yModule,
  ],
})
export class WalletDepositComponent implements OnInit {
  private paymentsService = inject(PaymentsService);
  private cdr = inject(ChangeDetectorRef);
  private clipboard = inject(Clipboard);
  private snackbarService = inject(SnackbarService);
  private translateService = inject(TranslateService);
  private dataStoreService = inject(DataStoreService);
  private googleTagManagerServiceImpl = inject(GoogleTagManagerImplementationService);
  private playerService = inject(PlayerStatusService);
  private tawkToScriptService = inject(TawkToScriptService);
  private cmsService = inject(CmsService);
  private router = inject(Router);
  private authDialogService = inject(AuthDialogService);
  private externalConfigsLoader = inject(ExternalConfigsLoader);
  private destroyRef = inject(DestroyRef);

  balance = 0;
  balanceCurrency = '';
  balanceString = '';
  balanceVisible = true;

  minAmount = 5;
  minAmountTestMode = 1;
  currency: string | undefined = this.dataStoreService.defaultCurrency;

  depositForm: FormGroup<DepositForm> = new FormGroup<DepositForm>({
    amount: new FormControl<string>('5,00', [Validators.required, Validators.min(this.minAmount)]),
  });

  isLoading: boolean = false;
  currentStep: number = 1;
  qrCodeImage: string | null = null;
  qrCodeText: string = '';
  depositId: string = '';

  bannerItem: Banner | null = null;

  error = '';

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
      text: 'Depositar',
    },
  ];

  get inputWidth(): string {
    const length = this.depositForm?.controls?.amount?.value?.toString().length || 0;
    return `${length}ch`;
  }

  get amountControl() {
    return this.depositForm.controls.amount;
  }

  ngOnInit(): void {
    this.loadBanner();
    this.playerService.balanceSub$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((balance) => {
      this.balance = balance?.totalBalance ?? 0;
      const currencySymbol = this.dataStoreService.getCurrencySymbol(
        this.dataStoreService.defaultLanguage,
        balance?.currency ?? ''
      );
      this.balanceCurrency = currencySymbol;
      this.balanceString = this.dataStoreService.getNumberInLocalFormat(balance?.totalBalance ?? 0, 2);
    });

    this.externalConfigsLoader.configsLoaded$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((loaded) => {
      if (loaded) {
        let paymentTestModeEnabled: any = environment.deployConfig.paymentTestModeEnabled;
        if (typeof paymentTestModeEnabled === 'string') {
          paymentTestModeEnabled = paymentTestModeEnabled.toLowerCase() === 'true';
        }
        if (paymentTestModeEnabled) {
          this.depositForm.controls.amount?.setValidators([Validators.min(this.minAmountTestMode)]);
          this.depositForm?.updateValueAndValidity();
        }
      }
    });
  }

  goToSecondStep() {
    this.clearError();

    if (this.currentStep !== 1 || this.depositForm.invalid) {
      return;
    }

    this.googleTagManagerServiceImpl.pushGtmTag({ event: 'click_deposit_button' });

    this.authDialogService
      .initAccountVerification(AccountVerificationActionEnum.Deposit)
      .pipe(
        switchMap((result) => {
          if (result?.canDeposit) {
            const request: PaymentRequest = {
              paymentInstrumentId: 1,
              amount: +(this.amountControl.value?.replace(',', '.') || '0'),
              currency: 'BRL',
            };

            this.isLoading = true;

            return this.paymentsService.createDeposit(request);
          } else {
            return of('DepositCanceled');
          }
        })
      )
      .subscribe({
        next: (response) => {
          if (response === 'DepositCanceled') {
            return;
          }

          if ((response as CreatePaymentResponse)?.paymentStatus === 'Declined') {
            this.processFailedDeposit({
              error: {
                errorMessage: marker('Deposit declined'),
              },
            });
            return;
          }

          this.currentStep = 2;
          this.amountControl.disable();
          this.loadBanner();

          this.router.navigate(['/profile/wallet/deposit'], { state: { bannerPosition: 1 } });

          this.isLoading = false;

          this.qrCodeImage = (response as CreatePaymentResponse)?.parameters?.['QRCodeImage'] ?? null;
          this.qrCodeText = (response as CreatePaymentResponse)?.parameters?.['QRCode'] ?? '';

          this.depositId = (response as CreatePaymentResponse)?.transactionId ?? '';

          this.googleTagManagerServiceImpl.pushGtmTag({ event: 'deposit' });
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.processFailedDeposit(err);
        },
      });
  }

  goToFirstStep() {
    if (this.currentStep !== 2 || this.depositForm.invalid) {
      return;
    }

    this.depositForm.reset();
    this.amountControl.enable();
    this.depositId = '';
    this.currentStep = 1;
    this.loadBanner();
    this.clearError();
  }

  copyCode() {
    this.clipboard.copy(this.qrCodeText ?? '');
  }

  updateBalance() {
    this.playerService.updatePlayerBalance().subscribe();
  }

  onChatClick() {
    this.tawkToScriptService.maximize();
  }

  amount: number = 0;

  onInput(value: string) {
    // Remove any invalid characters (keep digits and one comma)
    value = value.replace(/[^0-9,]/g, '');

    const parsed = parseFloat(value.replace(',', '.'));
    if (!isNaN(parsed)) {
      this.amount = parsed;
    }

    if (value !== this.amountControl.value) {
      this.amountControl.setValue(value, { emitEvent: false });
    }
  }

  onBlur() {
    if (!isNaN(this.amount)) {
      // Format with comma and 2 decimals
      this.amountControl.setValue(this.amount.toFixed(2).replace('.', ','));
    }
    // else {
    //   this.amountControl.setValue('0,00');
    // }
  }

  private processFailedDeposit(err: any) {
    log.debug('processFailedDeposit(): deposit error: ', err);
    if (err) {
      this.error = err.error?.errorMessage || '';
      // set specific error for InvalidPlayerStatus
      if (this.error === 'InvalidPlayerStatus') {
        this.error = marker('Deposits are not possible while Pause Period is active.');
      }
    }

    this.isLoading = false;
    this.cdr.markForCheck();
    this.snackbarService.openCustomError(this.translateService.instant('Deposit failed'), 'center', 'top');
  }

  private clearError() {
    this.error = '';
  }

  private loadBanner() {
    this.cmsService.getBannersBySlug(CategoryKeyEnum.DepositPage, this.currentStep - 1).subscribe((res) => {
      this.bannerItem = res;
      console.log('Loaded banner item:', this.bannerItem);
      this.cdr.markForCheck();
    });
  }
}
