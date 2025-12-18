import { RouterModule } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileInfoHeaderComponent } from './profile-info-header.component';
import { AuthenticationService } from '@app/auth';
import { SharedModule } from '@app/@shared';
import { TranslateModule } from '@ngx-translate/core';

import {
  BalanceService,
  GlobalizationService,
  LoyaltyService,
  PlayerService,
  ProdGameService,
} from '@icore/ngx-portalgateway-api-client-atl';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { PromotionsService } from '@app/promotions/promotions.service';
import { MockPromotionsService } from '@app/promotions/promotions.service,mock';
import { MatMenuModule } from '@angular/material/menu';
import { PlayerStatusService } from '@app/@shared/services/player.service';

describe('ProfileInfoHeaderComponent', () => {
  let component: ProfileInfoHeaderComponent;
  let fixture: ComponentFixture<ProfileInfoHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule, TranslateModule.forRoot(), MatMenuModule, ProfileInfoHeaderComponent, RouterModule],
      providers: [
        { provide: AuthenticationService, useValue: {} },
        { provide: PromotionsService, useClass: MockPromotionsService },
        { provide: PlayerStatusService, useValue: {} },
        { provide: GlobalizationService, useValue: {} },
        { provide: PlayerService, useValue: {} },
        { provide: ProdGameService, useValue: {} },
        LoyaltyService,
        HttpClient,
        BalanceService,
        provideHttpClient(withInterceptorsFromDi()),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileInfoHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
