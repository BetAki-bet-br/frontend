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
  realPlayRestricted: boolean;
  maintenanceModeEnabled: boolean;
  progressiveJackpots: string[] | null;
  translations: unknown[] | null;
  parameters: unknown[] | null;
  gameTypeName: string;
  gameTypeId: number;
}

export interface SubLevel {
  id: number | string;
  parentId?: number;
  name: string;
  gameName: string | null;
  subLevel: SubLevel[];
  gameMains: GameMain[];
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
  name: string;
  parentId: number | null;
  categoryTypeId: number;
  // subLevels: GameCategory[];
}

// export interface GameCategory {
//     id?: number;
//     portalId?: number;
//     name?: string | null;
//     description?: string | null;
//     tag?: string | null;
//     categoryTypeId?: string | null;
//     parentId?: number | null;
//     parentName?: string | null;
//     translations?: Array<CategoryTranslation> | null;
//     position?: number | null;
// }

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
