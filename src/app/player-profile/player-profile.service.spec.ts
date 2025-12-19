import { TestBed } from '@angular/core/testing';
import {
  PlayerService,
  ProdGameService,
  GlobalizationService,
  BalanceService,
  BonusService,
  LoyaltyService,
  SportsbookService,
} from '@icore/ngx-portalgateway-api-client-atl';
import { TranslateModule } from '@ngx-translate/core';
import { PlayerProfileService } from './player-profile.service';
import { MockCtgApiService } from '@app/@shared/http/ctg-api.service.mock';
import { DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { Dialog } from '@angular/cdk/dialog';
import { RenderTemplatePipe } from '@app/@pipes/render-template.pipe';
import { PlayerStatusService } from '@app/@shared/services/player.service';
import { HttpBackend, HttpClientModule } from '@angular/common/http';

describe('PlayerProfileService', () => {
  let service: PlayerProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RenderTemplatePipe],
      providers: [
        { provide: PlayerService, useClass: MockCtgApiService },
        { provide: ProdGameService, useValue: {} },
        { provide: GlobalizationService, useValue: {} },
        { provide: BalanceService, useClass: MockCtgApiService },
        { provide: PlayerService, useClass: MockCtgApiService },
        { provide: LoyaltyService, useClass: MockCtgApiService },
        { provide: BonusService, useValue: {} },
        { provide: DateAdapter, useClass: NativeDateAdapter },
        { provide: SportsbookService, useClass: MockCtgApiService },
        { provide: Dialog, useValue: {} },
        { provide: PlayerStatusService, useClass: MockCtgApiService },
        HttpBackend,
      ],
      imports: [TranslateModule.forRoot(), HttpClientModule],
    });
    service = TestBed.inject(PlayerProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
