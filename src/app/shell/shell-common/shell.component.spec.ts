import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '@app/material.module';

import { AuthenticationService, CredentialsService } from '@app/auth';
import { MockAuthenticationService } from '@app/auth/authentication.service.mock';
import { MockCredentialsService } from '@app/auth/credentials.service.mock';

import { I18nModule } from '@app/i18n';
import { ShellComponent } from './shell.component';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { ConfigurationService } from '@app/@core/configuration.service';
import { MockConfigurationService } from '@app/@core/configuration.service.mock';
import { PlayerStatusService } from '@app/@shared/services/player.service';
import { PipesModule } from '@app/@pipes/pipes.module';
import {
  BannerService,
  BonusService,
  ProdGameService,
  PromotionService,
} from '@icore/ngx-portalgateway-api-client-atl';
import { MockCtgApiService } from '@app/@shared/http/ctg-api.service.mock';
import { TemplateService } from '@app/@shared/services/template.service';
import { MockTemplateService } from '@app/@shared/services/template.service.mock';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgcCookieConsentService } from 'ngx-cookieconsent';

describe('ShellComponent', () => {
  let component: ShellComponent;
  let fixture: ComponentFixture<ShellComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        I18nModule,
        BrowserAnimationsModule,
        MaterialModule,
        RouterTestingModule,
        PipesModule,
        HttpClientTestingModule,
      ],
      providers: [
        { provide: AuthenticationService, useClass: MockAuthenticationService },
        { provide: CredentialsService, useClass: MockCredentialsService },
        { provide: ConfigurationService, useClass: MockConfigurationService },
        { provide: PlayerStatusService, useValue: {} },
        { provide: BonusService, useClass: MockCtgApiService },
        { provide: PromotionService, useClass: MockCtgApiService },
        { provide: ProdGameService, useClass: MockCtgApiService },
        { provide: BannerService, useClass: MockCtgApiService },
        { provide: TemplateService, useClass: MockTemplateService },
        {
          provide: NgcCookieConsentService,
          useValue: jasmine.createSpyObj('NgcCookieConsentService', ['hasConsented', 'hasAnswered']),
        },
      ],
      declarations: [HeaderComponent, FooterComponent, ShellComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
