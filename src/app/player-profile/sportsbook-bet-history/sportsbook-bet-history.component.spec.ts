import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslateModule } from '@ngx-translate/core';
import {
  BalanceService,
  BonusService,
  GlobalizationService,
  LoyaltyService,
  PlayerService,
  ProdGameService,
  SportsbookService,
} from '@icore/ngx-portalgateway-api-client-atl';
import { MockCtgApiService } from '@app/@shared/http/ctg-api.service.mock';
import { DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { SportsbookHistoryComponent } from './sportsbook-bet-history.component';
import { Dialog } from '@angular/cdk/dialog';
import { RenderTemplatePipe } from '@app/@pipes/render-template.pipe';
import { PlayerProfileServiceMock } from '../player-profile.service.mock';
import { PlayerProfileService } from '../player-profile.service';
import { HttpBackend } from '@angular/common/http';

describe('SportsbookHistoryComponent', () => {
  let component: SportsbookHistoryComponent;
  let fixture: ComponentFixture<SportsbookHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), SportsbookHistoryComponent, RenderTemplatePipe],
      providers: [
        {
          provide: PlayerService,
          useClass: MockCtgApiService,
        },
        { provide: GlobalizationService, useValue: {} },
        { provide: ProdGameService, useClass: MockCtgApiService },
        { provide: BalanceService, useClass: MockCtgApiService },
        { provide: LoyaltyService, useClass: MockCtgApiService },
        { provide: BonusService, useValue: {} },
        { provide: DateAdapter, useClass: NativeDateAdapter },
        { provide: SportsbookService, useClass: MockCtgApiService },
        { provide: Dialog, useValue: {} },
        { provide: PlayerProfileService, useClass: PlayerProfileServiceMock },
        HttpBackend,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SportsbookHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
