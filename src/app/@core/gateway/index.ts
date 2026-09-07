/**
 * The seam between the application and whoever provides the player accounts, the wallet and the
 * games.
 *
 * The application depends on the ports in here, never on a provider SDK. `docs/white-label/
 * 03-gateways.md` explains how to add an adapter, and `auth/auth.gateway.ts` is the worked example.
 */
export { AUTH_GATEWAY } from './auth/auth.gateway';
export type { AuthGateway } from './auth/auth.gateway';
export type {
  AuthChallenge,
  AuthSession,
  FaceAuthOutcome,
  FaceAuthTicket,
  LoginInput,
  PlayerDataField,
  RegisterInput,
  ResetPasswordInput,
} from './auth/auth.models';
export { PLAYER_GATEWAY } from './player/player.gateway';
export type { PlayerGateway } from './player/player.gateway';
export { LimitPeriod, LimitStatus, LimitType, PlayerSessionStatus } from './player/player.models';
export type {
  ActivityOutcome,
  AnnualVerificationInput,
  ContactChannel,
  ContactChannelPreferences,
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
  Referee,
  SessionHistoryQuery,
  SetLimitInput,
  UpdateProfileInput,
} from './player/player.models';
export type { GatewayId, GatewaySelection } from './gateway.models';
export { provideGateways } from './provide-gateways';
