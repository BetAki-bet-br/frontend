import { Injectable, inject } from '@angular/core';
import { CONTENT_GATEWAY } from '@app/@core/gateway';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HelpService {
  private gateway = inject(CONTENT_GATEWAY);

  /** The current terms and conditions, as HTML. */
  public getTermsAndConditions(): Observable<string> {
    return this.gateway.getTermsAndConditions();
  }
}
