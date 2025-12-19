import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  PlayerService,
  ProdGameService,
  GlobalizationService,
  BalanceService,
  BonusService,
  LoyaltyService,
  SportsbookService,
} from '@icore/ngx-portalgateway-api-client-atl';
import { TranslateModule } from '@ngx-translate/core';
import { ResponsibleGamblingComponent } from './responsible-gambling.component';
import { MockCtgApiService } from '@app/@shared/http/ctg-api.service.mock';
import { DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { Dialog } from '@angular/cdk/dialog';
import { RenderTemplatePipe } from '@app/@pipes/render-template.pipe';
import { PlayerProfileService } from '../player-profile.service';
import { PlayerProfileServiceMock } from '../player-profile.service.mock';
import { HttpBackend } from '@angular/common/http';

describe('ResponsibleGamblingComponent', () => {
  let component: ResponsibleGamblingComponent;
  let fixture: ComponentFixture<ResponsibleGamblingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [ResponsibleGamblingComponent, RenderTemplatePipe],
      providers: [
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
        HttpBackend,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResponsibleGamblingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
