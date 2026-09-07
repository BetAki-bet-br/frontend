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
export { GAMES_GATEWAY } from './games/games.gateway';
export type { GamesGateway } from './games/games.gateway';
export { BetStatus, GameRoundStatus } from './games/games.models';
export type {
  Game,
  GameHistoryPage,
  GameLaunch,
  GameLaunchResult,
  GameRound,
  HistoryQuery,
  LaunchGameInput,
  SportsbookBet,
  SportsbookBetHistoryPage,
  TopWinner,
} from './games/games.models';
export { WALLET_GATEWAY } from './wallet/wallet.gateway';
export type { WalletGateway } from './wallet/wallet.gateway';
export { PixKeyType, TransactionStatus, TransactionType } from './wallet/wallet.models';
export type {
  DepositCharge,
  DepositInput,
  DepositRefusal,
  DepositResult,
  Transaction,
  TransactionPage,
  TransactionQuery,
  TransactionStep,
  WithdrawalEligibility,
  WithdrawalInput,
  WithdrawalOutcome,
  WithdrawalRefusal,
} from './wallet/wallet.models';
export { MESSAGES_GATEWAY } from './messages/messages.gateway';
export type { MessagesGateway } from './messages/messages.gateway';
export { MessageState } from './messages/messages.models';
export type { MessageAction, PlayerMessage, PopupMessage } from './messages/messages.models';
export type { GatewayId, GatewaySelection } from './gateway.models';
export { provideGateways } from './provide-gateways';
