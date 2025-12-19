import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidenavMenuComponent } from './sidenav-menu.component';
import { AuthenticationService } from '@app/auth';
import { SharedModule } from '@app/@shared';
import { TranslateModule } from '@ngx-translate/core';
import { ConfigurationService } from '@app/@core/configuration.service';
import { MockConfigurationService } from '@app/@core/configuration.service.mock';
import { RouterTestingModule } from '@angular/router/testing';
import {
  BannerService,
  BonusService,
  ProdGameService,
  PromotionService,
} from '@icore/ngx-portalgateway-api-client-atl';
import { HttpClientModule } from '@angular/common/http';
import { MockCtgApiService } from '@app/@shared/http/ctg-api.service.mock';
import { ActivatedRoute } from '@angular/router';
import { TemplateService } from '@app/@shared/services/template.service';
import { MockTemplateService } from '@app/@shared/services/template.service.mock';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('SidenavMenuComponent', () => {
  let component: SidenavMenuComponent;
  let fixture: ComponentFixture<SidenavMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule, TranslateModule.forRoot(), RouterTestingModule, HttpClientModule, NoopAnimationsModule],
      declarations: [SidenavMenuComponent],
      providers: [
        { provide: AuthenticationService, useValue: {} },
        { provide: ConfigurationService, useClass: MockConfigurationService },
        { provide: ProdGameService, useValue: {} },
        { provide: BonusService, useClass: MockCtgApiService },
        { provide: PromotionService, useClass: MockCtgApiService },
        { provide: ActivatedRoute, useValue: {} },
        { provide: TemplateService, useClass: MockTemplateService },
        { provide: BannerService, useClass: MockCtgApiService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SidenavMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
