import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AuthSession,
  FaceAuthOutcome,
  FaceAuthTicket,
  LoginInput,
  PlayerDataField,
  RegisterInput,
  ResetPasswordInput,
} from './auth.models';

/**
 * Everything the application asks of whoever holds the player accounts.
 *
 * The application never calls a provider SDK directly: it injects {@link AUTH_GATEWAY} and works
 * with the models in `auth.models.ts`. An adapter under `adapters/` implements this against one
 * provider and keeps that provider's ids, status codes and payload shapes to itself.
 *
 * Rules that make an adapter swap cheap:
 *
 * - Only the types in `auth.models.ts` cross this boundary. No vendor DTO, no vendor enum.
 * - Configuration a provider needs (portal ids, api keys, base urls) is the adapter's problem. It
 *   reads it from `BrandConfig` or the environment; it never appears in a method signature here.
 * - Errors surface as whatever the transport threw. Callers already handle `HttpErrorResponse`,
 *   and an adapter that needs to explain itself does so by rejecting with a message the UI shows.
 * - Session bookkeeping (storing credentials, GTM events, promo activation, routing) belongs to
 *   `AuthenticationService`. A gateway only talks to its provider.
 */
export interface AuthGateway {
  /**
   * Authenticates a returning player.
   *
   * The returned session may carry challenges; it is the caller's job to walk the player through
   * them. Rejects when the credentials are wrong.
   */
  login(input: LoginInput): Observable<AuthSession>;

  /**
   * Opens the biometry step for a login that came back with a `face-auth` challenge.
   *
   * Split from {@link login} because providers hand out the biometry url in a second call, once
   * they know the session exists. A gateway that returns it inline can resolve the ticket it
   * already has.
   */
  startLoginFaceAuth(): Observable<FaceAuthTicket | null>;

  /**
   * Creates a player account. Does not log them in: `AuthenticationService` calls {@link login}
   * afterwards, so both paths run the same session bookkeeping.
   *
   * Resolves with the new player's id when the gateway reports one.
   */
  register(input: RegisterInput): Observable<{ playerId: string | null }>;

  /** Ends the session on the provider's side. Local cleanup happens regardless of the outcome. */
  logout(): Observable<void>;

  /**
   * Confirms an e-mail address from the link the player clicked in their inbox.
   *
   * The four `*FromLink` calls are the same shape on purpose: the player arrives on a url carrying
   * a token, the app hands the token over, and what comes back is either nothing to say or a
   * session. Which query parameter carried it is `PlayerActivationService`'s business.
   */
  confirmEmailFromLink(token: string): Observable<void>;

  /** Activates a newly registered account from its activation link. */
  activateAccountFromLink(token: string): Observable<void>;

  /**
   * Brings back an account the operator had made inactive, and signs the player in.
   *
   * Answers with a session because that is what it is: the same {@link AuthSession} a login gives,
   * challenges included, so the app puts the player through the same steps. The username is not
   * part of it; the caller reads the profile it has to fetch anyway.
   */
  reactivateAccountFromLink(token: string): Observable<AuthSession>;

  /** Confirms the yearly income statement from the link in the operator's e-mail. */
  confirmAnnualReportFromLink(token: string): Observable<void>;

  /**
   * Starts the "forgot my password" flow for a CPF and returns where to send the player to prove
   * who they are. The reset key arrives through whatever channel the gateway uses (e-mail, SMS)
   * and comes back in {@link resetPassword}.
   */
  requestPasswordReset(cpf: string): Observable<FaceAuthTicket>;

  /** Sets a new password using the key from the reset flow. */
  resetPassword(input: ResetPasswordInput): Observable<boolean>;

  /**
   * Resolves the outcome of a biometry check.
   *
   * Adapters are expected to resolve `processing` themselves (by polling, or by holding the
   * request open) so the UI can subscribe once and get an answer.
   */
  faceAuthenticationStatus(referenceId: string): Observable<FaceAuthOutcome>;

  /**
   * Whether a username or e-mail is already taken, for the register form's async validator.
   * `true` means taken.
   */
  isPlayerDataTaken(field: PlayerDataField, value: string): Observable<boolean>;

  /** Re-sends the account confirmation e-mail. */
  resendConfirmationInstructions(email: string): Observable<boolean>;

  /** Re-sends the instructions for unlocking a locked account. */
  resendUnlockInstructions(email: string): Observable<boolean>;
}

/**
 * The auth gateway the running brand was built with.
 *
 * Provided by `provideGateways()` in `src/app.config.ts`, which reads the brand's choice from
 * `BrandConfig.gateways`. Nothing else in the app should know which adapter answered.
 */
export const AUTH_GATEWAY = new InjectionToken<AuthGateway>('AUTH_GATEWAY');
