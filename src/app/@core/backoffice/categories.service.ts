import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Category } from './models';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.backofficeApiUrl}/api/v1/categories`;

  getCategories(params?: {
    q?: string;
    status?: 'active' | 'inactive';
    vertical?: 'slots' | 'live';
    type?: string;
  }): Observable<any> {
    return this.http.get(this.baseUrl, { params });
  }

  getSlotsCategories(): Observable<any> {
    return this.http.get(`${this.baseUrl}/slots`);
  }

  getLiveCategories(): Observable<any> {
    return this.http.get(`${this.baseUrl}/live`);
  }

  createCategory(category: Category): Observable<any> {
    return this.http.post(this.baseUrl, category);
  }

  getCategory(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  updateCategory(id: number, category: Category): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, category);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  syncSlots(id: number, items: { slot_id: number; position: number }[]): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/slots`, { items });
  }

  reorder(items: { id: number; position: number }[]): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/reorder`, { items });
  }

  sync(portalId?: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/sync`, { portal_id: portalId });
  }
}
