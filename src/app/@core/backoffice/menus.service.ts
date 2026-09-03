import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, shareReplay } from 'rxjs';
import { BRAND } from '@app/@core/brand';
import { Menu } from './models';
import { MenuApi } from '@app/@shared/models/menu-api.model';

interface GetMenusResponse {
  data: MenuApi[];
}

@Injectable({
  providedIn: 'root',
})
export class MenusService {
  private http = inject(HttpClient);
  private readonly brand = inject(BRAND);
  private readonly baseUrl = `${this.brand.api.backofficeApiUrl}/api/v1/menus`;
  private _menus$: Observable<MenuApi[]> | undefined;

  getMenus(): Observable<MenuApi[]> {
    if (!this._menus$) {
      this._menus$ = this.http.get<GetMenusResponse>(this.baseUrl).pipe(
        map((response) => {
          return response.data;
        }),
        shareReplay({ bufferSize: 1, refCount: true }),
      );
    }
    return this._menus$;
  }

  createMenu(menu: Menu): Observable<MenuApi[]> {
    return this.http.post<MenuApi[]>(this.baseUrl, menu);
  }

  getMenuItems(menuId: number): Observable<MenuApi[]> {
    return this.http.get<MenuApi[]>(`${this.baseUrl}/${menuId}/items`);
  }

  createMenuItem(menuId: number, item: MenuApi[]): Observable<MenuApi[]> {
    return this.http.post<MenuApi[]>(`${this.baseUrl}/${menuId}/items`, item);
  }

  syncMenuTree(menuId: number, tree: MenuApi[]): Observable<MenuApi[]> {
    return this.http.put<MenuApi[]>(`${this.baseUrl}/${menuId}/items/tree`, tree);
  }
}
