import { TestBed } from '@angular/core/testing';

import { GameLauncherService } from './game-launcher.service';
import { ProdGameService } from '@icore/ngx-portalgateway-api-client-atl';
import { DataStoreService } from '@app/@core';
import { ConfigurationService } from '@app/@core/configuration.service';
import { GamesService } from '@app/@shared/services/games/games.service';
import { CredentialsService } from '@app/auth';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';

describe('GameLauncherService', () => {
  let service: GameLauncherService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ProdGameService, useValue: {} },
        { provide: CredentialsService, useValue: {} },
        { provide: ConfigurationService, useValue: {} },
        { provide: DataStoreService, useValue: {} },
        { provide: GamesService, useValue: {} },
      ],
      imports: [MatSnackBarModule, TranslateModule.forRoot()],
    });
    service = TestBed.inject(GameLauncherService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
