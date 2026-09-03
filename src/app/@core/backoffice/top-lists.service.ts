import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BRAND } from '@app/@core/brand';
import { TopList } from './models';

@Injectable({
  providedIn: 'root',
})
export class TopListsService {
  private http = inject(HttpClient);
  private readonly brand = inject(BRAND);
  private readonly baseUrl = `${this.brand.api.backofficeApiUrl}/api/v1/top-lists`;

  getTopLists(params?: { q?: string; status?: string; vertical?: string }): Observable<any> {
    return this.http.get(this.baseUrl, { params });
  }

  createTopList(topList: TopList): Observable<any> {
    return this.http.post(this.baseUrl, topList);
  }

  getTopList(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  updateTopList(id: number, topList: TopList): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, topList);
  }

  deleteTopList(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  syncSlots(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/slots`, data);
  }
}
