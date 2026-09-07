import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DataStoreService } from '@app/@core';
import { WALLET_GATEWAY, WithdrawalOutcome } from '@app/@core/gateway';
import { Logger } from '@app/@shared/logger.service';
import { AuthenticationService } from '@app/auth';
import { FaceAuthParams } from '@app/auth/auth-dialog.service';
import { BaseDialogComponent } from '../base-dialog/base-dialog.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

const log = new Logger('FaceAuthenticatorDialogComponent');

export interface FaceAuthenticatorDialogData {
  faceAuthParams: FaceAuthParams;
  isWithdrawal?: boolean;
}

export interface FaceAuthenticatorDialogResult {
  success: boolean;
  error?: HttpErrorResponse;
}

/**
 * What the dialog closes with. A withdrawal answers with the money's fate as well as the biometry's,
 * because that is the one call that settles both.
 */
export type FaceAuthenticatorDialogResultType = FaceAuthenticatorDialogResult | WithdrawalOutcome;

@Component({
  selector: 'app-face-authenticator-dialog',
  templateUrl: './face-authenticator-dialog.component.html',
  styleUrls: ['./face-authenticator-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseDialogComponent, MatProgressSpinner],
})
export class FaceAuthenticatorDialogComponent implements OnInit, OnDestroy {
  private dialogRef = inject<DialogRef<FaceAuthenticatorDialogResultType>>(DialogRef);
  private data = inject<FaceAuthenticatorDialogData>(DIALOG_DATA);
  private authenticationService = inject(AuthenticationService);
  private wallet = inject(WALLET_GATEWAY);
  private dataStoreService = inject(DataStoreService);
  private sanitizer = inject(DomSanitizer);
  private cdr = inject(ChangeDetectorRef);

  safeUrl: SafeResourceUrl | undefined;
  isLoading = false;

  @HostListener('window:message', ['$event'])
  OnMessage(event: MessageEvent) {
    const actionName = event?.data?.name;
    const responseCode = event?.data?.status;
    const providerId = this.data.faceAuthParams.providerId;
    const isWithdrawal = this.data.isWithdrawal;
    if ((actionName === 'faceindex' || actionName === 'facematch') && responseCode === 'success') {
      this.isLoading = true;
      this.cdr.markForCheck();
      if (isWithdrawal) {
        this.wallet.getWithdrawalOutcome(providerId).subscribe((result) => {
          log.debug('Withdrawal face authentication status:', result);
          if (result.authentication === 'approved') {
            this.dialogRef.close(result);
          }
        });
      } else {
        this.authenticationService.getFaceAuthenticationStatus(providerId).subscribe({
          next: (result) => {
            if (result === 'approved') {
              this.dialogRef.close({ success: true });
            }
          },
          error: (err: HttpErrorResponse) => {
            this.dialogRef.close({ success: false, error: err });
          },
        });
      }
    }
  }

  ngOnInit(): void {
    const faceAuthUrl = this.dataStoreService.isDeviceMobile()
      ? this.data.faceAuthParams?.faceAuthUrl
      : this.data.faceAuthParams?.faceAuthUrlQR;

    console.log('faceAuthUrl', faceAuthUrl);

    if (faceAuthUrl) {
      const sanitizedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(faceAuthUrl);
      this.safeUrl = sanitizedUrl;
    }
  }

  cancel() {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {}
}
