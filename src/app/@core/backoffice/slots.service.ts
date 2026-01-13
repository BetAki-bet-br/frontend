import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Slot } from './models';

@Injectable({
  providedIn: 'root',
})
export class SlotsService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.backofficeApiUrl}/api/v1/slots`;

  getSlots(params?: { q?: string; status?: 'active' | 'inactive' }): Observable<Slot[]> {
    return this.http.get<Slot[]>(this.baseUrl, { params });
  }

  getSlotsByExternalIds(externalIds: string[]): Observable<Slot[]> {
    return this.http.post<Slot[]>(`${this.baseUrl}/by-ids`, { externalIds });
  }

  createSlot(slot: Slot): Observable<Slot> {
    return this.http.post<Slot>(this.baseUrl, slot);
  }

  getSlot(id: number): Observable<Slot> {
    return this.http.get<Slot>(`${this.baseUrl}/${id}`);
  }

  updateSlot(id: number, slot : Slot): Observable<Slot> {
    return this.http.put<Slot>(`${this.baseUrl}/${id}`, slot);
  }

  deleteSlot(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
