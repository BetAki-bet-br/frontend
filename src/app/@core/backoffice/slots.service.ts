import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { BRAND } from '@app/@core/brand';
import { Slot } from './models';

@Injectable({
  providedIn: 'root',
})
export class SlotsService {
  private http = inject(HttpClient);
  private readonly brand = inject(BRAND);
  private readonly baseUrl = `${this.brand.api.backofficeApiUrl}/api/v1/slots`;

  private slotsByIdsCache: Record<string, Observable<Slot[]>> = {};

  getSlots(params?: { q?: string; status?: 'active' | 'inactive' }): Observable<Slot[]> {
    return this.http.get<Slot[]>(this.baseUrl, { params });
  }

  getSlotsByExternalIds(externalIds: string[]): Observable<Slot[]> {
    const key = [...externalIds].sort().join(',');
    if (!this.slotsByIdsCache[key]) {
      this.slotsByIdsCache[key] = this.http
        .post<Slot[]>(`${this.baseUrl}/by-ids`, { externalIds })
        .pipe(shareReplay(1));
    }
    return this.slotsByIdsCache[key];
  }

  createSlot(slot: Slot): Observable<Slot> {
    return this.http.post<Slot>(this.baseUrl, slot);
  }

  getSlot(id: number): Observable<Slot> {
    return this.http.get<Slot>(`${this.baseUrl}/${id}`);
  }

  updateSlot(id: number, slot: Slot): Observable<Slot> {
    return this.http.put<Slot>(`${this.baseUrl}/${id}`, slot);
  }

  deleteSlot(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getSlotByExternalId(externalId: string): Observable<Slot> {
    return this.http.get<Slot>(`${this.baseUrl}/by-external-id/${externalId}`);
  }
}
