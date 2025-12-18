import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { GameEnum } from '@app/@shared/enums/gameEnum';
import { GameService } from '@app/@shared/services/game.service';
import { Observable, filter, take } from 'rxjs';
import { SubLevel } from '../models/game.models';

export const gamesResolver: ResolveFn<SubLevel[]> = (): Observable<SubLevel[]> => {
  const gameService = inject(GameService);

  return gameService.getGames(GameEnum.CASINO, 5).pipe(
    filter((games) => games.length > 0), // Wait until games are loaded
    take(1) // Take the first emission with data and complete
  );
};
