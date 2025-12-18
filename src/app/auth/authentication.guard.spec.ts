import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, ActivatedRoute } from '@angular/router';

import { CredentialsService } from './credentials.service';
import { MockCredentialsService } from './credentials.service.mock';
import { AuthenticationGuard } from './authentication.guard';
import { Dialog } from '@angular/cdk/dialog';
import {
  GlobalizationService,
  MessageService,
  PlayerService,
  ProdGameService,
} from '@icore/ngx-portalgateway-api-client-atl';
import { MockCtgApiService } from '@app/@shared/http/ctg-api.service.mock';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { HttpBackend, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('AuthenticationGuard', () => {
  let authenticationGuard: AuthenticationGuard;
  let credentialsService: MockCredentialsService;
  let mockRouter: any;
  let mockSnapshot: any;

  beforeEach(() => {
    // mockRouter = {
    //   navigate: jest.fn(),
    // };
    // mockSnapshot = jest.fn(() => ({
    //   toString: jest.fn(),
    // }));

    mockRouter = {
      navigate: jasmine.createSpy('navigate'),
    };
    mockSnapshot = jasmine.createSpyObj<RouterStateSnapshot>('RouterStateSnapshot', ['toString']);

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        AuthenticationGuard,
        { provide: CredentialsService, useClass: MockCredentialsService },
        { provide: Router, useValue: mockRouter },
        { provide: Dialog, useValue: {} },
        { provide: PlayerService, useClass: MockCtgApiService },
        { provide: MessageService, useClass: MockCtgApiService },
        { provide: GlobalizationService, useClass: MockCtgApiService },
        { provide: MatSnackBar, useValue: {} },
        { provide: ProdGameService, useClass: MockCtgApiService },
        { provide: ActivatedRoute, useValue: {} },
        HttpBackend,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });

    authenticationGuard = TestBed.inject(AuthenticationGuard);
    credentialsService = TestBed.inject(CredentialsService);
  });

  it('should have a canActivate method', () => {
    expect(typeof authenticationGuard.canActivate).toBe('function');
  });

  it('should return true if user is authenticated', () => {
    expect(authenticationGuard.canActivate(new ActivatedRouteSnapshot(), mockSnapshot)).toBe(true);
  });

  it('should return false and redirect to home if user is not authenticated', () => {
    // Arrange
    credentialsService.credentials = null;

    // Act
    const result = authenticationGuard.canActivate(new ActivatedRouteSnapshot(), mockSnapshot);

    // Assert
    expect(result).toBe(false);
  });

  it('should save url as queryParam if user is not authenticated', () => {
    credentialsService.credentials = null;
    mockRouter.url = '/about';
    mockSnapshot.url = '/about';

    authenticationGuard.canActivate(new ActivatedRouteSnapshot(), mockSnapshot);
  });
});
