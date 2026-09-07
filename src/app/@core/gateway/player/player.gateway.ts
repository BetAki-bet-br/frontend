import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { FaceAuthTicket } from '../auth/auth.models';
import {
  ActivityOutcome,
  AnnualVerificationInput,
  ContactChannel,
  ContactPreferences,
  ContactVerificationStatus,
  LoyaltyStatus,
  PlayerBalance,
  PlayerLimit,
  PlayerProfile,
  PlayerSession,
  PlayerVerificationStatuses,
  ReferAFriendInput,
  ReferAFriendStatistics,
  SessionHistoryQuery,
  SetLimitInput,
  UpdateProfileInput,
} from './player.models';

/**
 * Everything the application asks about the player who is signed in: their data, what has been
 * verified, the limits they set on themselves, and what their account is worth.
 *
 * Same rules as {@link AuthGateway}: only the types in `player.models.ts` cross this boundary, the
 * provider's configuration is the adapter's problem, and orchestration stays outside. Caching,
 * polling intervals, currency formatting and the dialogs a biometry ticket opens all belong to the
 * services that call this; a gateway only talks to its provider.
 *
 * Methods no screen calls are not here. The provider offers more (documents, statistics, terminate
 * every session) and the adapter can grow a method the day a screen needs one.
 */
export interface PlayerGateway {
  /** The signed-in player's own data. Null when the gateway has no record to answer with. */
  getProfile(): Observable<PlayerProfile | null>;

  /**
   * Saves what the profile screens changed.
   *
   * Resolves with a biometry ticket when the gateway wants the player to prove who they are before
   * the change sticks, and with null when it does not.
   */
  updateProfile(input: UpdateProfileInput): Observable<FaceAuthTicket | null>;

  /** Submits the yearly re-check. Same ticket contract as {@link updateProfile}. */
  annualVerification(input: AnnualVerificationInput): Observable<FaceAuthTicket | null>;

  /** Changes the password of a signed-in player. Same ticket contract as {@link updateProfile}. */
  changePassword(currentPassword: string, newPassword: string): Observable<FaceAuthTicket | null>;

  /** Starts closing the account. Same ticket contract as {@link updateProfile}. */
  closeAccount(): Observable<FaceAuthTicket | null>;

  /** Asks the operator to send the player their yearly statement. */
  requestAnnualReport(): Observable<void>;

  /**
   * What the operator has verified about the player.
   *
   * Called on nearly every gated action, so the app caches the answer; the gateway should not.
   */
  getVerificationStatuses(): Observable<PlayerVerificationStatuses>;

  /**
   * Opens an identity check outside of login, for a player the operator wants to see again.
   *
   * Null means the gateway had nothing for the player to do.
   */
  startReverification(): Observable<FaceAuthTicket | null>;

  /** Whether an e-mail address or phone number has been confirmed. */
  getContactVerificationStatus(channel: ContactChannel): Observable<ContactVerificationStatus>;

  /** Sends a confirmation code to the channel. */
  startContactVerification(channel: ContactChannel): Observable<void>;

  /** Confirms a channel with the code the player received. Rejects when the code is wrong. */
  confirmContactVerification(channel: ContactChannel, code: string): Observable<void>;

  /** The player's logins, newest first unless the query says otherwise. */
  getSessions(query?: SessionHistoryQuery): Observable<PlayerSession[]>;

  /** What the player agreed to hear about. */
  getContactPreferences(): Observable<ContactPreferences>;

  /** Saves the marketing consent the subscriptions screen collected. */
  updateContactPreferences(preferences: ContactPreferences): Observable<void>;

  /** Every limit on the account, the operator's included. */
  getLimits(): Observable<PlayerLimit[]>;

  /**
   * Sets a limit, or replaces the one of the same type.
   *
   * Whether it takes effect now or after a cooling-off period is the operator's rule, and shows up
   * in the `limitStatus` of the next {@link getLimits}.
   */
  setLimit(input: SetLimitInput): Observable<void>;

  /** Lifts a limit the player is allowed to lift. */
  deleteLimit(limitId: number): Observable<void>;

  /**
   * Self-exclusion: the player is barred until the given ISO timestamp and cannot undo it.
   *
   * Serious enough that gateways ask for biometry, so it answers with a ticket the way
   * {@link updateProfile} does.
   */
  selfExclude(untilIso: string): Observable<FaceAuthTicket | null>;

  /** A break the player can take without proving anything. Ends at the given ISO timestamp. */
  timeOut(untilIso: string): Observable<void>;

  /**
   * Tells the provider the player is still here, and asks whether the session may continue.
   *
   * The app pings this on a timer. `session-limit-reached` is the answer that a responsible-gaming
   * limit has ended the session; the caller logs the player out.
   */
  recordActivity(): Observable<ActivityOutcome>;

  /** What the account is worth right now. Null when nobody is signed in. */
  getBalance(): Observable<PlayerBalance | null>;

  /** Where the player stands in the loyalty programme. Null when the brand runs none. */
  getLoyalty(): Observable<LoyaltyStatus | null>;

  /** How the player's invitations are doing. */
  getReferAFriendStatistics(): Observable<ReferAFriendStatistics>;

  /** Sends the invitations. `false` means the gateway rejected the batch. */
  referAFriend(input: ReferAFriendInput): Observable<boolean>;
}

/**
 * The player gateway the running brand was built with.
 *
 * Provided by `provideGateways()` in `src/app.config.ts`, which reads the brand's choice from
 * `BrandConfig.gateways`. Nothing else in the app should know which adapter answered.
 */
export const PLAYER_GATEWAY = new InjectionToken<PlayerGateway>('PLAYER_GATEWAY');
