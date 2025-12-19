import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfigurationService } from '@app/@core/configuration.service';
import { MockConfigurationService } from '@app/@core/configuration.service.mock';
import { MockCtgApiService } from '@app/@shared/http/ctg-api.service.mock';
import {
  BalanceService,
  BonusService,
  GlobalizationService,
  LoyaltyService,
  PlayerService,
  ProdGameService,
} from '@icore/ngx-portalgateway-api-client-atl';
import { TranslateModule } from '@ngx-translate/core';
import { ProfileSettingsInfoComponent } from './profile-settings-info.component';
import { HttpClientModule } from '@angular/common/http';
import { DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { Dialog } from '@angular/cdk/dialog';
import { RenderTemplatePipe } from '@app/@pipes/render-template.pipe';
import { PlayerProfileService } from '@app/player-profile/player-profile.service';
import { PlayerProfileServiceMock } from '@app/player-profile/player-profile.service.mock';
import { MatTooltipModule } from '@angular/material/tooltip';

describe('ProfileSettingsInfoComponent', () => {
  let component: ProfileSettingsInfoComponent;
  let fixture: ComponentFixture<ProfileSettingsInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), HttpClientModule, MatTooltipModule],
      declarations: [ProfileSettingsInfoComponent, RenderTemplatePipe],
      providers: [
        MatSnackBar,
        {
          provide: PlayerService,
          useClass: MockCtgApiService,
        },
        { provide: GlobalizationService, useValue: {} },
        { provide: ProdGameService, useValue: {} },
        { provide: BalanceService, useClass: MockCtgApiService },
        { provide: ConfigurationService, useClass: MockConfigurationService },
        { provide: ProdGameService, useValue: {} },
        { provide: PlayerService, useClass: MockCtgApiService },
        { provide: LoyaltyService, useClass: MockCtgApiService },
        { provide: BonusService, useValue: {} },
        { provide: DateAdapter, useClass: NativeDateAdapter },
        { provide: Dialog, useValue: {} },
        { provide: PlayerProfileService, useClass: PlayerProfileServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileSettingsInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
