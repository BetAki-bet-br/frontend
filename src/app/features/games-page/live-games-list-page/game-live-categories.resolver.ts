import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { GameService } from '@/app/core/services/game.service';
import { SubLevel } from '@/app/core/models/game.models';
import { Observable, filter, take } from 'rxjs';
import { GameEnum } from '@/app/enums/gameEnum';

export const gamesResolver: ResolveFn<SubLevel[]> = (): Observable<SubLevel[]> => {
  const gameService = inject(GameService);

  return gameService.getGames(GameEnum.CASINO, 5).pipe(
    filter((games) => games.length > 0), // Wait until games are loaded
    take(1) // Take the first emission with data and complete
  );
};
