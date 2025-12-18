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
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Dialog } from '@angular/cdk/dialog';
import { RenderTemplatePipe } from '@app/@pipes/render-template.pipe';
import { EllipsisPipe } from '@app/@pipes/ellipsis.pipe';
import { PlayerStatusService } from '@app/@shared/services/player.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('GameLauncherComponent', () => {
  let component: GameLauncherComponent;
  let fixture: ComponentFixture<GameLauncherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), MatSnackBarModule, GameLauncherComponent],
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
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
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
