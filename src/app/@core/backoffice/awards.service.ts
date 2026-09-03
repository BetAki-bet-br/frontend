import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BRAND } from '@app/@core/brand';
import { Award } from './models';

@Injectable({
  providedIn: 'root',
})
export class AwardsService {
  private http = inject(HttpClient);
  private readonly brand = inject(BRAND);
  private readonly baseUrl = `${this.brand.api.backofficeApiUrl}/api/v1/awards/batches`;

  getBatches(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  createBatch(batch: Award): Observable<any> {
    return this.http.post(this.baseUrl, batch);
  }

  getBatch(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  updateBatch(id: number, batch: Award): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, batch);
  }

  deleteBatch(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  syncResults(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/results`, data);
  }

  publishBatch(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/publish`, {});
  }

  archiveBatch(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/archive`, {});
  }
}
