import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromotionsComponent } from './promotions.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialogModule } from '@angular/material/dialog';
import {
  BannerService,
  BonusService,
  GlobalizationService,
  PlayerService,
  ProdGameService,
  PromotionService,
} from '@icore/ngx-portalgateway-api-client-atl';
import { MockCtgApiService } from '@app/@shared/http/ctg-api.service.mock';
import { PipesModule } from '@app/@pipes/pipes.module';
import { PlayerStatusService } from '@app/@shared/services/player.service';
import { ActivatedRoute } from '@angular/router';
import { MockTemplateService } from '@app/@shared/services/template.service.mock';
import { TemplateService } from '@app/@shared/services/template.service';
import { CmsService } from '@app/@shared/services/cms.service';
import { HttpClientModule } from '@angular/common/http';
import { AuthDialogService } from '@app/auth/auth-dialog.service';

describe('PromotionsComponent', () => {
  let component: PromotionsComponent;
  let fixture: ComponentFixture<PromotionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PromotionsComponent],
      imports: [HttpClientModule, TranslateModule.forRoot(), MatDialogModule, PipesModule],
      providers: [
        { provide: BonusService, useClass: MockCtgApiService },
        { provide: PlayerStatusService, useValue: {} },
        { provide: GlobalizationService, useValue: {} },
        { provide: PlayerService, useValue: {} },
        { provide: ProdGameService, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
        { provide: TemplateService, useClass: MockTemplateService },
        { provide: PromotionService, useClass: MockCtgApiService },
        { provide: BannerService, useClass: MockCtgApiService },
        { provide: CmsService, useValue: {} },
        { provide: AuthDialogService, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PromotionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
