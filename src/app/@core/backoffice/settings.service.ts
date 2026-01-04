import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Setting } from './models';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.backofficeApiUrl}/api/v1/settings`;

  getSettings(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  getPublicSettings(): Observable<any> {
    return this.http.get(`${this.baseUrl}/public`);
  }

  createSetting(setting: Setting): Observable<any> {
    return this.http.post(this.baseUrl, setting);
  }

  getSetting(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  updateSetting(id: number, setting: Setting): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, setting);
  }

  deleteSetting(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}