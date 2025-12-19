import { RouterModule } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
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
import { ProfileSettingsSecurityComponent } from './profile-settings-security.component';
import { DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { RenderTemplatePipe } from '@app/@pipes/render-template.pipe';
import { PlayerProfileService } from '@app/player-profile/player-profile.service';
import { PlayerProfileServiceMock } from '@app/player-profile/player-profile.service.mock';
import { AuthenticationService } from '@app/auth';
import { MockAuthenticationService } from '@app/auth/authentication.service.mock';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ProfileSettingsSecurityComponent', () => {
  let component: ProfileSettingsSecurityComponent;
  let fixture: ComponentFixture<ProfileSettingsSecurityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatInputModule,
        BrowserAnimationsModule,
        MatSnackBarModule,
        MatFormFieldModule,
        MatSelectModule,
        ProfileSettingsSecurityComponent,
        RenderTemplatePipe,
        RouterModule,
      ],
      providers: [
        {
          provide: PlayerService,
          useClass: MockCtgApiService,
        },
        { provide: GlobalizationService, useValue: {} },
        { provide: ProdGameService, useValue: {} },
        { provide: BalanceService, useClass: MockCtgApiService },
        { provide: LoyaltyService, useClass: MockCtgApiService },
        { provide: BonusService, useValue: {} },
        { provide: DateAdapter, useClass: NativeDateAdapter },
        { provide: SportsbookService, useClass: MockCtgApiService },
        { provide: Dialog, useValue: {} },
        { provide: PlayerProfileService, useClass: PlayerProfileServiceMock },
        { provide: DialogRef, useValue: {} },
        { provide: AuthenticationService, useClass: MockAuthenticationService },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileSettingsSecurityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
