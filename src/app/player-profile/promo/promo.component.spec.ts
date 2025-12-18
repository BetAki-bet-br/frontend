import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ConfigurationService } from '@app/@core/configuration.service';
import { MockConfigurationService } from '@app/@core/configuration.service.mock';
import { SnackbarService } from '@app/@core/snackbar.service';
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
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PromoComponent } from './promo.component';
import { MatDialogModule } from '@angular/material/dialog';
import { PromotionsService } from '@app/promotions/promotions.service';
import { MockPromotionsService } from '@app/promotions/promotions.service,mock';
import { DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { PlayerProfileService } from '../player-profile.service';
import { PlayerProfileServiceMock } from '../player-profile.service.mock';
import { PlayerStatusService } from '@app/@shared/services/player.service';
import { MockPlayerStatusService } from '@app/@shared/services/player-service.mock';
import { HttpClientModule } from '@angular/common/http';
import { RenderTemplatePipe } from '@app/@pipes/render-template.pipe';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { of } from 'rxjs';
import { BonusesService } from '@app/@shared/services/bonuses.service';
import { MockBonusesService } from '@app/@shared/services/bonuses.service.mock';

describe('PromoComponent', () => {
  let component: PromoComponent;
  let fixture: ComponentFixture<PromoComponent>;
  let service: SnackbarService;
  let translateService: TranslateService;

  beforeEach(async () => {
    const paramMap: ParamMap = convertToParamMap({ provider: 'example-provider' });
    const activatedRouteStub = {
      params: of(paramMap),
    };

    await TestBed.configureTestingModule({
      declarations: [PromoComponent],
      imports: [MatSnackBarModule, TranslateModule.forRoot(), MatDialogModule, HttpClientModule],
      providers: [
        SnackbarService,
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
        { provide: BonusService, useValue: {} },
        { provide: LoyaltyService, useValue: {} },
        { provide: PromotionsService, useClass: MockPromotionsService },
        { provide: BonusesService, useClass: MockBonusesService },
        { provide: DateAdapter, useClass: NativeDateAdapter },
        { provide: SportsbookService, useClass: MockCtgApiService },
        { provide: PlayerProfileService, useClass: PlayerProfileServiceMock },
        { provide: PlayerStatusService, useClass: MockPlayerStatusService },
        RenderTemplatePipe,
        { provide: ActivatedRoute, useValue: activatedRouteStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PromoComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(SnackbarService);
    translateService = TestBed.inject(TranslateService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
