import { TestBed } from '@angular/core/testing';

import { AuthDialogService } from './auth-dialog.service';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService, PlayerService } from '@icore/ngx-portalgateway-api-client-atl';
import { MockCtgApiService } from '@app/@shared/http/ctg-api.service.mock';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpBackend } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { ConfigurationService } from '@app/@core/configuration.service';
import { MockConfigurationService } from '@app/@core/configuration.service.mock';
import { MockCredentialsService } from './credentials.service.mock';
import { MockAuthenticationService } from './authentication.service.mock';
import { AuthenticationService } from './authentication.service';
import { CredentialsService } from './credentials.service';
import { RouterTestingModule } from '@angular/router/testing';
import { DataStoreService } from '@app/@core';
import { MockDataStoreService } from '@app/@core/data-store.service.mock';
import { PlayerProfileService } from '@app/player-profile/player-profile.service';
import { PlayerProfileServiceMock } from '@app/player-profile/player-profile.service.mock';

describe('AuthDialogService', () => {
  let service: AuthDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DialogModule, TranslateModule.forRoot(), HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: PlayerService, useClass: MockCtgApiService },
        { provide: MessageService, useClass: MockCtgApiService },
        { provide: CredentialsService, useClass: MockCredentialsService },
        { provide: AuthenticationService, useClass: MockAuthenticationService },
        { provide: ConfigurationService, useClass: MockConfigurationService },
        { provide: DataStoreService, useClass: MockDataStoreService },
        { provide: PlayerProfileService, useClass: PlayerProfileServiceMock },
        { provide: MatSnackBar, useValue: {} },
        { provide: Dialog, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
        HttpBackend,
      ],
    });
    service = TestBed.inject(AuthDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
