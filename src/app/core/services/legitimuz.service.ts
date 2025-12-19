import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LegitimuzRequest, LegitimuzResponse } from '../models/legitimuz.models';

@Injectable({
  providedIn: 'root',
})
export class LegitimuzService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.legitimuzHost;
  private readonly token = environment.legitimuzSDKToken;

  analyzeSignup(payload: LegitimuzRequest): Observable<LegitimuzResponse> {
    const url = `${this.baseUrl}/external/fraud-prevention/analysis`;

    const params = new HttpParams()
      .set('token', this.token)
      .set('action', 'signup')
      .set('betsafe_action', 'signup');

    return this.http.post<LegitimuzResponse>(url, payload, { params });
  }

  analyzeSignin(payload: LegitimuzRequest): Observable<LegitimuzResponse> {
    const url = `${this.baseUrl}/external/fraud-prevention/analysis`;

    const params = new HttpParams()
      .set('token', this.token)
      .set('action', 'signin')
      .set('betsafe_action', 'signin');

    return this.http.post<LegitimuzResponse>(url, payload, { params });
  }
}
