import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { LobbiesService } from '@app/@core/backoffice';
import { Observable, map } from 'rxjs';
import { LobbyResponse, LobbySection, GameMain } from '../models/game.models';

export const casinoLobbyResolver: ResolveFn<LobbyResponse> = (): Observable<LobbyResponse> => {
  return inject(LobbiesService).getCasinoLobby();
};
