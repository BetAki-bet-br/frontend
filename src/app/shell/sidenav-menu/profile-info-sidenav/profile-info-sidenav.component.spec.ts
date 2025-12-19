import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileInfoSidenavComponent } from './profile-info-sidenav.component';
import { TranslateModule } from '@ngx-translate/core';
import { DialogModule } from '@angular/cdk/dialog';
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
import { RenderTemplatePipe } from '@app/@pipes/render-template.pipe';
import { EllipsisPipe } from '@app/@pipes/ellipsis.pipe';
import { ActivatedRoute } from '@angular/router';
import { TemplateService } from '@app/@shared/services/template.service';
import { MockTemplateService } from '@app/@shared/services/template.service.mock';
import { HttpBackend } from '@angular/common/http';

describe('ProfileInfoSidenavComponent', () => {
  let component: ProfileInfoSidenavComponent;
  let fixture: ComponentFixture<ProfileInfoSidenavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), DialogModule, ProfileInfoSidenavComponent],
      providers: [
        { provide: PlayerStatusService, useValue: {} },
        { provide: GlobalizationService, useValue: {} },
        { provide: PlayerService, useValue: {} },
        { provide: ProdGameService, useValue: {} },
        { provide: BonusService, useClass: MockCtgApiService },
        { provide: PromotionService, useClass: MockCtgApiService },
        RenderTemplatePipe,
        EllipsisPipe,
        { provide: ActivatedRoute, useValue: {} },
        { provide: TemplateService, useClass: MockTemplateService },
        { provide: BannerService, useClass: MockCtgApiService },
        HttpBackend,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileInfoSidenavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
