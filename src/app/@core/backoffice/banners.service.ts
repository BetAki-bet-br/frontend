import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Banner, BannerIndex, BannerStoreRequest } from './models';

@Injectable({
  providedIn: 'root'
})
export class BannersService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.backofficeApiUrl}/api/v1/banners`;

  getBanners(params?: any): Observable<BannerIndex> {
    return this.http.get<BannerIndex>(this.baseUrl, { params });
  }

  createBanner(banner: BannerStoreRequest): Observable<Banner> {
    return this.http.post<Banner>(this.baseUrl, banner);
  }

  updateBanner(id: number, banner: BannerStoreRequest): Observable<Banner> {
    return this.http.put<Banner>(`${this.baseUrl}/${id}`, banner);
  }

  publishBanner(id: number): Observable<Banner> {
    return this.http.post<Banner>(`${this.baseUrl}/${id}/publish`, {});
  }
}
