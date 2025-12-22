import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DataStoreService } from '@app/@core';
import { Logger } from '@app/@shared/logger.service';
import { ConfirmationInstructionsData, RegisterData, UnlockInstructionsData } from '@app/@shared/models';
import { GoogleTagManagerImplementationService } from '@app/@shared/services/google-tag-manager-implementation.service';
import { I18nService } from '@app/i18n';
import {
  ChangeForgottenPasswordRequest,
  CreatePlayerRequest,
  FaceAuthenticationProcessStatusEnum,
  FaceAuthProcessResponse,
  FaceAuthResponse,
  LoginRequest,
  MessageTypeEnum,
  PlayerService,
} from '@icore/ngx-portalgateway-api-client-atl';
import { catchError, delay, EMPTY, expand, finalize, map, Observable, of, switchMap, takeLast } from 'rxjs';
import { Credentials, CredentialsService } from './credentials.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthEventsService, AuthEvent } from './auth-events.service';
import { PlayerPromoService } from '@app/@shared/services/player-promo.service';

const log = new Logger('AuthenticationService');

export interface LoginContext {
  /** Can be CPF or email */
  username: string;
  password: string;
  remember?: boolean;
  fingerprintRequestId?: string;
}

export interface OtpContext {
  otpKey: string;
}

export interface ChangePasswordContext {
  pwNew: string;
  pwNewR: string;
}

/**
 * Provides a base for authentication workflow.
 * The login/logout methods should be replaced with proper implementation.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private playerServiceApi = inject(PlayerService);
  private credentialsService = inject(CredentialsService);
  private dataStoreService = inject(DataStoreService);
  private router = inject(Router);
  private googleTagManagerServiceImpl = inject(GoogleTagManagerImplementationService);
  private i18nService = inject(I18nService);
  private translateService = inject(TranslateService);
  private authEventsService = inject(AuthEventsService);
  private playerPromoService = inject(PlayerPromoService);

  /**
   * Authenticates the user.
   * @param context The login parameters.
   * @return The user credentials.
   */
  login(context: LoginContext): Observable<{
    credentials: Credentials;
    loginFaceAuth: FaceAuthResponse | null;
    lastLoginTime: string | undefined | null;
  }> {
    const request: LoginRequest = {
      userName: context.username,
      password: context.password,
      portalId: this.dataStoreService.defaultPortalId,
      deviceFingerprint: context.fingerprintRequestId, // Abused deviceFingerprint parameter to pass fingerprintRequestId string
    };

    return this.playerServiceApi.apiPortalV1PlayerLoginPost(request).pipe(
      switchMap((result) => {
        const credentials: Credentials = {
          username: context.username ?? '',
          jwt: '',
          sessionKey: result.logonSession?.sessionToken ?? '',
          userId: result.logonSession?.playerId ?? 0,
          renewalToken: '',
          lastLoginTime: result.lastLoginTime,
          logonTime: result.logonSession?.logonTime,
          // Terms and conditions
          updatedTCActionId:
            result?.messages
              ?.find((o) => o.messageType === MessageTypeEnum.LoginPopup && o.messageGroup === '15')
              ?.actions?.find((o) => o.actionType == 0)?.id ?? undefined,
          // Required
          faceAuthRequired: result.statusCode === 'FacialAuthenticationRequired',
          playerVerificationRequired:
            result.statusCode === 'ClosedByPlayerVerificationRequired' ||
            result.statusCode === 'SelfExcludedVerificationRequired' ||
            result.statusCode === 'VerificationRequired',
          // For verification iframe
          referenceId: result?.referenceId ?? undefined,
          reverificationURL: result?.reverificationUrl ?? undefined,
          quickResponseCodeReverificationUrl: result?.quickResponseCodeReverificationUrl ?? undefined,
        };

        if (result.statusCode === 'FacialAuthenticationRequired') {
          return this.playerServiceApi
            .apiPortalV1PlayerLoginFaceAuthPost({})
            .pipe(map((loginFaceAuth) => ({ credentials, loginFaceAuth, lastLoginTime: result.lastLoginTime })));
        }

        return of({ credentials, loginFaceAuth: null, lastLoginTime: result.lastLoginTime });
      }),
      switchMap(({ credentials, loginFaceAuth, lastLoginTime }) => {
        // Clear the games data, as logged in users can have different games as anonymous
        this.dataStoreService.clearGamesAndLobbyInfoConfigurationCache();

        return this.credentialsService.setCredentials(credentials).pipe(
          map((result) => {
            // store credentials
            if (result) {
              // Push GTM event tag - User Login successful
              this.googleTagManagerServiceImpl.pushGtmTag({ event: 'login' });
              return { credentials, loginFaceAuth, lastLoginTime };
            } else {
              throw new Error('Error saving credentials');
            }
          })
        );
      }),
      switchMap(({ credentials, loginFaceAuth, lastLoginTime }) => {
        return this.playerPromoService.handlePromoActivation().pipe(
          map(() => {
            return { credentials, loginFaceAuth, lastLoginTime };
          }),
          catchError((err) => {
            return of({ credentials, loginFaceAuth, lastLoginTime });
          })
        );
      }),
      catchError((err) => {
        log.debug('Login failed with error:', err);
        throw err;
      })
    );
  }

  /**
   * Registers the user and calls login.
   * @param registerData The Register parameters.
   * @return The user credentials.
   */
  register(registerData: RegisterData): Observable<{
    credentials: Credentials;
    loginFaceAuth: FaceAuthResponse | null;
    lastLoginTime: string | undefined | null;
  } | null> {
    const request: CreatePlayerRequest = {
      player: {
        userName: registerData.username,
        password: registerData.password,
        eMail: registerData.email,
        firstName: 'N/A',
        lastName: 'N/A',
        dateOfBirth: registerData.dateOfBirth,
        portalId: this.dataStoreService.defaultPortalId,
        countryCode: 'BR',
        currencyCode: 'BRL',
        locale: this.dataStoreService.defaultLanguage,
        receiveNews: true,
        receiveSMSFromOperator: true,
        receiveEmailFromOperator: true,
        customParameters: { CPF: registerData.cpf },
        mobilePhone: registerData.phone,
      },
      trackingSource: registerData.trackingSource,
      deviceFingerprint: registerData.fingerprintRequestId ?? '', //Abused deviceFingerprint parameter to pass fingerprintRequestId string
    };

    return this.playerServiceApi.apiPortalV1PlayerPost(request).pipe(
      catchError((err) => {
        log.debug('register error', err);
        throw {
          error: this.translateService.instant(err?.error?.errorMessage) ?? '',
          call: 'register',
        };
      }),
      switchMap((result) => {
        log.debug('created player', result);

        const loginData: LoginContext = {
          username: registerData.cpf,
          password: registerData.password,
          fingerprintRequestId: registerData?.fingerprintRequestId,
        };

        if (result.playerId)
          // Push GTM event tag - User Registration successful
          this.googleTagManagerServiceImpl.pushGtmTag({ event: 'user_register' });

        return this.login(loginData);
      })
    );
  }

  // onboardingPlayerPlayer(registerData: RegisterData): Observable<string> {
  //   const request: OnboardingRequest = {
  //     cpf: registerData.cpf,
  //     email: registerData.email,
  //     userName: registerData.username,
  //     password: registerData.password,
  //     portalId: this.dataStoreService.defaultPortalId,
  //     countryCode: 'BR',
  //     currencyCode: 'BRL',
  //     locale: this.i18nService.language,
  //     deviceFingerprint: registerData.fingerprintRequestId,
  //     phoneNumber: '',
  //     trackingSource: {
  //       marketingChannel: 'Affiliate',
  //       ...(registerData.trackingSource?.affiliateId
  //         ? { marketingSource: registerData.trackingSource.affiliateId }
  //         : {}),
  //       ...(registerData.trackingSource?.token ? { btag: registerData.trackingSource.token } : {}),
  //     },
  //   };

  //   return this.playerServiceApi.apiPortalV1PlayerOnboardingPost(request).pipe(
  //     map((result) => {
  //       return result.url ?? '';
  //     })
  //   );
  // }

  /**
   * Resets users password.
   * @param cpf CPF number.
   * @return
   */
  forgotPassword(cpf: string): Observable<FaceAuthResponse> {
    return this.playerServiceApi
      .apiPortalV1PlayerForgotPasswordFaceAuthPost({
        cpfNumber: cpf,
        portalId: this.dataStoreService.defaultPortalId,
      })
      .pipe(
        map((result) => {
          return result;
        })
      );
  }

  /**
   * Changes users password if forgotten
   * @param resetPasswordData The reset password parameters.
   * @return
   */
  changePasswordForgot(resetPasswordData: ChangeForgottenPasswordRequest): Observable<boolean> {
    const request: ChangeForgottenPasswordRequest = {
      newPassword: resetPasswordData.newPassword,
      secureKey: resetPasswordData.secureKey,
    };
    return this.playerServiceApi.apiPortalV1PlayerPasswordResetPost(request).pipe(
      map((result) => {
        return result;
      })
    );
  }

  /**
   * Resets users password.
   * @param unlockInstructionsData The unlock instructions parameters.
   * @return
   */
  unlockInstructions(unlockInstructionsData: UnlockInstructionsData): Observable<boolean> {
    return of(true);
    // TODO: need to call real unlockInstructions api
  }

  /**
   * Resends confirmation instructions.
   * @param confirmationInstructionsData The confirmation instructions parameters.
   * @return
   */
  confirmationInstructions(confirmationInstructionsData: ConfirmationInstructionsData): Observable<boolean> {
    return of(true);
    // TODO: need to call real confirmationInstructions api
  }

  /**
   * Login for OTP(one time password)
   * @param context Otp context
   * @returns User credentials
   */
  otpLogin(otpKey: string): Observable<string> {
    /* const request: NativeApiVerifyPlayerTokenRequest = {
      userid: null,
      clientip: '',
      playertokentypeid: 11, // hardcode intended!
      token: otpKey,
      sessiontoken: null,
    };
    const userId: number | null = this.dataStoreService.getCredentials()?.userId ?? null;
    request.userid = userId;
    return this.accountService.apiNativeV1AccountVerifyplayertokenPost(request).pipe(
      map((response: NativeApiBaseResponse) => {
        if (response.statuscode === 'InvalidPlayerTokenTypeId' || response.statuscode === 'InvalidToken') {
          throw { message: this.translateService.instant('2FA failed, invalid token') };
        }
        return response?.statuscode;
      }),
      catchError((err) => {
        log.debug('Login with 2FA() returned error:', err);
        throw err;
      })
    ); */
    return of('Success');
  }

  /**
   * Change password request
   * @param context Data provided from filled form
   * @param changeToken Change password token, obtained at login
   * @returns User credentials
   */
  changePassword(context: ChangePasswordContext, changePwToken: string): Observable<string> {
    /* const request: NativeApiChangePasswordWithToken = {
      newpassword: context.pwNew,
      token: changePwToken,
    };
    return this.accountService.apiNativeV1AccountChangepasswordTokenPost(request).pipe(
      map((response: NativeApiBaseResponse) => {
        if (response.errormessage) {
          if (response.statuscode === 'ChangePasswordTokenNotFound') {
            throw { message: this.translateService.instant('Change password token is invalid or missing') };
          } else {
            throw { message: this.translateService.instant(response.errormessage) };
          }
        }
        return response?.statuscode;
      }),
      catchError((err) => {
        log.debug('Change password request() returned error:', err);
        throw err;
      })
    ); */
    return of('Success');
  }

  // TODO Reset 2FA API doesn't exist!

  /**
   * Logs out the user and clear credentials.
   * @param callApi weather the method also calls the logout api
   */
  logout(callApi: boolean = true): Observable<void> {
    this.clearUserData();

    let ret$: Observable<void> = of();

    if (callApi) {
      ret$ = this.playerServiceApi.apiPortalV1PlayerLogoutPost().pipe(
        map((response) => {
          log.debug('logout() returned from api:', response);
          return undefined;
        }),
        catchError((err) => {
          log.debug('logout() returned error:', err);

          return of();
        })
      );
    }

    return ret$.pipe(
      finalize(() => {
        this.authEventsService.emitEvent(AuthEvent.Logout); // Emit logout event
        // 'reload' does not trigger reloading of components, but it triggers the NavigationEnd
        // event on routing, so components can handle that if needed
        this.router.navigateByUrl('/', { onSameUrlNavigation: 'reload' });

        // OLD
        // // Check if the current route is for authentication and reroute to home if needed.
        // if (this.authGuard.isAuthUrl(this.router.url)) this.router.navigate(['/']);
      })
    );
  }

  getFaceAuthenticationStatus(providerId: string): Observable<FaceAuthProcessResponse | null> {
    log.debug('getFaceAuthenticationStatus invoked with providerId:', providerId);
    return this.playerServiceApi.apiPortalV1PlayerFaceAuthStatusGet(providerId).pipe(
      delay(1000),
      expand((response: FaceAuthProcessResponse) => {
        log.debug('getFaceAuthenticationStatus response:', response);
        if (response.status === FaceAuthenticationProcessStatusEnum.Processing) {
          return this.playerServiceApi.apiPortalV1PlayerFaceAuthStatusGet(providerId).pipe(delay(1000));
        }
        return EMPTY;
      }),
      catchError((error) => {
        log.error(error);
        throw error;
      }),
      takeLast(1)
    );
  }

  private clearUserData() {
    this.dataStoreService.clearConfigurationCache();
    this.credentialsService.setCredentials();
  }
}
