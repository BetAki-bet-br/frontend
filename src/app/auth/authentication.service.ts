import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DataStoreService } from '@app/@core';
import { Logger } from '@app/@shared/logger.service';
import { ConfirmationInstructionsData, RegisterData, UnlockInstructionsData } from '@app/@shared/models';
import { GoogleTagManagerImplementationService } from '@app/@shared/services/google-tag-manager-implementation.service';
import { I18nService } from '@app/i18n';
import {
  AUTH_GATEWAY,
  AuthChallenge,
  AuthSession,
  FaceAuthOutcome,
  FaceAuthTicket,
  ResetPasswordInput,
} from '@app/@core/gateway';
import { catchError, finalize, map, Observable, of, switchMap } from 'rxjs';
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
  private readonly gateway = inject(AUTH_GATEWAY);
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
    loginFaceAuth: FaceAuthTicket | null;
    lastLoginTime: string | undefined | null;
  }> {
    return this.gateway
      .login({
        username: context.username,
        password: context.password,
        deviceFingerprintId: context.fingerprintRequestId,
      })
      .pipe(
        switchMap((session) => {
          const credentials = this.toCredentials(session);

          // A gateway that demands biometry at login hands out the url in a second call.
          return credentials.faceAuthRequired
            ? this.gateway
                .startLoginFaceAuth()
                .pipe(map((loginFaceAuth) => ({ credentials, loginFaceAuth, lastLoginTime: session.lastLoginAt })))
            : of({ credentials, loginFaceAuth: null as FaceAuthTicket | null, lastLoginTime: session.lastLoginAt });
        }),
        switchMap(({ credentials, loginFaceAuth, lastLoginTime }) => {
          // Clear the games data, as logged in users can have different games as anonymous
          return this.credentialsService.setCredentials(credentials).pipe(
            map((stored) => {
              if (!stored) {
                throw new Error('Error saving credentials');
              }
              // Push GTM event tag - User Login successful
              this.googleTagManagerServiceImpl.pushGtmTag({ event: 'login' });
              return { credentials, loginFaceAuth, lastLoginTime };
            }),
          );
        }),
        switchMap(({ credentials, loginFaceAuth, lastLoginTime }) =>
          this.playerPromoService.handlePromoActivation().pipe(
            map(() => ({ credentials, loginFaceAuth, lastLoginTime })),
            catchError(() => of({ credentials, loginFaceAuth, lastLoginTime })),
          ),
        ),
        catchError((err) => {
          log.debug('Login failed with error:', err);
          throw err;
        }),
      );
  }

  /**
   * Turns what the gateway said into the credentials the rest of the app stores.
   *
   * `Credentials` predates the gateway port and keeps its flags, so the challenge list is flattened
   * back into them here rather than in every screen.
   */
  private toCredentials(session: AuthSession): Credentials {
    const challenge = <K extends AuthChallenge['kind']>(kind: K) =>
      session.challenges.find((c): c is Extract<AuthChallenge, { kind: K }> => c.kind === kind);

    const verification = challenge('identity-verification');

    return {
      username: session.username,
      jwt: '',
      sessionKey: session.sessionToken,
      // `Credentials.userId` is numeric for historical reasons; a gateway that issues non-numeric
      // player ids needs that field widened before it can be plugged in.
      userId: Number(session.playerId) || 0,
      renewalToken: '',
      lastLoginTime: session.lastLoginAt,
      logonTime: session.loggedInAt,
      updatedTCActionId: challenge('accept-updated-terms')?.actionId,
      faceAuthRequired: !!challenge('face-auth'),
      playerVerificationRequired: !!verification,
      referenceId: verification?.referenceId,
      reverificationURL: verification?.url,
      quickResponseCodeReverificationUrl: verification?.qrCodeUrl,
    };
  }

  /**
   * Registers the user and calls login.
   * @param registerData The Register parameters.
   * @return The user credentials.
   */
  register(registerData: RegisterData): Observable<{
    credentials: Credentials;
    loginFaceAuth: FaceAuthTicket | null;
    lastLoginTime: string | undefined | null;
  } | null> {
    return this.gateway
      .register({
        username: registerData.username,
        email: registerData.email,
        password: registerData.password,
        cpf: registerData.cpf,
        dateOfBirth: registerData.dateOfBirth,
        phone: registerData.phone,
        promotionalOffers: registerData.promotionalOffers,
        deviceFingerprintId: registerData.fingerprintRequestId,
        affiliate: registerData.trackingSource,
      })
      .pipe(
        catchError((err) => {
          log.debug('register error', err);
          throw {
            error: this.translateService.instant(err?.error?.errorMessage) ?? '',
            call: 'register',
          };
        }),
        switchMap((result) => {
          log.debug('created player', result);

          if (result.playerId) {
            // Push GTM event tag - User Registration successful
            this.googleTagManagerServiceImpl.pushGtmTag({ event: 'user_register' });
          }

          // Sign the new player in through the same path a returning one takes, so the session
          // bookkeeping happens in exactly one place.
          return this.login({
            username: registerData.cpf,
            password: registerData.password,
            fingerprintRequestId: registerData?.fingerprintRequestId,
          });
        }),
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
  forgotPassword(cpf: string): Observable<FaceAuthTicket> {
    return this.gateway.requestPasswordReset(cpf);
  }

  /**
   * Changes users password if forgotten
   * @param resetPasswordData The reset password parameters.
   * @return
   */
  changePasswordForgot(resetPasswordData: ResetPasswordInput): Observable<boolean> {
    return this.gateway.resetPassword({
      newPassword: resetPasswordData.newPassword,
      secureKey: resetPasswordData.secureKey,
    });
  }

  /**
   * Resets users password.
   * @param unlockInstructionsData The unlock instructions parameters.
   * @return
   */
  unlockInstructions(unlockInstructionsData: UnlockInstructionsData): Observable<boolean> {
    return this.gateway.resendUnlockInstructions(unlockInstructionsData.email);
  }

  /**
   * Resends confirmation instructions.
   * @param confirmationInstructionsData The confirmation instructions parameters.
   * @return
   */
  confirmationInstructions(confirmationInstructionsData: ConfirmationInstructionsData): Observable<boolean> {
    return this.gateway.resendConfirmationInstructions(confirmationInstructionsData.email);
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
      ret$ = this.gateway.logout().pipe(
        catchError((err) => {
          log.debug('logout() returned error:', err);

          return of();
        }),
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
      }),
    );
  }

  /**
   * Resolves the outcome of a biometry check. The gateway is the one that knows whether it has to
   * poll for it, so this only forwards.
   */
  getFaceAuthenticationStatus(providerId: string): Observable<FaceAuthOutcome> {
    log.debug('getFaceAuthenticationStatus invoked with providerId:', providerId);
    return this.gateway.faceAuthenticationStatus(providerId);
  }

  private clearUserData() {
    this.dataStoreService.clearConfigurationCache();
    this.credentialsService.setCredentials();
  }
}
