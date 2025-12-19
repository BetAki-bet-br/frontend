import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DataStoreService } from '@app/@core';
import { Logger } from '@app/@shared/logger.service';
import { PaymentsService } from '@app/@shared/services/payment.service';
import { AuthenticationService } from '@app/auth';
import { FaceAuthParams } from '@app/auth/auth-dialog.service';
import {
  FaceAuthenticationProcessStatusEnum,
  WithdrawalFaceAuthProcessResponse,
} from '@icore/ngx-portalgateway-api-client-atl';

const log = new Logger('FaceAuthenticatorDialogComponent');

export interface FaceAuthenticatorDialogData {
  faceAuthParams: FaceAuthParams;
  isWithdrawal?: boolean;
}

export interface FaceAuthenticatorDialogResult {
  success: boolean;
  error?: HttpErrorResponse;
}

export type FaceAuthenticatorDialogResultType = FaceAuthenticatorDialogResult | WithdrawalFaceAuthProcessResponse;

@Component({
  selector: 'app-face-authenticator-dialog',
  templateUrl: './face-authenticator-dialog.component.html',
  styleUrls: ['./face-authenticator-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaceAuthenticatorDialogComponent implements OnInit, OnDestroy {
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
        this.paymentsService.getWithdrawalFaceAuthenticationStatus(providerId).subscribe((result) => {
          log.debug('Withdrawal face authentication status:', result);
          if (result?.withdrawalFacialAuthProcessStatus === FaceAuthenticationProcessStatusEnum.Approved) {
            this.dialogRef.close(result);
          }
        });
      } else {
        this.authenticationService.getFaceAuthenticationStatus(providerId).subscribe({
          next: (result) => {
            if (result?.status === FaceAuthenticationProcessStatusEnum.Approved) {
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

  constructor(
    private dialogRef: DialogRef<FaceAuthenticatorDialogResultType>,
    @Inject(DIALOG_DATA) private data: FaceAuthenticatorDialogData,
    private authenticationService: AuthenticationService,
    private paymentsService: PaymentsService,
    private dataStoreService: DataStoreService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const faceAuthUrl = this.dataStoreService.isDeviceMobile()
      ? this.data.faceAuthParams?.faceAuthUrl
      : this.data.faceAuthParams?.faceAuthUrlQR;

    if (faceAuthUrl) {
      const sanitizedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(faceAuthUrl);
      this.safeUrl = sanitizedUrl;
    }

    // window.addEventListener(
    //   'message',
    //   (event) => {
    //     // const actionName = event?.data?.name;
    //     // const responseCode = event?.data?.status;
    //     // const providerId = this.data.faceAuthParams.providerId;
    //     // const isWithdrawal = this.data.isWithdrawal;
    //     // if ((actionName === 'faceindex' || actionName === 'facematch') && responseCode === 'success') {
    //     //   this.isLoading = true;
    //     //   this.cdr.markForCheck();
    //     //   if (isWithdrawal) {
    //     //     this.paymentsService.getWithdrawalFaceAuthenticationStatus(providerId).subscribe((result) => {
    //     //       log.debug('Withdrawal face authentication status:', result);
    //     //       if (result?.withdrawalFacialAuthProcessStatus === FaceAuthenticationProcessStatusEnum.Approved) {
    //     //         this.dialogRef.close(result);
    //     //       }
    //     //     });
    //     //   } else {
    //     //     this.authenticationService.getFaceAuthenticationStatus(providerId).subscribe({
    //     //       next: (result) => {
    //     //         window.removeEventListener('message', (event) => {}, false);

    //     //         if (result?.status === FaceAuthenticationProcessStatusEnum.Approved) {
    //     //           this.dialogRef.close({ success: true });
    //     //         }
    //     //       },
    //     //       error: (err: HttpErrorResponse) => {
    //     //         window.removeEventListener('message', (event) => {}, false);

    //     //         this.dialogRef.close({ success: false, error: err });
    //     //       },
    //     //     });
    //     //   }
    //     // }
    //   },
    //   false
    // );
  }

  cancel() {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {}
}
