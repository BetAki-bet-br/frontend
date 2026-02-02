export interface AwardedData {
  wins_count: number;
  prize_sum: number;
  max_prize: number;
  avg_prize: number;
}

export interface GameMain {
  id: number;
  externalId: string;
  productSupplierId: number;
  productSupplierName: string;
  productId: number;
  productName: string;
  name: string;
  gameName: string;
  demoPlayRestricted: boolean;
  current_prize_sum?: number;
  realPlayRestricted: boolean;
  maintenanceModeEnabled: boolean;
  progressiveJackpots: string[] | null;
  translations: unknown[] | null;
  parameters: unknown[] | null;
  gameTypeName: string;
  gameTypeId: number;
  volatility?: number;
  minBet?: string;
  rtp?: string;
  awarded?: AwardedData;
}

export interface SubLevel {
  id: number | string;
  parentId?: number;
  name: string;
  gameName: string | null;
  subLevel: SubLevel[];
  gameMains: GameMain[];
  slots?: GameMain[];
  levelType: string;
}

export interface PlayerGameRequest {
  extGameId: string;
  portalId: number;
  realPlay: boolean;
  isNative: boolean;
  language: string;
  properties: Record<string, string>;
  desiredCurrency: string;
}

export interface Provider {
  id: number;
  name: string;
  gameCount: number;
}

export interface PostGameResponse {
  id: number;

  gameExternalId: string;

  location: string;

  parameters: Record<string, string>;

  webMethod: string;
}

export interface GameCategory {
  id: number | undefined;
  gameCount?: number;
  name: string;
  type?: string;
  slug?: string;
  parentId: number | null;
  categoryTypeId: number;
}

export interface GameCategoryResponse {
  gameCategoryList: GameCategory[];
}

export interface LobbyEntry {
  subLevel: SubLevel[];
}

export interface TopRecentGame {
  gameExternalId: string | null;
}

export interface GetGameMainsResponse {
  gameMainList: GameMain[];
  recordCount: number;
}

export interface LobbySection {
  id: number | string;
  title: string;
  order: number;
  type: string;
  games?: GameMain[];
  gameMains?: GameMain[];
  gameCount?: number;
  data?: any;
  metadata?: {
    categoryId?: number | string;
    type?: string;
    [key: string]: any;
  };
}

export interface LobbyResponse {
  sections: LobbySection[];
}
