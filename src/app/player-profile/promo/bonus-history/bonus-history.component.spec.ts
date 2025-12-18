import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BonusHistoryComponent } from './bonus-history.component';
import { ConfigurationService } from '@app/@core/configuration.service';
import { MockConfigurationService } from '@app/@core/configuration.service.mock';
import { MockCtgApiService } from '@app/@shared/http/ctg-api.service.mock';
import {
  PlayerService,
  GlobalizationService,
  ProdGameService,
  BalanceService,
  BonusService,
  LoyaltyService,
  SportsbookService,
} from '@icore/ngx-portalgateway-api-client-atl';
import { TranslateModule } from '@ngx-translate/core';
import { DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { Dialog } from '@angular/cdk/dialog';
import { RenderTemplatePipe } from '@app/@pipes/render-template.pipe';
import { PlayerProfileService } from '@app/player-profile/player-profile.service';
import { PlayerProfileServiceMock } from '@app/player-profile/player-profile.service.mock';
import { HttpClientModule } from '@angular/common/http';

describe('BonusHistoryComponent', () => {
  let component: BonusHistoryComponent;
  let fixture: ComponentFixture<BonusHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), HttpClientModule],
      declarations: [BonusHistoryComponent, RenderTemplatePipe],
      providers: [
        {
          provide: PlayerService,
          useClass: MockCtgApiService,
        },
        { provide: GlobalizationService, useValue: {} },
        { provide: ProdGameService, useValue: {} },
        { provide: BalanceService, useClass: MockCtgApiService },
        { provide: GlobalizationService, useValue: {} },
        { provide: ConfigurationService, useClass: MockConfigurationService },
        { provide: BonusService, useClass: MockCtgApiService },
        { provide: LoyaltyService, useValue: {} },
        { provide: DateAdapter, useClass: NativeDateAdapter },
        { provide: SportsbookService, useClass: MockCtgApiService },
        { provide: Dialog, useValue: {} },
        { provide: PlayerProfileService, useClass: PlayerProfileServiceMock },
        RenderTemplatePipe,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BonusHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
