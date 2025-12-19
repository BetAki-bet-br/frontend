import { TestBed } from '@angular/core/testing';

import { GoogleTagManagerImplementationService } from './google-tag-manager-implementation.service';
import {
  BalanceService,
  BannerService,
  BonusService,
  LoyaltyService,
  ProdGameService,
  PromotionService,
} from '@icore/ngx-portalgateway-api-client-atl';
import { MockCtgApiService } from '../http/ctg-api.service.mock';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { RenderTemplatePipe } from '@app/@pipes/render-template.pipe';
import { EllipsisPipe } from '@app/@pipes/ellipsis.pipe';
import { ActivatedRoute } from '@angular/router';
import { MockTemplateService } from './template.service.mock';
import { TemplateService } from './template.service';
import { HttpBackend } from '@angular/common/http';

class MockTranslateService {
  currentLang = '';
  onLangChange = new Subject();

  use(language: string) {
    this.currentLang = language;
    this.onLangChange.next({
      lang: this.currentLang,
      translations: {},
    });
  }

  getBrowserCultureLang() {
    return 'en-US';
  }

  setTranslation(lang: string, translations: object, shouldMerge?: boolean) {}
}

describe('GoogleTagManagerService', () => {
  let service: GoogleTagManagerImplementationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: BonusService, useClass: MockCtgApiService },
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: LoyaltyService, useClass: MockCtgApiService },
        { provide: BalanceService, useClass: MockCtgApiService },
        { provide: PromotionService, useClass: MockCtgApiService },
        { provide: ProdGameService, useClass: MockCtgApiService },
        RenderTemplatePipe,
        EllipsisPipe,
        { provide: ActivatedRoute, useValue: {} },
        { provide: TemplateService, useClass: MockTemplateService },
        { provide: BannerService, useClass: MockCtgApiService },
        HttpBackend,
      ],
    });
    service = TestBed.inject(GoogleTagManagerImplementationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
