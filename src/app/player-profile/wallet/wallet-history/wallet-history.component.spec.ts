import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MockCtgApiService } from '@app/@shared/http/ctg-api.service.mock';
import {
  BalanceService,
  BonusService,
  GlobalizationService,
  LoyaltyService,
  PlayerService,
  ProdGameService,
  SportsbookService,
} from '@icore/ngx-portalgateway-api-client-atl';
import { TranslateModule } from '@ngx-translate/core';
import { WalletHistoryComponent } from './wallet-history.component';
import { DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { Dialog } from '@angular/cdk/dialog';
import { RenderTemplatePipe } from '@app/@pipes/render-template.pipe';
import { PlayerProfileService } from '@app/player-profile/player-profile.service';
import { of } from 'rxjs';
import { HttpBackend } from '@angular/common/http';

describe('WalletHistoryComponent', () => {
  let component: WalletHistoryComponent;
  let fixture: ComponentFixture<WalletHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WalletHistoryComponent, RenderTemplatePipe],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: GlobalizationService, useValue: {} },
        { provide: PlayerService, useValue: {} },
        { provide: ProdGameService, useValue: {} },
        { provide: BalanceService, useClass: MockCtgApiService },
        { provide: BonusService, useValue: {} },
        { provide: LoyaltyService, useClass: MockCtgApiService },
        { provide: DateAdapter, useClass: NativeDateAdapter },
        { provide: SportsbookService, useClass: MockCtgApiService },
        {
          provide: PlayerProfileService,
          useValue: {
            getPlayerLocale: () => 'en-US',
            getWalletTransactions: () => of(undefined),
          },
        },
        { provide: Dialog, useValue: {} },
        HttpBackend,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WalletHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
