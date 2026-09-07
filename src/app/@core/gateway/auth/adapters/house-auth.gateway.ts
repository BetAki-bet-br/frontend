import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BRAND } from '@app/@core/brand';
import { Observable, map } from 'rxjs';
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

/**
 * `AuthGateway` against our own backend.
 *
 * Unlike `ComtradeAuthGateway`, this adapter is thin on purpose: the wire format is the port's own
 * vocabulary, so there is nothing to translate. That makes this file the specification of what the
 * house backend has to serve, and the reason to keep it short is that every field below is a field
 * somebody has to implement.
 *
 * Base url: `BrandConfig.api.playerApiUrl`, falling back to `backofficeApiUrl` while the player
 * endpoints live in the same Laravel app as the CMS. Every path below is relative to it.
 *
 *   POST   /api/v1/player/auth/login                  { username, password, deviceFingerprintId? }
 *                                                     -> AuthSession
 *   POST   /api/v1/player/auth/login/face-auth        {} -> FaceAuthTicket | null
 *   POST   /api/v1/player/auth/register               RegisterInput -> { playerId }
 *   POST   /api/v1/player/auth/logout                 {} -> 204
 *   POST   /api/v1/player/auth/password/forgot        { cpf } -> FaceAuthTicket
 *   POST   /api/v1/player/auth/password/reset         { secureKey, newPassword } -> { ok }
 *   GET    /api/v1/player/auth/face-auth/{referenceId}
 *                                                     -> { outcome }
 *   GET    /api/v1/player/availability?field=&value=  -> { taken }
 *   POST   /api/v1/player/auth/confirmation-instructions  { email } -> { ok }
 *   POST   /api/v1/player/auth/unlock-instructions        { email } -> { ok }
 *
 * A 401 on login and a 422 with a `message` on register are what the screens already expect from
 * an `HttpErrorResponse`, so the backend does not need a bespoke error envelope to start with.
 */
@Injectable()
export class HouseAuthGateway implements AuthGateway {
  private readonly http = inject(HttpClient);
  private readonly brand = inject(BRAND);

  private get base(): string {
    return `${this.brand.api.playerApiUrl ?? this.brand.api.backofficeApiUrl}/api/v1/player`;
  }

  login(input: LoginInput): Observable<AuthSession> {
    return this.http.post<HouseSession>(`${this.base}/auth/login`, input).pipe(map((res) => this.toSession(res)));
  }

  startLoginFaceAuth(): Observable<FaceAuthTicket | null> {
    return this.http.post<FaceAuthTicket | null>(`${this.base}/auth/login/face-auth`, {});
  }

  register(input: RegisterInput): Observable<{ playerId: string | null }> {
    return this.http.post<{ playerId: string | null }>(`${this.base}/auth/register`, input);
  }

  confirmEmailFromLink(token: string): Observable<void> {
    return this.http.post<void>(`${this.base}/auth/email/confirm`, { token });
  }

  activateAccountFromLink(token: string): Observable<void> {
    return this.http.post<void>(`${this.base}/auth/activate`, { token });
  }

  reactivateAccountFromLink(token: string): Observable<AuthSession> {
    return this.http.post<AuthSession>(`${this.base}/auth/reactivate`, { token });
  }

  confirmAnnualReportFromLink(token: string): Observable<void> {
    return this.http.post<void>(`${this.base}/auth/annual-report/confirm`, { token });
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.base}/auth/logout`, {});
  }

  requestPasswordReset(cpf: string): Observable<FaceAuthTicket> {
    return this.http.post<FaceAuthTicket>(`${this.base}/auth/password/forgot`, { cpf });
  }

  resetPassword(input: ResetPasswordInput): Observable<boolean> {
    return this.http.post<{ ok: boolean }>(`${this.base}/auth/password/reset`, input).pipe(map((res) => res.ok));
  }

  /**
   * The backend is expected to answer only once the biometry provider has decided, so the app
   * subscribes once. If it ever needs to answer `processing`, poll here the way the Comtrade
   * adapter does rather than pushing the retry into the screens.
   */
  faceAuthenticationStatus(referenceId: string): Observable<FaceAuthOutcome> {
    return this.http
      .get<{ outcome: FaceAuthOutcome }>(`${this.base}/auth/face-auth/${encodeURIComponent(referenceId)}`)
      .pipe(map((res) => res.outcome));
  }

  isPlayerDataTaken(field: PlayerDataField, value: string): Observable<boolean> {
    return this.http
      .get<{ taken: boolean }>(`${this.base}/availability`, { params: { field, value } })
      .pipe(map((res) => res.taken));
  }

  resendConfirmationInstructions(email: string): Observable<boolean> {
    return this.http
      .post<{ ok: boolean }>(`${this.base}/auth/confirmation-instructions`, { email })
      .pipe(map((res) => res.ok));
  }

  resendUnlockInstructions(email: string): Observable<boolean> {
    return this.http
      .post<{ ok: boolean }>(`${this.base}/auth/unlock-instructions`, { email })
      .pipe(map((res) => res.ok));
  }

  private toSession(res: HouseSession): AuthSession {
    return {
      playerId: String(res.playerId),
      username: res.username,
      sessionToken: res.token,
      lastLoginAt: res.lastLoginAt ?? null,
      loggedInAt: res.loggedInAt ?? null,
      challenges: res.challenges ?? [],
    };
  }
}

/** The login response, named separately so the backend contract is visible in one place. */
interface HouseSession {
  playerId: string | number;
  username: string;
  token: string;
  lastLoginAt?: string | null;
  loggedInAt?: string | null;
  challenges?: AuthChallenge[];
}
