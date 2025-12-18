import { Injectable } from '@angular/core';
import { Banner } from '../models/banner.model';
import { Observable, of } from 'rxjs';
import { GameTile } from '../models';
import { CurrentBannersData } from '@app/@core';

@Injectable({
  providedIn: 'root',
})
export class MockCmsService {
  constructor() {}

  getActiveMainBanners(): Observable<CurrentBannersData> {
    return of();
  }

  getPromotionsBanners(): Observable<CurrentBannersData> {
    return of();
  }

  getBannersForPromotions(): Observable<CurrentBannersData> {
    return of();
  }
}
