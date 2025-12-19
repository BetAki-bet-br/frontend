import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameLauncherComponent } from './game-launcher.component';
import { TranslateModule } from '@ngx-translate/core';
import {
  BalanceService,
  GlobalizationService,
  LoyaltyService,
  PlayerService,
  ProdGameService,
} from '@icore/ngx-portalgateway-api-client-atl';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Dialog } from '@angular/cdk/dialog';
import { RenderTemplatePipe } from '@app/@pipes/render-template.pipe';
import { EllipsisPipe } from '@app/@pipes/ellipsis.pipe';
import { PlayerStatusService } from '@app/@shared/services/player.service';

describe('GameLauncherComponent', () => {
  let component: GameLauncherComponent;
  let fixture: ComponentFixture<GameLauncherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GameLauncherComponent],
      imports: [TranslateModule.forRoot(), HttpClientTestingModule, MatSnackBarModule],
      providers: [
        { provide: LoyaltyService, useValue: {} },
        { provide: BalanceService, useValue: {} },
        { provide: GlobalizationService, useValue: {} },
        { provide: PlayerService, useValue: {} },
        { provide: ProdGameService, useValue: {} },
        { provide: Dialog, useValue: {} },
        RenderTemplatePipe,
        EllipsisPipe,
        { provide: PlayerStatusService, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GameLauncherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
