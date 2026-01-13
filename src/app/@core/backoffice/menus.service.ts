import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '@env/environment';
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
  private readonly baseUrl = `${environment.backofficeApiUrl}/api/v1/menus`;

  getMenus(): Observable<MenuApi[]> {
    return this.http.get<GetMenusResponse>(this.baseUrl).pipe(
      map((response) => {
        console.log(response.data);
        return response.data;
      }),
    );
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
