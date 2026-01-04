import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Menu } from './models';

@Injectable({
  providedIn: 'root'
})
export class MenusService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.backofficeApiUrl}/api/v1/menus`;

  getMenus(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  createMenu(menu: Menu): Observable<any> {
    return this.http.post(this.baseUrl, menu);
  }

  getMenuItems(menuId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${menuId}/items`);
  }

  createMenuItem(menuId: number, item: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/${menuId}/items`, item);
  }

  syncMenuTree(menuId: number, tree: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${menuId}/items/tree`, tree);
  }
}