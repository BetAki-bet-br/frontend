import { Injectable, inject } from '@angular/core';
import { DataStoreService } from '@app/@core/data-store.service';
import { Logger } from '@app/@shared/logger.service';
import {
  ChangeForgottenPasswordRequest,
  CreatePlayerRequest,
  FaceAuthProcessResponse,
  FaceAuthResponse,
  FaceAuthenticationProcessStatusEnum,
  LoginRequest,
  MessageTypeEnum,
  PlayerService,
} from '@icore/ngx-portalgateway-api-client-atl';
import { EMPTY, Observable, catchError, delay, expand, map, of, takeLast } from 'rxjs';
import { AuthGateway } from '../auth.gateway';
import {
  AuthChallenge,
  AuthSession,
  FaceAuthOutcome,
  FaceAuthTicket,
  LoginInput,
  PlayerDataField,
  RegisterInput,
  ResetPasswordInput,
} from '../auth.models';

const log = new Logger('ComtradeAuthGateway');

/**
 * `AuthGateway` on top of Comtrade's PortalGateway, through the OpenAPI client generated from
 * `swagger.json` into `@icore/ngx-portalgateway-api-client-atl`.
 *
 * This is the only file in the application allowed to know that a login answers with a
 * `statusCode` of `FacialAuthenticationRequired`, that the pending terms arrive as a login popup
 * message in group 15, or that a player is identified by `portalId` plus a numeric id.
 */
@Injectable()
export class ComtradeAuthGateway implements AuthGateway {
  private readonly api = inject(PlayerService);
  private readonly dataStore = inject(DataStoreService);

  /** Login status codes that mean "prove who you are before you play". */
  private static readonly VERIFICATION_STATUS_CODES = [
    'ClosedByPlayerVerificationRequired',
    'SelfExcludedVerificationRequired',
    'VerificationRequired',
  ];

  /** The message group the gateway uses for a terms-and-conditions update. */
  private static readonly UPDATED_TERMS_MESSAGE_GROUP = '15';

  login(input: LoginInput): Observable<AuthSession> {
    const request: LoginRequest = {
      userName: input.username,
      password: input.password,
      portalId: this.dataStore.defaultPortalId,
      // The gateway has no field for the anti-fraud request id, so it rides on deviceFingerprint.
      deviceFingerprint: input.deviceFingerprintId,
    };

    return this.api.apiPortalV1PlayerLoginPost(request).pipe(
      map((result) => {
        const challenges: AuthChallenge[] = [];

        if (result.statusCode === 'FacialAuthenticationRequired') {
          // The url for this one arrives from `startLoginFaceAuth`, in a second call.
          challenges.push({ kind: 'face-auth' });
        }

        if (ComtradeAuthGateway.VERIFICATION_STATUS_CODES.includes(result.statusCode ?? '')) {
          challenges.push({
            kind: 'identity-verification',
            referenceId: result.referenceId ?? undefined,
            url: result.reverificationUrl ?? undefined,
            qrCodeUrl: result.quickResponseCodeReverificationUrl ?? undefined,
          });
        }

        const termsActionId = result.messages
          ?.find(
            (message) =>
              message.messageType === MessageTypeEnum.LoginPopup &&
              message.messageGroup === ComtradeAuthGateway.UPDATED_TERMS_MESSAGE_GROUP,
          )
          ?.actions?.find((action) => action.actionType === 0)?.id;

        if (termsActionId) {
          challenges.push({ kind: 'accept-updated-terms', actionId: termsActionId });
        }

        return {
          playerId: String(result.logonSession?.playerId ?? 0),
          username: input.username,
          sessionToken: result.logonSession?.sessionToken ?? '',
          lastLoginAt: result.lastLoginTime,
          loggedInAt: result.logonSession?.logonTime,
          challenges,
        } satisfies AuthSession;
      }),
    );
  }

  startLoginFaceAuth(): Observable<FaceAuthTicket | null> {
    return this.api.apiPortalV1PlayerLoginFaceAuthPost({}).pipe(map((response) => this.toTicket(response)));
  }

  register(input: RegisterInput): Observable<{ playerId: string | null }> {
    const request: CreatePlayerRequest = {
      player: {
        userName: input.username,
        password: input.password,
        eMail: input.email,
        // The gateway requires both, and the register form asks for neither.
        firstName: 'N/A',
        lastName: 'N/A',
        dateOfBirth: input.dateOfBirth,
        portalId: this.dataStore.defaultPortalId,
        countryCode: 'BR',
        currencyCode: 'BRL',
        locale: this.dataStore.defaultLanguage,
        receiveNews: input.promotionalOffers,
        receiveSMSFromOperator: input.promotionalOffers,
        receiveEmailFromOperator: input.promotionalOffers,
        customParameters: { CPF: input.cpf },
        mobilePhone: input.phone,
      },
      trackingSource: input.affiliate,
      deviceFingerprint: input.deviceFingerprintId ?? '',
    };

    return this.api
      .apiPortalV1PlayerPost(request)
      .pipe(map((result) => ({ playerId: result.playerId != null ? String(result.playerId) : null })));
  }

  logout(): Observable<void> {
    return this.api.apiPortalV1PlayerLogoutPost().pipe(map(() => undefined));
  }

  requestPasswordReset(cpf: string): Observable<FaceAuthTicket> {
    return this.api
      .apiPortalV1PlayerForgotPasswordFaceAuthPost({ cpfNumber: cpf, portalId: this.dataStore.defaultPortalId })
      .pipe(map((response) => this.toTicket(response) ?? {}));
  }

  resetPassword(input: ResetPasswordInput): Observable<boolean> {
    const request: ChangeForgottenPasswordRequest = {
      newPassword: input.newPassword,
      secureKey: input.secureKey,
    };
    return this.api.apiPortalV1PlayerPasswordResetPost(request);
  }

  /**
   * The gateway answers `Processing` while the provider makes up its mind, so this polls once a
   * second until it settles and emits only the final outcome.
   */
  faceAuthenticationStatus(referenceId: string): Observable<FaceAuthOutcome> {
    return this.api.apiPortalV1PlayerFaceAuthStatusGet(referenceId).pipe(
      delay(1000),
      expand((response: FaceAuthProcessResponse) =>
        response.status === FaceAuthenticationProcessStatusEnum.Processing
          ? this.api.apiPortalV1PlayerFaceAuthStatusGet(referenceId).pipe(delay(1000))
          : EMPTY,
      ),
      takeLast(1),
      map((response) => this.toOutcome(response.status)),
      catchError((error) => {
        log.error('face authentication status failed', error);
        throw error;
      }),
    );
  }

  isPlayerDataTaken(field: PlayerDataField, value: string): Observable<boolean> {
    const type = field === 'username' ? 'Username' : 'Email';
    const takenStatus = field === 'username' ? 'PrincipalExist' : 'EmailExist';

    return this.api
      .apiPortalV1PlayerValidateDataPost({
        portalId: this.dataStore.defaultPortalId,
        playerDataList: [{ type, value }],
      })
      .pipe(map((result) => result[0]?.status === takenStatus));
  }

  /** PortalGateway has no endpoint for this; the screen behaves as if the mail went out. */
  resendConfirmationInstructions(): Observable<boolean> {
    log.debug('resendConfirmationInstructions is not implemented by PortalGateway');
    return of(true);
  }

  /** PortalGateway has no endpoint for this; the screen behaves as if the mail went out. */
  resendUnlockInstructions(): Observable<boolean> {
    log.debug('resendUnlockInstructions is not implemented by PortalGateway');
    return of(true);
  }

  private toTicket(response: FaceAuthResponse | null | undefined): FaceAuthTicket | null {
    if (!response) return null;
    return {
      url: response.url ?? undefined,
      qrCodeUrl: response.quickResponseCodeUrl ?? undefined,
      referenceId: response.referenceId ?? undefined,
    };
  }

  private toOutcome(status: FaceAuthenticationProcessStatusEnum | undefined): FaceAuthOutcome {
    switch (status) {
      case FaceAuthenticationProcessStatusEnum.Approved:
        return 'approved';
      case FaceAuthenticationProcessStatusEnum.Rejected:
        return 'rejected';
      case FaceAuthenticationProcessStatusEnum.Processing:
        return 'processing';
      default:
        return 'unknown';
    }
  }
}
