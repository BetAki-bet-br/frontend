import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '@env/environment';
import { Category } from './models';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.backofficeApiUrl}/api/v1/categories`;

  private categoriesCache: Record<string, Observable<any>> = {};
  private slotsCategoriesCache: Observable<any> | null = null;
  private liveCategoriesCache: Observable<any> | null = null;
  private categoryCache: Record<number, Observable<any>> = {};

  getCategories(params?: {
    q?: string;
    status?: 'active' | 'inactive';
    vertical?: 'slots' | 'live';
    type?: string;
  }): Observable<any> {
    const key = JSON.stringify(params || {});
    if (!this.categoriesCache[key]) {
      this.categoriesCache[key] = this.http.get(this.baseUrl, { params }).pipe(
        shareReplay(1)
      );
    }
    return this.categoriesCache[key];
  }

  getSlotsCategories(): Observable<any> {
    if (!this.slotsCategoriesCache) {
      this.slotsCategoriesCache = this.http.get(`${this.baseUrl}/slots`).pipe(
        shareReplay(1)
      );
    }
    return this.slotsCategoriesCache;
  }

  getLiveCategories(): Observable<any> {
    if (!this.liveCategoriesCache) {
      this.liveCategoriesCache = this.http.get(`${this.baseUrl}/live`).pipe(
        shareReplay(1)
      );
    }
    return this.liveCategoriesCache;
  }

  createCategory(category: Category): Observable<any> {
    return this.http.post(this.baseUrl, category);
  }

  getCategory(id: number): Observable<any> {
    if (!this.categoryCache[id]) {
      this.categoryCache[id] = this.http.get(`${this.baseUrl}/${id}`).pipe(
        shareReplay(1)
      );
    }
    return this.categoryCache[id];
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
