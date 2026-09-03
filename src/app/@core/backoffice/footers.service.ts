import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BRAND } from '@app/@core/brand';
import { Footer, FooterIndex, FooterLink } from './models';

@Injectable({
  providedIn: 'root',
})
export class FootersService {
  private http = inject(HttpClient);
  private readonly brand = inject(BRAND);
  private readonly baseUrl = `${this.brand.api.backofficeApiUrl}/api/v1/footers`;

  getFooters(params?: { q?: string; status?: string; country?: string }): Observable<FooterIndex> {
    return this.http.get<FooterIndex>(this.baseUrl, { params });
  }

  createFooter(footer: Partial<Footer>): Observable<Footer> {
    return this.http.post<Footer>(this.baseUrl, footer);
  }

  getFooter(id: number): Observable<Footer> {
    return this.http.get<Footer>(`${this.baseUrl}/${id}`);
  }

  updateFooter(id: number, footer: Partial<Footer>): Observable<Footer> {
    return this.http.put<Footer>(`${this.baseUrl}/${id}`, footer);
  }

  deleteFooter(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  publishFooter(id: number): Observable<Footer> {
    return this.http.post<Footer>(`${this.baseUrl}/${id}/publish`, {});
  }

  syncLinks(id: number, links: FooterLink[]): Observable<Footer> {
    return this.http.put<Footer>(`${this.baseUrl}/${id}/links`, { links });
  }
}
