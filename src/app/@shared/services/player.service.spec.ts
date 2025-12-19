import { TestBed } from '@angular/core/testing';

import { PlayerStatusService } from './player.service';
import {
  BalanceService,
  GlobalizationService,
  LoyaltyService,
  PlayerService,
  ProdGameService,
} from '@icore/ngx-portalgateway-api-client-atl';
import { TranslateModule } from '@ngx-translate/core';
import { MockCtgApiService } from '../http/ctg-api.service.mock';
import { Dialog } from '@angular/cdk/dialog';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RenderTemplatePipe } from '@app/@pipes/render-template.pipe';
import { EllipsisPipe } from '@app/@pipes/ellipsis.pipe';
import { ActivatedRoute } from '@angular/router';
import { FingerprintjsProAngularService } from '@fingerprintjs/fingerprintjs-pro-angular';

describe('PlayerService', () => {
  let service: PlayerStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: LoyaltyService, useClass: MockCtgApiService },
        { provide: BalanceService, useClass: MockCtgApiService },
        { provide: GlobalizationService, useClass: MockCtgApiService },
        { provide: PlayerService, useClass: MockCtgApiService },
        { provide: ProdGameService, useClass: MockCtgApiService },
        {
          provide: FingerprintjsProAngularService,
          useValue: {
            getApiKey: () => 'test_key', // ensure this matches the logic in your useFactory
          },
        },
        { provide: ActivatedRoute, useValue: {} },
        { provide: Dialog, useValue: {} },
        { provide: MatSnackBar, useValue: {} },
        RenderTemplatePipe,
        EllipsisPipe,
        provideHttpClient(withInterceptorsFromDi()),
      ],
    });
    service = TestBed.inject(PlayerStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
