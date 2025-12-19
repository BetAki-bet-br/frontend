import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponsibleLimitDurationComponent } from './responsible-limit-duration.component';
import { TranslateModule } from '@ngx-translate/core';
import { SnackbarService } from '@app/@core/snackbar.service';
import { MatSnackBar } from '@angular/material/snack-bar';
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
import { PlayerProfileService } from '@app/player-profile/player-profile.service';
import { PlayerProfileServiceMock } from '@app/player-profile/player-profile.service.mock';

describe('ResponsibleLimitDurationComponent', () => {
  let component: ResponsibleLimitDurationComponent;
  let fixture: ComponentFixture<ResponsibleLimitDurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), ResponsibleLimitDurationComponent],
      providers: [
        SnackbarService,
        MatSnackBar,
        {
          provide: PlayerService,
          useClass: MockCtgApiService,
        },
        { provide: ProdGameService, useValue: {} },
        { provide: GlobalizationService, useValue: {} },
        { provide: BalanceService, useClass: MockCtgApiService },
        { provide: LoyaltyService, useClass: MockCtgApiService },
        { provide: BonusService, useValue: {} },
        { provide: DateAdapter, useClass: NativeDateAdapter },
        { provide: SportsbookService, useClass: MockCtgApiService },
        { provide: Dialog, useValue: {} },
        { provide: PlayerProfileService, useClass: PlayerProfileServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResponsibleLimitDurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
