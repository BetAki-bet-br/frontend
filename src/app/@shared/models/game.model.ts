import { GameRound, TransactionStep } from '@app/@core/gateway';

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

/**
 * O que a rodada foi para o jogador. As três palavras são também chaves de tradução.
 *
 * `Voided` existe porque uma rodada anulada devolve a aposta como ganho: o líquido dá zero, e um
 * booleano `ganhou/perdeu` só sabia dizer PERDEU para quem não perdeu nada.
 */
export type GameRoundOutcome = 'Won' | 'Lost' | 'Voided';

/** A casino round with the amounts already formatted in the player's locale. */
export interface HistoryResolved extends GameRound {
  transactionDetails?: TransactionStep[];
  balanceBefore?: number;
  balanceBeforeResolved?: string;
  balanceAfter?: number;
  balanceAfterResolved?: string;
  stakeResolved?: string;
  wonResolved?: string;
  netWin?: number;
  netWinResolved?: string;
  outcome?: GameRoundOutcome;
  wasExpanded?: boolean;
  locale?: string;
}

/** A page of casino rounds, as the history table consumes it. */
export interface GetGameHistoryResponseResolved {
  historyListResolved?: Array<HistoryResolved> | null;
  /** How many rounds the filter matches in total, for the paginator. */
  recordCount?: number | null;
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
