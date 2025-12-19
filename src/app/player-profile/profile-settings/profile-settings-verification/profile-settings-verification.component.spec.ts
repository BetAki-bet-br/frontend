import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfigurationService } from '@app/@core/configuration.service';
import { MockConfigurationService } from '@app/@core/configuration.service.mock';
import {
  PlayerService,
  GlobalizationService,
  ProdGameService,
  BalanceService,
  BonusService,
  LoyaltyService,
} from '@icore/ngx-portalgateway-api-client-atl';
import { TranslateModule } from '@ngx-translate/core';
import { ProfileSettingsVerificationComponent } from './profile-settings-verification.component';
import { MockCtgApiService } from '@app/@shared/http/ctg-api.service.mock';
import { PipesModule } from '@app/@pipes/pipes.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { PlayerProfileService } from '@app/player-profile/player-profile.service';
import { PlayerProfileServiceMock } from '@app/player-profile/player-profile.service.mock';

describe('ProfileSettingsVerificationComponent', () => {
  let component: ProfileSettingsVerificationComponent;
  let fixture: ComponentFixture<ProfileSettingsVerificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfileSettingsVerificationComponent],
      imports: [HttpClientTestingModule, MatDialogModule, TranslateModule.forRoot(), PipesModule],
      providers: [
        MatSnackBar,
        {
          provide: PlayerService,
          useClass: MockCtgApiService,
        },
        { provide: GlobalizationService, useValue: {} },
        { provide: ProdGameService, useValue: {} },
        { provide: BalanceService, useClass: MockCtgApiService },
        { provide: GlobalizationService, useValue: {} },
        { provide: ConfigurationService, useClass: MockConfigurationService },
        { provide: LoyaltyService, useClass: MockConfigurationService },
        { provide: BonusService, useValue: {} },
        { provide: DateAdapter, useClass: NativeDateAdapter },
        { provide: PlayerProfileService, useClass: PlayerProfileServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileSettingsVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
