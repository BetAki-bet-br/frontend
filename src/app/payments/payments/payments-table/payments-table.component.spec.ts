import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentsTableComponent } from './payments-table.component';
import { MatDialogModule } from '@angular/material/dialog';
import { PlayerStatusService } from '@app/@shared/services/player.service';
import {
  BannerService,
  BonusService,
  GlobalizationService,
  PlayerService,
  ProdGameService,
  PromotionService,
} from '@icore/ngx-portalgateway-api-client-atl';
import { MockCtgApiService } from '@app/@shared/http/ctg-api.service.mock';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { RenderTemplatePipe } from '@app/@pipes/render-template.pipe';
import { EllipsisPipe } from '@app/@pipes/ellipsis.pipe';
import { ActivatedRoute } from '@angular/router';
import { MockTemplateService } from '@app/@shared/services/template.service.mock';
import { TemplateService } from '@app/@shared/services/template.service';
import { AuthDialogService } from '@app/auth/auth-dialog.service';
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

describe('PaymentsTableComponent', () => {
  let component: PaymentsTableComponent;
  let fixture: ComponentFixture<PaymentsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaymentsTableComponent],
      imports: [MatDialogModule],
      providers: [
        { provide: PlayerStatusService, useValue: {} },
        { provide: GlobalizationService, useValue: {} },
        { provide: PlayerService, useValue: {} },
        { provide: ProdGameService, useValue: {} },
        { provide: BonusService, useClass: MockCtgApiService },
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: PromotionService, useClass: MockCtgApiService },
        { provide: BannerService, useClass: MockCtgApiService },
        RenderTemplatePipe,
        EllipsisPipe,
        { provide: TemplateService, useClass: MockTemplateService },
        { provide: ActivatedRoute, useValue: {} },
        { provide: AuthDialogService, useValue: {} },
        HttpBackend,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
