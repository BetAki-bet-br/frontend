import { Injectable, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router';
import { Observable, filter, map, take } from 'rxjs';
import { AffiliateData } from '../models';
import { environment } from '@env/environment';
import { Logger } from '@app/@shared/logger.service';

const log = new Logger('AffiliatesService');

@Injectable({
  providedIn: 'root',
})
export class AffiliatesService {
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  /**
   * Handle affiliates links. Saves affiliates query parameters to Local storage.
   *
   * Saves to Local storage only if `token` and `AffCampaign` parameters are set
   * and it always overwrites the values in Local storage.
   */
  handleQueryParams(): Observable<string> {
    return this.activatedRoute.queryParams.pipe(
      filter((params: Params) => params['token'] && params['affiliateId']),
      take(1),
      map((params) => {
        const affiliateId: string = params['affiliateId'] ? params['affiliateId'] : 'Unknown';
        const token: string = params['token'];

        const affiliateDataExpiryOffset = environment.deployConfig.affiliateDataExpiryOffset;
        const currentDate = new Date();
        const expiryDate = currentDate.setHours(currentDate.getHours() + affiliateDataExpiryOffset);

        const affiliateData: AffiliateData = {
          affiliateId,
          token,
        };

        const affiliateDataItem = {
          value: affiliateData,
          expiry: expiryDate,
        };
        try {
          localStorage.setItem('affiliateData', JSON.stringify(affiliateDataItem));
        } catch (error) {
          log.error('Error saving to local storage', error);
        }

        return token;
      }),
    );
  }

  /**
   * Appends the affiliate token to url if exists in Local storage.
   */
  handleUrlToken(): Observable<string | null> {
    return this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).pipe(
      map((event) => {
        const affiliateSession = this.getCurrentAffiliateData();
        if (affiliateSession) {
          const queryParams = this.activatedRoute?.snapshot?.queryParams;
          if (affiliateSession?.token && !queryParams['token']) {
            return affiliateSession.token;
          }
        }

        return null;
      }),
    );
  }

  /**
   * Get the currently saved affiliate data,  clear it if expired.
   */
  getCurrentAffiliateData(): AffiliateData | null {
    const affiliateLocalStorage = localStorage.getItem('affiliateData');
    if (affiliateLocalStorage) {
      const affiliateDataItem = JSON.parse(affiliateLocalStorage);
      const expirtyDate = new Date(affiliateDataItem.expiry);
      const now = new Date();

      if (expirtyDate >= now) {
        return affiliateDataItem.value;
      } else {
        this.clearCurrentAffiliateData();
        return null;
      }
    }

    return null;
  }

  /**
   * Clear the affiliate data from storage
   */
  clearCurrentAffiliateData() {
    localStorage.removeItem('affiliateData');
  }
}
