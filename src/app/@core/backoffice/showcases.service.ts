import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BRAND } from '@app/@core/brand';
import { Showcase } from './models';

@Injectable({
  providedIn: 'root',
})
export class ShowcasesService {
  private http = inject(HttpClient);
  private readonly brand = inject(BRAND);
  private readonly baseUrl = `${this.brand.api.backofficeApiUrl}/api/v1/showcases`;

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
