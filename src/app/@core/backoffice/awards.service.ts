import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Award } from './models';

@Injectable({
  providedIn: 'root'
})
export class AwardsService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.backofficeApiUrl}/api/v1/awards/batches`;

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