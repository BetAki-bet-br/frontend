import { GameMain } from '@/app/core/models/game.models';

export interface Winner {
  id: number;
  prize: string;
  gameName: string;
  gameImageUrl: string;
  winnerName: string;
  userIcon: string;
  gameAlt: string;
  isLeaving?: boolean;
  game: GameMain;
}
