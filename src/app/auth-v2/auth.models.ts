export interface LoginRequest {
  userName: string | null;
  password: string | null;
  portalId: number;
}

export interface LogonSession {
  sessionToken: string;
  playerId: number;
  logonTime: string;
}

export interface LoginResponse {
  referenceId: number;
  reverificationUrl: null;
  quickResponseCodeReverificationUrl: null;
  messages: [];
  failedLoginCount: null;
  lastLoginTime: string;
  lastLoginIp: string;
  playerToken: string;
  isPlayerCreatedByAgent: boolean;
  tracking: boolean;
  statusCode: 'FacialAuthenticationRequired' | string;
  additionalData: null;
  logonSession: LogonSession;
}

export interface CreatePlayer {
  userName: string;
  password: string;
  eMail: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  receiveNews: boolean;
  receiveSMSFromOperator: boolean;
  receiveEmailFromOperator: boolean;
  countryCode: string;
  portalId: number;
  currencyCode: string;
  locale: string;
  mobilePhone?: string;
  customParameters?: Record<string, string>;
}

export interface CreatePlayerRequest {
  player: CreatePlayer;
  deviceFingerprint?: string;
}

export interface CreatePlayerResponse {
  playerId: number;
  isPlayerActivated: boolean;
}

export interface PlayerValidateData {
  type: 'Username' | 'Email' | 'Coupon';
  value: string;
}

export interface ValidatePlayerDataRequest {
  portalId: number;
  playerDataList: PlayerValidateData[];
}

export interface PlayerValidateDataResult {
  type: string;
  status: 'Success' | 'CouponNotFound' | 'PrincipalExist' | 'EmailExist' | 'ContainsBannedWord';
}

export type ReVerificationRequest = Record<string, never>;

export interface ReVerificationResponse {
  referenceId?: string;
  url?: string;
  quickResponseCodeUrl?: string;
}
