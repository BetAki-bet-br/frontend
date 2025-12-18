import { Injectable } from '@angular/core';
import { ContentFieldValue, TemplateData } from '@icore/ngx-portalgateway-api-client-atl';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MockTemplateService {
  templateRouteChangeSubscribe(): void {}

  transformContent(contentFieldValues: ContentFieldValue[] | undefined): { [key: string]: any } {
    return {};
  }

  getTemplatesList(): Observable<TemplateData[]> {
    return of([]);
  }
}
