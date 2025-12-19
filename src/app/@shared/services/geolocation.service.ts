import { HttpClient, HttpErrorResponse, HttpEvent, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Logger } from '@app/@shared/logger.service';
import { BehaviorSubject, Observable, catchError, map, of, take, throwError } from 'rxjs';
import { environment } from '@env/environment';

const log = new Logger('GeoLocationService');

interface GeoLocation {
  ip: string;
  network: string;
  version: string;
  city: string;
  region: string;
  region_code: string;
  country: string;
  country_name: string;
  country_code: string;
  country_code_iso3: string;
  country_capital: string;
  country_tld: string;
  continent_code: string;
  in_eu: boolean;
  postal: string;
  latitude: number;
  longitude: number;
  timezone: string;
  utc_offset: string;
  country_calling_code: string;
  currency: string;
  currency_name: string;
  languages: string;
  country_area: number;
  country_population: number;
  asn: string;
  org: string;
}

export interface GeoLocationMapped {
  country_code: string;
  country_name: string;
  continent_code: string;
  in_eu: boolean;
  country_calling_code: string;
  currency: string;
  currency_name: string;
}

export enum EnumAllowedCurrencies {
  EUR = 'EUR',
  USD = 'USD',
  NZD = 'NZD',
  CAD = 'CAD',
}

export enum EnumEdgeCaseCountries {
  CA = 'CA',
  NZ = 'NZ',
}

@Injectable({
  providedIn: 'root',
})
export class GeoLocationService {
  private httpClient = inject(HttpClient);

  private _geoLocationData: BehaviorSubject<GeoLocationMapped | null> = new BehaviorSubject<GeoLocationMapped | null>(
    null
  );
  readonly geoLocationData$: Observable<GeoLocationMapped | null> = this._geoLocationData.asObservable();

  // 'ipapi' is a premium service that offers 30.000 API calls per month for free (~1000 API calls per day)
  // last checked: 2023_07_10 at 10:18 AM
  private basePath: string | null = environment?.API_GEOLOCATION_PATH ?? null;
  private defaultHeaders = new HttpHeaders();

  getLocationByIP(): Observable<GeoLocationMapped | null> {
    // check if geolocation data exists in memory
    if (this.checkGeoLocationData()) {
      // return geolocation data from memory
      return this.geoLocationData$;
    }
    // check configurations for geolocation API path
    if (!this.basePath || this.basePath === null) {
      return throwError(() => 'Geolocation API base path not set');
    }
    // if geolocation data doesn't exist in memory, fetch it from server
    return this.apiGetLocationByIP().pipe(
      map((data: GeoLocation) => {
        const ipLocMapped: GeoLocationMapped = {
          ...data,
        };
        this._geoLocationData.next(ipLocMapped);
        return ipLocMapped;
      }),
      // catch HttpErrorResponse and pass it on
      catchError((error: HttpErrorResponse) => {
        log.debug('GeoLocationService -> getLocationByIP API call failed with error: ', error);
        this._geoLocationData.next(null);
        return of(null);
      })
    );
  }

  private checkGeoLocationData(): boolean {
    return this._geoLocationData.getValue() !== undefined && this._geoLocationData.getValue() !== null;
  }

  private apiGetLocationByIP(observe?: 'body', reportProgress?: boolean): Observable<GeoLocation>;
  private apiGetLocationByIP(observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<GeoLocation>>;
  private apiGetLocationByIP(observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<GeoLocation>>;
  private apiGetLocationByIP(observe: any = 'body', reportProgress: boolean = false): Observable<any> {
    let headers = this.defaultHeaders;
    let httpHeaderAccepts = ['application/json'];
    headers = headers.set('Accept', httpHeaderAccepts[0]);
    return this.httpClient.request('get', `${this.basePath}`, {
      headers: headers,
      observe: observe,
      reportProgress: reportProgress,
    });
  }
}
