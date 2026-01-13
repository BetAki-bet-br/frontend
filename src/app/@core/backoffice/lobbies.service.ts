import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '@env/environment';
import { LobbyResponse } from '@app/games-page/models/game.models';

@Injectable({
  providedIn: 'root',
})
export class LobbiesService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.backofficeApiUrl}/api/v1/lobbies`;

  private casinoLobbyCache: Observable<LobbyResponse> | null = null;
  private liveLobbyCache: Observable<LobbyResponse> | null = null;

  getCasinoLobby(): Observable<LobbyResponse> {
    if (!this.casinoLobbyCache) {
      console.log('Fetching Casino Lobby Data from API');
      this.casinoLobbyCache = this.http.get<LobbyResponse>(`${this.baseUrl}/casino`).pipe(shareReplay(1));
    }
    console.log('Casino Lobby Cache:', this.casinoLobbyCache);
    return this.casinoLobbyCache;
  }

  getLiveLobby(): Observable<LobbyResponse> {
    if (!this.liveLobbyCache) {
      this.liveLobbyCache = this.http.get<LobbyResponse>(`${this.baseUrl}/live`).pipe(shareReplay(1));
    }
    return this.liveLobbyCache;
  }
}
