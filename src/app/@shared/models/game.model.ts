import { GetGameHistoryResponse, History } from '@icore/ngx-portalgateway-api-client-atl';
import { TransactionDetailsResolved } from './sportsbook.model';

export interface GameTile {
  id?: number;
  externalGameId?: string;
  gameName?: string;
  gameProviderId?: number;
  gameProvider?: string;
  gameDesktopAssetPath?: string;
  launchUrl?: string;
  gameBackgroundAssetPath?: string;
  demoPlayRestricted?: boolean;
  realPlayRestricted?: boolean;
  isFavorite?: boolean;
}

export interface GameHistoryModel {
  time: Date;
  gameName: string;
  betSum: number;
  win: number;
  expanded?: boolean;
}

export interface HistoryResolved extends History {
  transactionDetails?: TransactionDetailsResolved[];
  balanceBefore?: number;
  balanceBeforeResolved?: string;
  balanceAfter?: number;
  balanceAfterResolved?: string;
  stakeResolved?: string;
  wonResolved?: string;
  netWin?: number;
  netWinResolved?: string;
  isWin?: boolean;
  wasExpanded?: boolean;
  locale?: string;
}

export interface GetGameHistoryResponseResolved extends GetGameHistoryResponse {
  historyListResolved?: Array<HistoryResolved> | null;
}

export interface GameMenuCategoryModel {
  id: number;
  categoryType: string | null;
  games: GameTile[];
  name: string;
  parentName: string;
  cleanName: string;
}

export interface GameProviderData {
  id: number;
  name: string;
  cleanName: string;
  gamesCount: number;
}

export interface GameProviderDataWithUrl extends GameProviderData {
  gameProviderUrl?: string;
}
