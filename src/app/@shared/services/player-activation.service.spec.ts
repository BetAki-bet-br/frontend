import { TestBed } from '@angular/core/testing';

import { PlayerActivationService } from './player-activation.service';
import { ActivatedRoute } from '@angular/router';
import {
  BannerService,
  BonusService,
  GlobalizationService,
  MessageService,
  PlayerService,
  ProdGameService,
  PromotionService,
  TemplateService,
} from '@icore/ngx-portalgateway-api-client-atl';
import { MockCtgApiService } from '../http/ctg-api.service.mock';
import { Dialog } from '@angular/cdk/dialog';
import { EllipsisPipe } from '@app/@pipes/ellipsis.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RenderTemplatePipe } from '@app/@pipes/render-template.pipe';
import { HttpBackend } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('PlayerActivationService', () => {
  let service: PlayerActivationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        { provide: PlayerService, useClass: MockCtgApiService },
        { provide: MessageService, useClass: MockCtgApiService },
        { provide: Dialog, useValue: {} },
        { provide: MatSnackBar, useValue: {} },
        { provide: GlobalizationService, useClass: MockCtgApiService },
        { provide: ProdGameService, useClass: MockCtgApiService },
        { provide: BonusService, useClass: MockCtgApiService },
        { provide: PromotionService, useClass: MockCtgApiService },
        { provide: TemplateService, useClass: MockCtgApiService },
        { provide: BannerService, useClass: MockCtgApiService },
        { provide: HttpBackend },
        EllipsisPipe,
        RenderTemplatePipe,
      ],
    });
    service = TestBed.inject(PlayerActivationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
