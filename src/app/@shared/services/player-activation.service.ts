import { Injectable, inject } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { CheckUserRegistrationReturn, PlayerService } from '@icore/ngx-portalgateway-api-client-atl';
import { catchError, filter, map, Observable, of, switchMap, take, tap } from 'rxjs';
import { Logger } from '../logger.service';
import {
  PlayerActivationDialogComponent,
  PlayerActivationDialogResult,
} from '../components/player-activation-dialog/player-activation-dialog.component';
import { Dialog } from '@angular/cdk/dialog';
import { AuthDialogService, FaceAuthParams } from '@app/auth/auth-dialog.service';
import { MessageDialogComponent } from '../components/message-dialog/message-dialog.component';
import { AUTH_GATEWAY, PLAYER_GATEWAY } from '@app/@core/gateway';
import { Credentials, CredentialsService } from '@app/auth';
import { DataStoreService } from '@app/@core';
import { GoogleTagManagerImplementationService } from './google-tag-manager-implementation.service';
import { SnackbarService } from '@app/@core/snackbar.service';
import { TranslateService } from '@ngx-translate/core';

const log = new Logger('PlayerActivationService');

@Injectable({
  providedIn: 'root',
})
export class PlayerActivationService {
  private activatedRoute = inject(ActivatedRoute);
  private playerServiceApi = inject(PlayerService);
  private authGateway = inject(AUTH_GATEWAY);
  private playerGateway = inject(PLAYER_GATEWAY);
  private dialog = inject(Dialog);
  private authDialog = inject(AuthDialogService);
  private dataStoreService = inject(DataStoreService);
  private credentialsService = inject(CredentialsService);
  private googleTagManagerServiceImpl = inject(GoogleTagManagerImplementationService);
  private router = inject(Router);
  private snackbarService = inject(SnackbarService);
  private translateService = inject(TranslateService);

  /**
   * Handle email activation urls.
   */

  processEmailActivationUrl(): Observable<CheckUserRegistrationReturn> {
    return this.activatedRoute.queryParams.pipe(
      filter((params: Params) => params['emailverificationtoken']),
      take(1),
      switchMap((params) => {
        const activationtoken: string = params['emailverificationtoken'];

        return this.playerServiceApi.apiPortalV1PlayerEmailVerificationPut(activationtoken).pipe(
          catchError((error) => {
            log.debug('Player activation failed: ', error);
            const dialogRef = this.dialog.open(MessageDialogComponent, {
              width: '31.125rem',
              data: {
                title: this.translateService.instant('Player activation failed'),
                description: this.translateService.instant(
                  'There was a problem with the activation process, please contact support.',
                ),
              },
            });

            return dialogRef.closed.pipe(
              switchMap(() => {
                this.router.navigate([], {
                  relativeTo: this.activatedRoute,
                });

                throw error;
              }),
            );
          }),
          tap(() => {
            this.router.navigate(['/users/email-verified'], {
              state: {
                emailVerified: true,
              },
            });

            return of(null);
          }),
        );
      }),
    );
  }

  /**
   * Handle activation urls.
   */
  processActivationUrl(): Observable<CheckUserRegistrationReturn> {
    return this.activatedRoute.queryParams.pipe(
      filter((params: Params) => params['activationtoken']),
      take(1),
      switchMap((params) => {
        const activationtoken: string = params['activationtoken'];

        return this.playerServiceApi
          .apiPortalV1PlayerActivatePost({
            secureToken: activationtoken,
          })
          .pipe(
            catchError((error) => {
              log.debug('Player activation failed: ', error);
              const dialogRef = this.dialog.open(MessageDialogComponent, {
                width: '31.125rem',
                data: {
                  title: this.translateService.instant('Player activation failed'),
                  description: this.translateService.instant(
                    'There was a problem with the activation process, please contact support.',
                  ),
                },
              });

              return dialogRef.closed.pipe(
                switchMap(() => {
                  this.router.navigate([], {
                    relativeTo: this.activatedRoute,
                  });

                  throw error;
                }),
              );
            }),
            tap(() => {
              const dialogRef = this.dialog.open<PlayerActivationDialogResult>(PlayerActivationDialogComponent, {
                width: '31.125rem',
              });

              return dialogRef.closed.pipe(
                tap((result) => {
                  this.router.navigate([], {
                    relativeTo: this.activatedRoute,
                  });

                  // if (result?.closeEvent === 'signIn') {
                  //   return this.authDialog.loginDialog();
                  // } else {
                  return of(result);
                  //}
                }),
              );
            }),
          );
      }),
    );
  }

  /**
   * Handle inactive account urls.
   */
  processInactiveUrl() {
    return this.activatedRoute.queryParams.pipe(
      filter((params: Params) => params['inactiveactivationtoken']),
      take(1),
      switchMap((params) => {
        const token: string = params['inactiveactivationtoken'];

        // Step 1: Activate the inactive player
        return this.playerServiceApi
          .apiPortalV1PlayerActivateInactivePost({
            token: token,
          })
          .pipe(
            switchMap((activationResult) => {
              // Step 2: Retrieve player details
              return this.playerGateway.getProfile().pipe(
                switchMap((player) => {
                  const credentials: Credentials = {
                    username: player?.username || '',
                    jwt: '',
                    sessionKey: activationResult.logonSession?.sessionToken || '',
                    userId: activationResult.logonSession?.playerId || 0,
                    renewalToken: '',
                    faceAuthRequired: activationResult.statusCode === 'FacialAuthenticationRequired',
                    updatedTCActionId:
                      activationResult?.messages?.find((o) => o.messageType === 'LoginPopup')?.id ?? undefined,
                  };

                  // Step 3: Handle facial authentication if required
                  if (activationResult.statusCode === 'FacialAuthenticationRequired') {
                    return this.authGateway.startLoginFaceAuth().pipe(
                      switchMap((loginFaceAuth) => {
                        if (loginFaceAuth?.referenceId) {
                          const faceAuthParams: FaceAuthParams = {
                            providerId: loginFaceAuth.referenceId,
                            faceAuthUrl: loginFaceAuth.url ?? undefined,
                            faceAuthUrlQR: loginFaceAuth?.qrCodeUrl ?? undefined,
                          };
                          return this.authDialog
                            .openFaceAuthDialog(faceAuthParams)
                            .pipe(map(() => ({ credentials, loginFaceAuth })));
                        }
                        return of({ credentials, loginFaceAuth });
                      }),
                    );
                  }

                  return of({ credentials, loginFaceAuth: null });
                }),
              );
            }),
            switchMap(({ credentials, loginFaceAuth }) => {
              // Step 4: Clear games data and set credentials

              // set credentials to credentials service
              return this.credentialsService.setCredentials(credentials).pipe(
                map((setResult) => {
                  if (!setResult) {
                    throw new Error('Error saving credentials');
                  }

                  // Push GTM event tag
                  this.googleTagManagerServiceImpl.pushGtmTag({ event: 'login' });
                  return { credentials, loginFaceAuth };
                }),
              );
            }),
            switchMap(({ credentials, loginFaceAuth }) => {
              // Handle updated terms and conditions if needed
              if (credentials?.updatedTCActionId != null) {
                return this.authDialog.openTermsAndConditionsDialog(credentials.updatedTCActionId);
              }
              return of();
            }),
            tap(() => {
              // Step 5: Navigate to the current route
              this.router.navigate([], {
                relativeTo: this.activatedRoute,
              });
            }),
            catchError((error) => {
              // Step 6: Handle errors and show a dialog
              log.debug('Player activation failed: ', error);

              const dialogRef = this.dialog.open(MessageDialogComponent, {
                width: '31.125rem',
                data: {
                  title: this.translateService.instant('Player activation failed'),
                  description: this.translateService.instant(
                    'There was a problem with the activation process, please contact support.',
                  ),
                },
              });

              return dialogRef.closed.pipe(
                switchMap(() => {
                  this.router.navigate([], {
                    relativeTo: this.activatedRoute,
                  });

                  throw error;
                }),
              );
            }),
          );
      }),
    );
  }

  /**
   * Handle activation urls.
   */
  processAnnualIncomeReportUrl(): Observable<CheckUserRegistrationReturn> {
    return this.activatedRoute.queryParams.pipe(
      filter((params: Params) => params['annualincometoken']),
      take(1),
      switchMap((params) => {
        const annualincometoken: string = params['annualincometoken'];

        return this.playerServiceApi.apiPortalV1PlayerAnnualReportConfirmPost(annualincometoken).pipe(
          tap(() => {
            this.router.navigate([], {
              relativeTo: this.activatedRoute,
            });

            this.snackbarService.openCustomSuccess(
              this.translateService.instant('Annual income report successfully confirmed'),
              'center',
              'top',
            );
          }),
          catchError((error) => {
            log.debug('Annual income report confirmation error: ', error);
            const dialogRef = this.dialog.open(MessageDialogComponent, {
              width: '31.125rem',
              data: {
                title: 'Annual income report confirmation failed',
                description:
                  'There was a problem with the annual income report confirmation process, please contact support. ',
              },
            });

            return dialogRef.closed.pipe(
              switchMap(() => {
                this.router.navigate([], {
                  relativeTo: this.activatedRoute,
                });

                throw error;
              }),
            );
          }),
        );
      }),
    );
  }

  processRedirectUrl(): Observable<any> {
    return this.activatedRoute.queryParams.pipe(
      filter((params: Params) => params['redirect']),
      take(1),
      switchMap((params) => {
        const redirectUrl: string = params['redirect'];

        switch (redirectUrl) {
          case 'login':
            this.router.navigate(['/sign-in']);
            break;
          default:
            break;
        }

        return of();
      }),
    );
  }
}
