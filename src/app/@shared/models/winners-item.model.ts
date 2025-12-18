export interface WinnersItem {
  game: GameWinner;
  round: Round;
  player: Player;
}

export interface GameWinner {
  identifier: string;
  title: string;
  table_image_path: string;
}

export interface Player {
  nickname: string;
}

export interface Round {
  currency: string;
  bet: number;
  win: number;
}

export interface LatestWinnersCache {
  time: number; // unix date
  items: any[];
}

export interface WinnersItemResolved {
  gameName?: string;
  user?: string;
  betAmount?: number;
  multiplierResolved?: string;
  payoutAmount?: number;
}
