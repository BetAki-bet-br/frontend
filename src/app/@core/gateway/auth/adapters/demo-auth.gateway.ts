import { Injectable } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { AuthGateway } from '../auth.gateway';
import {
  AuthSession,
  FaceAuthOutcome,
  FaceAuthTicket,
  LoginInput,
  PlayerDataField,
  RegisterInput,
  ResetPasswordInput,
} from '../auth.models';

/** Latency, so the loading states in the screens are exercised instead of skipped. */
const LATENCY_MS = 400;

/**
 * `AuthGateway` with no backend at all: accounts live in `localStorage` for the length of the
 * browser profile.
 *
 * It exists for two jobs. Locally it lets the whole logged-in half of the app be opened without a
 * provider (the portal gateway hosts are dead, and the house backend does not exist yet), and in a
 * demo it lets a brand be shown end to end. It is not a fixture for unit tests: those provide
 * their own double for `AUTH_GATEWAY`.
 *
 * Any player logs in with password `demo`. A brand must never ship with this selected, which is
 * why `provideGateways` refuses it in a production build.
 */
@Injectable()
export class DemoAuthGateway implements AuthGateway {
  private static readonly STORAGE_KEY = 'demo-auth-players';
  private static readonly PASSWORD = 'demo';

  login(input: LoginInput): Observable<AuthSession> {
    if (input.password !== DemoAuthGateway.PASSWORD) {
      return throwError(() => ({
        status: 401,
        error: { errorMessage: 'Invalid credentials. The demo gateway accepts the password "demo".' },
      })).pipe(delay(LATENCY_MS));
    }

    const players = this.readPlayers();
    const playerId = players[input.username] ?? this.remember(input.username);

    return of({
      playerId,
      username: input.username,
      sessionToken: `demo-session-${playerId}`,
      lastLoginAt: new Date().toISOString(),
      loggedInAt: new Date().toISOString(),
      // No challenges: the point of the demo gateway is to reach the lobby.
      challenges: [],
    } satisfies AuthSession).pipe(delay(LATENCY_MS));
  }

  startLoginFaceAuth(): Observable<FaceAuthTicket | null> {
    return of(null).pipe(delay(LATENCY_MS));
  }

  register(input: RegisterInput): Observable<{ playerId: string | null }> {
    const players = this.readPlayers();
    if (players[input.cpf] || players[input.username]) {
      return throwError(() => ({
        status: 422,
        error: { errorMessage: 'This player is already registered on the demo gateway.' },
      })).pipe(delay(LATENCY_MS));
    }

    // The register screen logs in with the CPF afterwards, so both keys have to resolve.
    const playerId = this.remember(input.cpf);
    this.remember(input.username, playerId);
    return of({ playerId }).pipe(delay(LATENCY_MS));
  }

  logout(): Observable<void> {
    return of(undefined).pipe(delay(LATENCY_MS));
  }

  requestPasswordReset(): Observable<FaceAuthTicket> {
    return of({}).pipe(delay(LATENCY_MS));
  }

  resetPassword(_input: ResetPasswordInput): Observable<boolean> {
    return of(true).pipe(delay(LATENCY_MS));
  }

  faceAuthenticationStatus(): Observable<FaceAuthOutcome> {
    return of<FaceAuthOutcome>('approved').pipe(delay(LATENCY_MS));
  }

  isPlayerDataTaken(_field: PlayerDataField, value: string): Observable<boolean> {
    return of(!!this.readPlayers()[value]).pipe(delay(LATENCY_MS));
  }

  resendConfirmationInstructions(): Observable<boolean> {
    return of(true).pipe(delay(LATENCY_MS));
  }

  resendUnlockInstructions(): Observable<boolean> {
    return of(true).pipe(delay(LATENCY_MS));
  }

  private readPlayers(): Record<string, string> {
    try {
      return JSON.parse(localStorage.getItem(DemoAuthGateway.STORAGE_KEY) ?? '{}');
    } catch {
      return {};
    }
  }

  private remember(key: string, playerId = String(Date.now())): string {
    const players = this.readPlayers();
    players[key] = playerId;
    try {
      localStorage.setItem(DemoAuthGateway.STORAGE_KEY, JSON.stringify(players));
    } catch {
      // A browser with storage blocked still gets a working session, just not a durable one.
    }
    return playerId;
  }
}
