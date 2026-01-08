import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { LobbyResponse } from '@app/games-page/models/game.models';

@Injectable({
  providedIn: 'root',
})
export class LobbiesService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.backofficeApiUrl}/api/v1/lobbies`;

  getCasinoLobby(): Observable<LobbyResponse> {
    return this.http.get<LobbyResponse>(`${this.baseUrl}/casino`);
  }

  getLiveLobby(): Observable<LobbyResponse> {
    return this.http.get<LobbyResponse>(`${this.baseUrl}/live`);
  }
}
