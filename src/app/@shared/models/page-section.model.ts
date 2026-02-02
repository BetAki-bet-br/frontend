import { GameMain } from '@app/games-page/models/game.models';
import { SectionType } from './section-type.model';

export interface PageSection {
  id: string | number;
  type: SectionType;
  gameCount?: number;
  gameMains?: GameMain[];
  data: any;
}
