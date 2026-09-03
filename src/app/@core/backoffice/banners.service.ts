import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BRAND } from '@app/@core/brand';
import { Banner, BannerIndex, BannerStoreRequest } from './models';

@Injectable({
  providedIn: 'root',
})
export class BannersService {
  private http = inject(HttpClient);
  private readonly brand = inject(BRAND);
  private readonly baseUrl = `${this.brand.api.backofficeApiUrl}/api/v1/banners`;

  getBanners(params?: any): Observable<BannerIndex> {
    return this.http.get<BannerIndex>(this.baseUrl, { params });
  }
}
