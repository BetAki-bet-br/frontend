import { Dialog } from '@angular/cdk/dialog';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DataStoreService } from '@app/@core';
import { ConfigurationService } from '@app/@core/configuration.service';
import {
  AUTH_GATEWAY,
  FaceAuthTicket,
  MESSAGES_GATEWAY,
  PlayerVerificationStatuses,
  TransactionStatus,
  WithdrawalOutcome,
} from '@app/@core/gateway';
import { SnackbarService } from '@app/@core/snackbar.service';
import { Logger } from '@app/@shared';
import {
  FaceAuthenticatorDialogComponent,
  FaceAuthenticatorDialogData,
  FaceAuthenticatorDialogResult,
  FaceAuthenticatorDialogResultType,
} from '@app/@shared/components/face-authenticator-dialog/face-authenticator-dialog.component';

import { AnnualVerificationDialogComponent } from '@app/@shared/components/annual-verification-dialog/annual-verification-dialog.component';
import {
  ProcessVerificationDialogComponent,
  ProcessVerificationDialogData,
  ProcessVerificationResultEnum,
} from '@app/@shared/components/process-verification-dialog/process-verification-dialog.component';
import { PopupMessagesService } from '@app/@shared/services/popup-messages.service';
import { PlayerProfileService } from '@app/player-profile/player-profile.service';
import { catchError, finalize, first, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { AuthenticationService } from './authentication.service';
import { CredentialsService } from './credentials.service';
import {
  TermsAndConditionsUpdatedDialogComponent,
  TermsAndConditionsUpdatedDialogResult,
} from './login/terms-and-conditions-updated-dialog/terms-and-conditions-updated-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { WithdrawalError } from '@app/@shared/models';

const log = new Logger('AuthDialogService');

export interface FaceAuthParams {
  providerId: string;
  faceAuthUrl?: string;
  faceAuthUrlQR?: string;
}

export interface AccountVerificationData {
  updatedTCActionId?: number;
  lastLoginTime?: string | null;
  redirectToSportsbook?: boolean;
}

export interface InitAccountVerificationResponse {
  canPlayGame?: boolean;
  canDeposit?: boolean;
  success?: boolean;
}

export enum AccountVerificationActionEnum {
  AccountVerification = 1,
  Account,
  Login,
  Deposit,
  Withdrawal,
  GameLaunch,
  SBBet,
}

@Injectable({
  providedIn: 'root',
})
export class AuthDialogService {
  private messagesGateway = inject(MESSAGES_GATEWAY);
  private credentialsService = inject(CredentialsService);
  private authenticationService = inject(AuthenticationService);
  private configurationService = inject(ConfigurationService);
  private playerProfileService = inject(PlayerProfileService);
  private authGateway = inject(AUTH_GATEWAY);
  private dataStoreService = inject(DataStoreService);
  private snackbarService = inject(SnackbarService);
  private dialog = inject(Dialog);
  private router = inject(Router);
  private popupMessageService = inject(PopupMessagesService);
  private translate = inject(TranslateService);
  initAccountVerificationWithParams(
    accountVerificationAction: AccountVerificationActionEnum,
    faceAuthParams: FaceAuthParams,
    data?: AccountVerificationData,
  ): Observable<InitAccountVerificationResponse> {
    log.debug(
      'initAccountVerificationWithParams invoked with action:',
      accountVerificationAction,
      'and params:',
      faceAuthParams,
      'and data:',
      data,
    );

    const api$: Observable<PlayerVerificationStatuses | null> =
      accountVerificationAction !== AccountVerificationActionEnum.Login
        ? this.playerProfileService.getPlayerVerificationStatus()
        : of(null);

    return api$.pipe(
      switchMap((playerVerificationStatus) => {
        // If face authentication params exist
        return this.openFaceAuthDialog(
          faceAuthParams,
          accountVerificationAction === AccountVerificationActionEnum.Withdrawal,
        ).pipe(
          switchMap((success) => {
            if (accountVerificationAction === AccountVerificationActionEnum.Login) {
              // Update TC and update player locale
              if (data?.updatedTCActionId != null) {
                return this.handleUpdatedTCAction(data?.updatedTCActionId);
              }
              return this.updatePlayerLocaleAndReturnResult();
            }

            return of(success);
          }),
          switchMap((success) => {
            // If player needs additional verification, open process verification dialog
            if (
              accountVerificationAction !== AccountVerificationActionEnum.Account &&
              playerVerificationStatus?.calculatedStatus === false &&
              !data?.redirectToSportsbook
            ) {
              if (playerVerificationStatus?.kycAnnualVerificationRequired) {
                return this.initAnnualVerificationDialog().pipe(
                  switchMap((success) => {
                    return of({ success });
                  }),
                );
              } else {
                return this.initProcessVerificationDialog(
                  accountVerificationAction === AccountVerificationActionEnum.Withdrawal,
                ).pipe(
                  switchMap((success) => {
                    return of({ success });
                  }),
                );
              }
            }

            return of({ success: !!success });
          }),
        );
      }),
    );
  }

  initAccountVerification(
    accountVerificationAction: AccountVerificationActionEnum,
    data?: AccountVerificationData,
  ): Observable<InitAccountVerificationResponse> {
    return this.playerProfileService.getPlayerVerificationStatus().pipe(
      switchMap((playerVerificationStatus) => {
        // Do login resolve
        if (accountVerificationAction === AccountVerificationActionEnum.Login) {
          if (data?.updatedTCActionId != null) {
            return this.handleUpdatedTCAction(data.updatedTCActionId).pipe(
              // Last session dialog removed adhoc, per customer request
              // switchMap(() => this.openLastLoginDialog(data?.lastLoginTime ?? null)),
              switchMap(() => {
                // If player needs additional verification, open process verification dialog
                if (playerVerificationStatus?.calculatedStatus === false && !data?.redirectToSportsbook) {
                  if (playerVerificationStatus?.kycAnnualVerificationRequired) {
                    return this.initAnnualVerificationDialog().pipe(
                      switchMap((success) => {
                        return of({ success });
                      }),
                    );
                  } else {
                    return this.initProcessVerificationDialog(false).pipe(
                      switchMap((success) => {
                        return of({ success });
                      }),
                    );
                  }
                } else {
                  return of({ success: true });
                }
              }),
            );
          }
          return forkJoin({
            player: this.updatePlayerLocaleAndReturnResult(),
            // Last session dialog removed adhoc, per customer request
            // lastLogin: this.openLastLoginDialog(data?.lastLoginTime ?? null),
          }).pipe(
            switchMap(() => {
              // If player needs additional verification, open process verification dialog
              if (playerVerificationStatus?.calculatedStatus === false && !data?.redirectToSportsbook) {
                if (playerVerificationStatus?.kycAnnualVerificationRequired) {
                  return this.initAnnualVerificationDialog().pipe(
                    switchMap((success) => {
                      return of({ success });
                    }),
                  );
                }
                // If kycAnnualVerificationRequired is false, open process verification dialog
                return this.initProcessVerificationDialog(false).pipe(
                  switchMap((success) => {
                    return of({ success });
                  }),
                );
              } else {
                return of({ success: true });
              }
            }),
          );
        }

        /**
         * If player needs additional verification, open process verification dialog
         * also opens on AccountVerification if kycAnnualVerificationRequired is false
         * also opens on kycAnnualVerificationRequired is true
         */
        if (
          playerVerificationStatus?.calculatedStatus === false ||
          (accountVerificationAction === AccountVerificationActionEnum.AccountVerification &&
            playerVerificationStatus?.kycAnnualVerificationRequired === false) ||
          playerVerificationStatus?.kycAnnualVerificationRequired === true
        ) {
          if (playerVerificationStatus?.kycAnnualVerificationRequired) {
            return this.initAnnualVerificationDialog().pipe(
              switchMap((success) => {
                return of({ success });
              }),
            );
          }

          return this.initProcessVerificationDialog(
            accountVerificationAction === AccountVerificationActionEnum.Withdrawal,
          ).pipe(
            switchMap((success) => {
              return of({ success });
            }),
          );
        }

        if (
          playerVerificationStatus?.calculatedStatus === true &&
          !playerVerificationStatus?.email &&
          accountVerificationAction === AccountVerificationActionEnum.Withdrawal
        ) {
          return this.initProcessVerificationDialog(true).pipe(
            switchMap((success) => {
              return of({ success });
            }),
          );
        }

        // When launching game
        if (accountVerificationAction === AccountVerificationActionEnum.GameLaunch) {
          return of({ canPlayGame: true });
        }

        // When deposit
        if (accountVerificationAction === AccountVerificationActionEnum.Deposit) {
          return of({ canDeposit: true });
        }

        if (accountVerificationAction === AccountVerificationActionEnum.Withdrawal) {
          return of({ success: true });
        }

        return of({ success: false });
      }),
    );
  }

  initProcessVerificationDialog(isWithdrawalProcess: boolean): Observable<boolean> {
    log.debug('initProcessVerificationDialog invoked');
    return this.openProcessVerificationDialog(isWithdrawalProcess).pipe(
      switchMap((result) => {
        let api$: Observable<FaceAuthTicket | null> = of(null);

        if (result === ProcessVerificationResultEnum.KYC) {
          api$ = this.playerProfileService.playerReverification();
        } else if (result === ProcessVerificationResultEnum.Address) {
          // It redirects to player profile
          this.router.navigate(['profile/general/info'], { state: { openAddress: true } });
        } else if (result === ProcessVerificationResultEnum.Email) {
          api$ = this.playerProfileService.verifyPlayerContactInfo('email').pipe(
            switchMap((result) => {
              this.snackbarService.openCustomSuccess(
                this.translate.instant('Email verification code resent successfully'),
                'center',
                'top',
                4000,
              );
              localStorage.setItem('emailVerificationTimestamp', Date.now().toString());

              this.router.navigate(['/profile/email-verification'], {
                state: {
                  emailVerification: true,
                },
              });
              return of(null);
            }),
          );
        } else if (result === ProcessVerificationResultEnum.PhoneNumber) {
          // This is not relevant for now
          // api$ = this.playerServiceApi.apiPortalV1PlayerContactInfoVerificationPost(2);
        } else if (isWithdrawalProcess) {
          api$ = of();
        }
        // else {
        //   api$ = of();
        // }

        return api$;
      }),
      switchMap((result) => {
        /**
         * if referenceId exists open face authentication dialog
         * else do nothing
         */

        if (result && result?.referenceId) {
          const faceAuthParams: FaceAuthParams = {
            providerId: result.referenceId,
            faceAuthUrl: result?.url ?? undefined,
            faceAuthUrlQR: result?.qrCodeUrl ?? undefined,
          };
          // Open face authentication dialog
          return this.openFaceAuthDialog(faceAuthParams);
        }

        return of(false);
      }),
    );
  }

  initRegistrationVerification() {
    return this.playerProfileService.playerReverification().pipe(
      switchMap((result) => {
        if (result && result?.referenceId) {
          const faceAuthParams: FaceAuthParams = {
            providerId: result.referenceId,
            faceAuthUrl: result?.url ?? undefined,
            faceAuthUrlQR: result?.qrCodeUrl ?? undefined,
          };
          // Open face authentication dialog
          return this.openFaceAuthDialog(faceAuthParams);
        }

        return of(false);
      }),
    );
  }

  initAnnualVerificationDialog(): Observable<boolean> {
    return this.openAnnualVerificationDialog().pipe(
      switchMap((result) => {
        return of(result);
      }),
    );
  }

  openProcessVerificationDialog(isWithdrawalProcess: boolean): Observable<ProcessVerificationResultEnum | null> {
    // open dialog
    const dialogRef = this.dialog.open<
      ProcessVerificationResultEnum,
      ProcessVerificationDialogData,
      ProcessVerificationDialogComponent
    >(ProcessVerificationDialogComponent, {
      disableClose: true,
      autoFocus: false,
      data: {
        isWithdrawalProcess,
      },
    });

    // on dialog closed
    return dialogRef.closed.pipe(switchMap((result) => of(result ?? null)));
  }

  openAnnualVerificationDialog(): Observable<boolean> {
    const dialogRef = this.dialog.open(AnnualVerificationDialogComponent, {
      disableClose: true,
      autoFocus: false,
    });

    return dialogRef.closed.pipe(switchMap((result) => of(!!result)));
  }

  openFaceAuthDialog(faceAuthParams: FaceAuthParams, isWithdrawal?: boolean): Observable<boolean> {
    log.debug('openFaceAuthDialog invoked with params:', faceAuthParams, 'isWithdrawal:', isWithdrawal);
    if (!faceAuthParams?.faceAuthUrl) {
      // If there is no url, call getFaceAuthenticationStatus
      return this.authenticationService.getFaceAuthenticationStatus(faceAuthParams.providerId).pipe(
        // First that matches 'Approved' will go trough
        first((result) => {
          log.debug('Get face authentication status result:', result);
          return result === 'approved';
        }),
        switchMap(() => of(true)),
        catchError((err) => {
          log.debug('Get face authentication status failed with error:', err);
          throw err;
          return of(false);
        }),
      );
    }

    // open dialog
    const dialogRef = this.dialog.open<
      FaceAuthenticatorDialogResultType,
      FaceAuthenticatorDialogData,
      FaceAuthenticatorDialogComponent
    >(FaceAuthenticatorDialogComponent, {
      disableClose: true,
      data: {
        faceAuthParams,
        isWithdrawal,
      },
    });

    this.popupMessageService.canDisplayMessage = false;

    // on dialog closed
    return dialogRef.closed.pipe(
      switchMap((result) => {
        this.popupMessageService.canDisplayMessage = true;

        if (isWithdrawal) {
          const outcome = result as WithdrawalOutcome | undefined;
          if (outcome) {
            log.debug('Withdrawal face authentication dialog result:', outcome);
            // for withdrawal, only 'Paid' or 'Pending' payment statuses mark a successfull withdrawal transaction,
            // for others, throw error
            if (outcome.status === TransactionStatus.Paid || outcome.status === TransactionStatus.Pending) {
              return this.credentialsService.resetFaceAuthRequired().pipe(map(() => true));
            } else {
              // throw error, but first reset face auth required
              return this.credentialsService.resetFaceAuthRequired().pipe(
                map(() => {
                  throw new WithdrawalError(outcome.status ?? '');
                }),
              );
            }
          }
          return of(false);
        } else {
          if ((result as FaceAuthenticatorDialogResult)?.success) {
            return this.credentialsService.resetFaceAuthRequired().pipe(map(() => true));
          }
          return of(false);
        }
      }),
    );
  }

  openTermsAndConditionsDialog(updatedTCActionId: number): Observable<boolean> {
    const dialogRef = this.dialog.open<
      TermsAndConditionsUpdatedDialogResult,
      TermsAndConditionsUpdatedDialogComponent,
      TermsAndConditionsUpdatedDialogComponent
    >(TermsAndConditionsUpdatedDialogComponent, {
      disableClose: true,
      autoFocus: false,
    });

    localStorage.setItem('T&C_ActionId', updatedTCActionId.toString());

    return dialogRef.closed.pipe(
      switchMap((res) => {
        if (res?.acceptTC && updatedTCActionId != null) {
          localStorage.removeItem('T&C_ActionId');

          return this.messagesGateway.resolveAction(updatedTCActionId).pipe(
            switchMap(() => {
              log.debug('the gateway accepted the updated terms');
              return of(true);
            }),
            catchError((err) => {
              log.debug('handleMessage() returned error:', err);

              return of(false);
            }),
          );
        }

        // If T&C not accepted clear user data and logout user
        this.dataStoreService.clearConfigurationCache();
        this.credentialsService.setCredentials();
        localStorage.removeItem('T&C_ActionId');

        return this.authGateway.logout().pipe(
          switchMap(() => {
            log.debug('logout() returned from the gateway');
            return of(true);
          }),
          catchError((err) => {
            log.debug('logout() returned error:', err);

            return of(false);
          }),
          finalize(() => {
            // 'reload' does not trigger reloading of components, but it triggers the NavigationEnd
            // event on routing, so components can handle that if needed
            this.router.navigateByUrl('/', { onSameUrlNavigation: 'reload' });
          }),
        );
      }),
    );
  }

  private updatePlayerLocaleAndReturnResult(): Observable<boolean> {
    return this.configurationService.getPlayerInfo().pipe(
      switchMap((playerInfo) => {
        if (playerInfo?.locale) {
          this.dataStoreService.profileLanguage = playerInfo.locale;
        }
        return of(true);
      }),
    );
  }

  private handleUpdatedTCAction(updatedTCActionId: number): Observable<boolean> {
    return this.openTermsAndConditionsDialog(updatedTCActionId).pipe(
      switchMap(() => this.updatePlayerLocaleAndReturnResult()),
    );
  }
}
