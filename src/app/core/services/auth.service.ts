import { inject, Injectable, signal } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import {
  CreatePlayerRequest,
  CreatePlayerResponse,
  LoginRequest,
  LoginResponse,
  PlayerValidateDataResult,
  ReVerificationRequest,
  ReVerificationResponse,
  ValidatePlayerDataRequest,
} from '../../features/auth/auth.models';
import { Credentials, SessionService } from './session.service';
import { Router } from '@angular/router';
import { GameService } from './game.service';
import { PlayerService } from '../../api';
import {
  CreatePlayerRequest as ApiCreatePlayerRequest,
  CreatePlayerResponse as ApiCreatePlayerResponse,
  FaceAuthProcessResponse as ApiFaceAuthProcessResponse,
  LoginRequest as ApiLoginRequest,
  LoginResponseExtended as ApiLoginResponseExtended,
  PlayerValidateDataResult as ApiPlayerValidateDataResult,
  ReVerificationResponse as ApiReVerificationResponse,
  ValidatePlayerDataRequest as ApiValidatePlayerDataRequest,
} from '../../api/model/models';

// #region Mappers
function toLocalLoginResponse(apiResponse: ApiLoginResponseExtended): LoginResponse {
  return {
    referenceId: apiResponse.referenceId ? parseInt(apiResponse.referenceId, 10) : 0,
    reverificationUrl: apiResponse.reverificationUrl ?? null,
    quickResponseCodeReverificationUrl: apiResponse.quickResponseCodeReverificationUrl ?? null,
    messages: (apiResponse.messages as []) ?? [],
    failedLoginCount: apiResponse.failedLoginCount ?? null,
    lastLoginTime: apiResponse.lastLoginTime ?? '',
    lastLoginIp: apiResponse.lastLoginIp ?? '',
    playerToken: apiResponse.playerToken ?? '',
    isPlayerCreatedByAgent: apiResponse.isPlayerCreatedByAgent ?? false,
    tracking: !!apiResponse.tracking,
    statusCode: (apiResponse.statusCode as 'FacialAuthenticationRequired' | string) ?? '',
    additionalData: apiResponse.additionalData ?? null,
    logonSession: {
      sessionToken: apiResponse.logonSession?.sessionToken ?? '',
      playerId: apiResponse.logonSession?.playerId ?? 0,
      logonTime: apiResponse.logonSession?.logonTime ?? '',
    },
  };
}

function toLocalCreatePlayerResponse(apiResponse: ApiCreatePlayerResponse): CreatePlayerResponse {
  return {
    playerId: apiResponse.playerId ?? 0,
    isPlayerActivated: apiResponse.isPlayerActivated ?? false,
  };
}

function toLocalPlayerValidateDataResultArray(
  apiResponse: ApiPlayerValidateDataResult[]
): PlayerValidateDataResult[] {
  return (
    apiResponse.map((r) => ({
      type: r.type ?? '',
      status: (r.status as PlayerValidateDataResult['status']) ?? 'Success',
    })) ?? []
  );
}
// #endregion

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly sessionService = inject(SessionService);
  private readonly router = inject(Router);
  private readonly gameService = inject(GameService);
  private readonly playerService = inject(PlayerService);

  faceAuthReferenceId = signal<string | null>(null);

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.playerService.apiPortalV1PlayerLoginPost(payload as ApiLoginRequest).pipe(
      map(toLocalLoginResponse),
      tap((res) => {
        if (res.logonSession?.sessionToken) {
          this.sessionService.setToken(res.logonSession.sessionToken);
          this.sessionService.setCredentials({
            username: payload.userName,
            jwt: res.logonSession.sessionToken,
            sessionKey: res.logonSession.sessionToken,
            userId: res.logonSession.playerId,
            renewalToken: res.logonSession.sessionToken,
            lastLoginTime: res.lastLoginTime,
            logonTime: res.logonSession.logonTime,
          } as Credentials);
        }
      })
    );
  }

  register(payload: CreatePlayerRequest): Observable<CreatePlayerResponse> {
    return this.playerService
      .apiPortalV1PlayerPost(payload as ApiCreatePlayerRequest)
      .pipe(map(toLocalCreatePlayerResponse));
  }

  validateData(payload: ValidatePlayerDataRequest): Observable<PlayerValidateDataResult[]> {
    return this.playerService
      .apiPortalV1PlayerValidateDataPost(payload as ApiValidatePlayerDataRequest)
      .pipe(map(toLocalPlayerValidateDataResultArray));
  }

  reverifyPlayer(payload: ReVerificationRequest): Observable<ReVerificationResponse> {
    return this.playerService
      .apiPortalV1PlayerReverificationPost(payload)
      .pipe(map((res: ApiReVerificationResponse) => res as ReVerificationResponse));
  }

  loginFaceAuth(payload: ReVerificationRequest): Observable<ReVerificationResponse> {
    return this.playerService.apiPortalV1PlayerLoginFaceAuthPost(payload).pipe(
      map((response: ApiReVerificationResponse) => {
        if (response.url) {
          const url = new URL(response.url);
          const referenceId = url.searchParams.get('ReferenceId');
          if (referenceId) {
            this.faceAuthReferenceId.set(referenceId);
          }
        }
        return response as ReVerificationResponse;
      })
    );
  }

  getFaceAuthStatus(referenceId: string): Observable<{ status: boolean }> {
    return this.playerService
      .apiPortalV1PlayerFaceAuthStatusGet(referenceId)
      .pipe(map((response: ApiFaceAuthProcessResponse) => ({ status: response.status === 'Approved' })));
  }

  logout(): void {
    this.playerService.apiPortalV1PlayerLogoutPost().subscribe({
      complete: () => this.handleLogoutSuccess(),
      error: () => this.handleLogoutSuccess(),
    });
  }

  private handleLogoutSuccess(): void {
    this.gameService.clearCaches();
    this.sessionService.clearSession();
    this.router.navigate(['/']);
  }
}
