import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BannerPromotionsComponent } from './banner-promotions.component';
import { MockCtgApiService } from '@app/@shared/http/ctg-api.service.mock';
import { CmsService } from '@app/@shared/services/cms.service';
import { MockTemplateService } from '@app/@shared/services/template.service.mock';
import { TemplateService, PromotionService, BannerService } from '@icore/ngx-portalgateway-api-client-atl';
import { TranslateModule } from '@ngx-translate/core';
import { MockCmsService } from '@app/@shared/services/cms.service.mock';

describe('BannerPromotionsComponent', () => {
  let component: BannerPromotionsComponent;
  let fixture: ComponentFixture<BannerPromotionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), BannerPromotionsComponent],
      providers: [
        { provide: TemplateService, useClass: MockTemplateService },
        { provide: PromotionService, useClass: MockCtgApiService },
        { provide: BannerService, useClass: MockCtgApiService },
        { provide: CmsService, useClass: MockCmsService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BannerPromotionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
