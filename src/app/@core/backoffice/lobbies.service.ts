import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class LobbiesService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.backofficeApiUrl}/api/v1/lobbies`;

  getCasinoLobby(): Observable<any> {
    return this.http.get(`${this.baseUrl}/casino`);
  }

  getLiveLobby(): Observable<any> {
    return this.http.get(`${this.baseUrl}/live`);
  }
}
