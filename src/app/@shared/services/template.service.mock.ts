import { Injectable } from '@angular/core';
import { CmsTemplate } from '@app/@core/gateway';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MockTemplateService {
  templateRouteChangeSubscribe(): void {}

  getTemplatesList(): Observable<CmsTemplate[]> {
    return of([]);
  }
}
