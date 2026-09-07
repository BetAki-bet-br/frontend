/**
 * The vocabulary the application uses to talk about authentication.
 *
 * Nothing here comes from a vendor SDK on purpose: these are the types `AuthenticationService` and
 * the auth screens work with, and every adapter under `adapters/` translates its own provider's
 * payloads into them. When a new gateway is plugged in, this file is the contract to satisfy, and
 * it is also the shortest description of what the house backend has to implement.
 */

/** What a returning player types in. */
export interface LoginInput {
  /** CPF or e-mail. Which of the two a gateway accepts is the gateway's business. */
  username: string;
  password: string;
  /** Anti-fraud fingerprint id, when the brand collects one. */
  deviceFingerprintId?: string;
}

/** What a new player submits. Mirrors the register form, not any provider's payload. */
export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  cpf: string;
  /** ISO date, `YYYY-MM-DD`. */
  dateOfBirth: string;
  phone?: string;
  /** Whether the player opted into marketing contact. */
  promotionalOffers: boolean;
  deviceFingerprintId?: string;
  affiliate?: { marketingChannel: string; marketingSource: string; btag: string };
}

/**
 * A step the gateway says the player still has to clear before the session is usable.
 *
 * `face-auth` is part of the port rather than an adapter detail because every operator licensed in
 * Brazil runs facial biometry: a gateway that does not is the exception, and it simply never
 * returns this challenge.
 */
export type AuthChallenge =
  | {
      kind: 'face-auth';
      /** Where to send the player. Desktop shows the QR code, mobile opens the url. */
      url?: string;
      qrCodeUrl?: string;
      /** Handed back to `faceAuthenticationStatus` while polling for the outcome. */
      referenceId?: string;
    }
  | {
      kind: 'identity-verification';
      url?: string;
      qrCodeUrl?: string;
      referenceId?: string;
    }
  | {
      kind: 'accept-updated-terms';
      /** Identifies the pending terms version, echoed back when the player accepts. */
      actionId: number;
    };

/** An authenticated player, as far as the application is concerned. */
export interface AuthSession {
  /**
   * The gateway's id for the player. A string because not every provider uses integers; the legacy
   * `Credentials.userId` is still numeric, so `AuthenticationService` narrows it on the way in.
   */
  playerId: string;
  username: string;
  /** Opaque to the app: whatever the gateway wants echoed back on authenticated calls. */
  sessionToken: string;
  lastLoginAt?: string | null;
  loggedInAt?: string | null;
  /** Empty when the player can start playing right away. */
  challenges: AuthChallenge[];
}

/** Where to send the player for a biometry check that was requested outside of login. */
export interface FaceAuthTicket {
  url?: string;
  qrCodeUrl?: string;
  referenceId?: string;
}

/**
 * Result of a biometry check.
 *
 * `processing` means the provider has not decided yet; a gateway that resolves synchronously never
 * returns it, and one that polls resolves it before answering (see `ComtradeAuthGateway`).
 */
export type FaceAuthOutcome = 'approved' | 'rejected' | 'processing' | 'unknown';

/** A field the register form checks for availability while the player types. */
export type PlayerDataField = 'username' | 'email';

/** Everything needed to set a forgotten password, once the player has cleared the reset flow. */
export interface ResetPasswordInput {
  /** The one-time key the reset flow handed out. */
  secureKey: string;
  newPassword: string;
}
