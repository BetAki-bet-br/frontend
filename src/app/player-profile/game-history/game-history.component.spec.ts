import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameHistoryComponent } from './game-history.component';
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
import { Dialog } from '@angular/cdk/dialog';
import { PlayerProfileService } from '../player-profile.service';
import { PlayerProfileServiceMock } from '../player-profile.service.mock';
import { HttpBackend } from '@angular/common/http';

describe('GameHistoryComponent', () => {
  let component: GameHistoryComponent;
  let fixture: ComponentFixture<GameHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GameHistoryComponent],
      imports: [TranslateModule.forRoot()],
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

    fixture = TestBed.createComponent(GameHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
