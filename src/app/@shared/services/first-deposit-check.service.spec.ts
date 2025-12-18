import { TestBed } from '@angular/core/testing';

import { FirstDepositCheckService } from './first-deposit-check.service';
import {
  BalanceService,
  BannerService,
  BonusService,
  GlobalizationService,
  LoyaltyService,
  MessageService,
  PlayerService,
  ProdGameService,
  PromotionService,
} from '@icore/ngx-portalgateway-api-client-atl';
import { Dialog } from '@angular/cdk/dialog';
import { MockCtgApiService } from '../http/ctg-api.service.mock';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { RenderTemplatePipe } from '@app/@pipes/render-template.pipe';
import { EllipsisPipe } from '@app/@pipes/ellipsis.pipe';
import { TemplateService } from './template.service';
import { MockTemplateService } from './template.service.mock';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PlayerStatusService } from './player.service';
import { MockPlayerStatusService } from './player-service.mock';
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

describe('FirstDepositCheckService', () => {
  let service: FirstDepositCheckService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: GlobalizationService, useValue: MockCtgApiService },
        { provide: PlayerService, useValue: MockCtgApiService },
        { provide: ProdGameService, useValue: MockCtgApiService },
        { provide: Dialog, useValue: {} },
        { provide: BonusService, useClass: MockCtgApiService },
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: LoyaltyService, useClass: MockCtgApiService },
        { provide: BalanceService, useClass: MockCtgApiService },
        { provide: PromotionService, useClass: MockCtgApiService },
        { provide: BannerService, useClass: MockCtgApiService },
        RenderTemplatePipe,
        EllipsisPipe,
        { provide: MatSnackBar, useValue: {} },
        { provide: TemplateService, useClass: MockTemplateService },
        { provide: MessageService, useClass: MockCtgApiService },
        { provide: PlayerStatusService, useClass: MockPlayerStatusService },
        HttpBackend,
      ],
    });
    service = TestBed.inject(FirstDepositCheckService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
