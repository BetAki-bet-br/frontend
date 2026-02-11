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
  private categoryCache: Record<string, Observable<any>> = {};

  getCategories(params?: {
    q?: string;
    status?: 'active' | 'inactive';
    vertical?: 'slots' | 'live';
    type?: string;
  }): Observable<any> {
    const key = JSON.stringify(params || {});
    if (!this.categoriesCache[key]) {
      this.categoriesCache[key] = this.http.get(this.baseUrl, { params }).pipe(shareReplay(1));
    }
    return this.categoriesCache[key];
  }

  getSlotsCategories(): Observable<any> {
    if (!this.slotsCategoriesCache) {
      this.slotsCategoriesCache = this.http.get(`${this.baseUrl}/slots`).pipe(shareReplay(1));
    }
    return this.slotsCategoriesCache;
  }

  getLiveCategories(): Observable<any> {
    if (!this.liveCategoriesCache) {
      this.liveCategoriesCache = this.http.get(`${this.baseUrl}/live`).pipe(shareReplay(1));
    }
    return this.liveCategoriesCache;
  }

  getCategory(
    id: number,
    params: {
      with_slots?: boolean;
      slots_limit?: number;
      slots_page?: number;
    } = {},
  ): Observable<any> {
    const cacheKey =
      id +
      '?' +
      new URLSearchParams(
        Object.entries(params)
          .filter(([, value]) => value !== undefined && value !== null)
          .map(([key, value]) => [key, String(value)]),
      ).toString();

    if (!this.categoryCache[cacheKey]) {
      this.categoryCache[cacheKey] = this.http
        .get(`${this.baseUrl}/${id}`, { params: params as any })
        .pipe(shareReplay(1));
    }
    return this.categoryCache[cacheKey];
  }
}
