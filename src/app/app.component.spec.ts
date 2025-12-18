import { RouterModule } from '@angular/router';
import { async, TestBed, waitForAsync } from '@angular/core/testing';

import { TranslateModule } from '@ngx-translate/core';

import { Dialog } from '@angular/cdk/dialog';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FingerprintjsProAngularService } from '@fingerprintjs/fingerprintjs-pro-angular';
import {
  BannerService,
  BonusService,
  ProdGameService,
  PromotionService,
} from '@icore/ngx-portalgateway-api-client-atl';
import { NgcCookieConsentModule } from 'ngx-cookieconsent';
import { CdnizePipe } from './@pipes/cdnize.pipe';
import { EllipsisPipe } from './@pipes/ellipsis.pipe';
import { RenderTemplatePipe } from './@pipes/render-template.pipe';
import { MockCtgApiService } from './@shared/http/ctg-api.service.mock';
import { CmsService } from './@shared/services/cms.service';
import { MockCmsService } from './@shared/services/cms.service.mock';
import { GamesService } from './@shared/services/games/games.service';
import { MockGamesService } from './@shared/services/games/games.service.mock';
import { IntercomScriptService } from './@shared/services/intercom-script.service';
import { MockIntercomScriptService } from './@shared/services/intercom-script.service.mock';
import { MessageService } from './@shared/services/message.service';
import { MockPlayerStatusService } from './@shared/services/player-service.mock';
import { PlayerStatusService } from './@shared/services/player.service';
import { TemplateService } from './@shared/services/template.service';
import { MockTemplateService } from './@shared/services/template.service.mock';
import { AppComponent } from './app.component';

fdescribe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        NgcCookieConsentModule.forRoot({}),
        MatSnackBarModule,
        AppComponent,
        RouterModule,
      ],
      providers: [
        { provide: GamesService, useClass: MockGamesService },
        { provide: MessageService, useClass: MockGamesService },
        { provide: PlayerStatusService, useClass: MockPlayerStatusService },
        { provide: IntercomScriptService, useClass: MockIntercomScriptService },
        { provide: BonusService, useClass: MockCtgApiService },
        { provide: BannerService, useClass: MockCtgApiService },
        { provide: PromotionService, useClass: MockCtgApiService },
        { provide: TemplateService, useClass: MockTemplateService },
        { provide: CmsService, useClass: MockCmsService },
        { provide: ProdGameService, useValue: {} },
        { provide: Dialog, useValue: {} },
        RenderTemplatePipe,
        EllipsisPipe,
        CdnizePipe,
        {
          provide: FingerprintjsProAngularService,
          useValue: {
            getApiKey: () => 'test_key', // ensure this matches the logic in your useFactory
          },
        },
        provideHttpClient(withInterceptorsFromDi()),
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });
});
