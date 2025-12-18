import { Injectable, inject } from '@angular/core';
import { DataStoreService } from '@app/@core';
import { I18nService } from '@app/i18n';
import { TemplateService } from '@icore/ngx-portalgateway-api-client-atl';

@Injectable({
  providedIn: 'root',
})
export class HelpService {
  private templateService = inject(TemplateService);
  private dataStoreService = inject(DataStoreService);
  private i18nService = inject(I18nService);

  public getTermsAndConditions() {
    return this.templateService.apiPortalV1TemplateTermsAndConditionsGet(
      this.dataStoreService.defaultPortalId,
      this.i18nService.language
      //this.dataStoreService.defaultLanguage,
    );
  }
}
