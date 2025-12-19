import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PortalService {
  readonly portalId: number = 5;
  readonly isMobile: boolean = false;
}
