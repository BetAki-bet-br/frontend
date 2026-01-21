import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Showcase } from './models';

@Injectable({
  providedIn: 'root',
})
export class ShowcasesService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.backofficeApiUrl}/api/v1/showcases`;

  getShowcases(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  createShowcase(showcase: Showcase): Observable<any> {
    return this.http.post(this.baseUrl, showcase);
  }

  syncSlots(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/slots`, data);
  }
}
