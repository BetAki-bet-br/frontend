import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay, catchError, of } from 'rxjs';

export interface CategoryOrder {
  [portalId: string]: {
    Casino: string[];
    'Live Casino': string[];
  };
}

@Injectable({
  providedIn: 'root',
})
export class CategoryOrderService {
  private http = inject(HttpClient);
  private categoryOrder$: Observable<CategoryOrder | null>;

  constructor() {
    this.categoryOrder$ = this.http.get<CategoryOrder>('assets/category-order.json').pipe(
      shareReplay(1),
      catchError(() => {
        console.error('Failed to load category-order.json');
        return of(null);
      })
    );
  }

  getCategoryOrder(portalId: number, lobby: 'Casino' | 'Live Casino'): Observable<string[] | null> {
    return this.categoryOrder$.pipe(
      map((order) => {
        if (!order || !order[portalId] || !order[portalId][lobby]) {
          return null;
        }
        return order[portalId][lobby];
      })
    );
  }
}
