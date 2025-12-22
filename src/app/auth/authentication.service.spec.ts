import { TranslateModule } from '@ngx-translate/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AuthenticationService } from './authentication.service';
import { CredentialsService, Credentials } from './credentials.service';
import { MockCredentialsService } from './credentials.service.mock';
import {
  BannerService,
  BonusService,
  FaceAuthResponse,
  GlobalizationService,
  LoginRequest,
  LoginResponse,
  MessageService,
  PlayerService,
  ProdGameService,
  PromotionService,
} from '@icore/ngx-portalgateway-api-client-atl';
import { Observable, of } from 'rxjs';
import { PlayerStatusService } from '@app/@shared/services/player.service';
import { MockPlayerStatusService } from '@app/@shared/services/player-service.mock';
import { MockCtgApiService } from '@app/@shared/http/ctg-api.service.mock';
import { RenderTemplatePipe } from '@app/@pipes/render-template.pipe';
import { EllipsisPipe } from '@app/@pipes/ellipsis.pipe';
import { ActivatedRoute } from '@angular/router';
import { TemplateService } from '@app/@shared/services/template.service';
import { MockTemplateService } from '@app/@shared/services/template.service.mock';
import { Dialog } from '@angular/cdk/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpBackend } from '@angular/common/http';
import { FingerprintjsProAngularService } from '@fingerprintjs/fingerprintjs-pro-angular';

class MockPlayerService {
  apiPortalV1PlayerPost(body?: any, observe?: 'body', reportProgress?: boolean): Observable<any> {
    return of({
      playerId: 1,
      isPlayerActivated: true,
    });
  }
  apiPortalV1PlayerLoginPost(
    body?: LoginRequest,
    observe?: 'body',
    reportProgress?: boolean,
  ): Observable<LoginResponse> {
    const response: LoginResponse = {
      messages: [],
      logonSession: {
        sessionToken: 'e7850642-fd47-4f0f-b9e1-d66351fe9ec9',
        playerId: 200012795,
        logonTime: '2023-06-01T11:23:23.685+00:00',
      },
      // failedLoginCount: null,
      // lastLoginTime: '2023-06-01T11:23:15+00:00',
      lastLoginIp: '10.49.32.233',
      // playerToken: null,
      //renewalToken: '82d88be8-97d4-426a-8139-88652d2a1b93',
      //renewalTokenExpirySeconds: 2592000,
    };

    return of(response);
  }

  apiPortalV1PlayerLogoutPost(): Observable<any> {
    return of(true);
  }
}

describe('AuthenticationService', () => {
  let authenticationService: AuthenticationService;
  let credentialsService: MockCredentialsService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: CredentialsService, useClass: MockCredentialsService },
        { provide: PlayerService, useClass: MockPlayerService },
        { provide: PlayerStatusService, useClass: MockPlayerStatusService },
        { provide: BonusService, useClass: MockCtgApiService },
        { provide: PromotionService, useClass: MockCtgApiService },
        { provide: ProdGameService, useClass: MockCtgApiService },
        { provide: BannerService, useClass: MockCtgApiService },
        { provide: TemplateService, useClass: MockTemplateService },
        RenderTemplatePipe,
        EllipsisPipe,
        { provide: ActivatedRoute, useValue: {} },
        { provide: Dialog, useValue: {} },
        { provide: FingerprintjsProAngularService, useClass: MockTemplateService },
        { provide: MessageService, useClass: MockCtgApiService },
        { provide: GlobalizationService, useClass: MockCtgApiService },
        { provide: MatSnackBar, useValue: {} },
        HttpBackend,
      ],
    });
    authenticationService = TestBed.inject(AuthenticationService);
    credentialsService = TestBed.inject(CredentialsService);
    credentialsService.credentials = null;
    // jest.spyOn(credentialsService, 'setCredentials');
    spyOn(credentialsService, 'setCredentials').and.callThrough();
  });
  describe('login', () => {
    it('should return credentials', fakeAsync(() => {
      // Act
      const request = authenticationService.login({
        username: 'toto',
        password: '123',
      });
      tick();

      // Assert
      let loginResult: { credentials: Credentials; loginFaceAuth: FaceAuthResponse | null };
      request?.subscribe((result) => {
        loginResult = result;
        // expect(result.credentials).toBeDefined();
        // expect(result.credentials?.jwt).toBeDefined();
        expect(result).toBeDefined();
        expect(result?.credentials?.jwt).toBeDefined();
      });
    }));
    it('should authenticate user', fakeAsync(() => {
      expect(credentialsService.isAuthenticated()).toBe(false);
      // Act
      const request = authenticationService.login({
        username: 'toto',
        password: '123',
      });
      tick();
      // Assert
      request?.subscribe(() => {
        expect(credentialsService.isAuthenticated()).toBe(true);
        expect(credentialsService.credentials).not.toBeNull();
        expect((credentialsService.credentials as Credentials).jwt).toBeDefined();
        expect((credentialsService.credentials as Credentials).jwt).not.toBeNull();
      });
    }));
    it('should persist credentials for the session', fakeAsync(() => {
      // Act
      const request = authenticationService.login({
        username: 'toto',
        password: '123',
      });
      tick();
      // Assert
      request?.subscribe(() => {
        expect(credentialsService.setCredentials).toHaveBeenCalled();
        expect((credentialsService.setCredentials as jasmine.Spy).calls.mostRecent().args[1]).toBe(undefined);
      });
    }));
    it('should persist credentials across sessions', fakeAsync(() => {
      // Act
      const request = authenticationService.login({
        username: 'toto',
        password: '123',
        remember: true,
      });
      tick();
      // Assert
      request?.subscribe(() => {
        const setCredentialsReturn$ = (credentialsService.setCredentials as jasmine.Spy).calls.mostRecent()
          .returnValue as Observable<boolean>;
        let setCredentialsReturnValue = false;

        setCredentialsReturn$.subscribe((val) => {
          setCredentialsReturnValue = val;
        });
        tick();

        expect(credentialsService.setCredentials).toHaveBeenCalled();
        expect(setCredentialsReturnValue).toBe(true);
      });
    }));
  });
  describe('logout', () => {
    it('should clear user authentication', fakeAsync(() => {
      // Arrange
      const loginRequest = authenticationService.login({
        username: 'toto',
        password: '123',
      });
      tick();
      // Assert
      loginRequest?.subscribe(() => {
        expect(credentialsService.isAuthenticated()).toBe(true);
        const request = authenticationService.logout();
        tick();

        request?.subscribe(() => {
          credentialsService.setCredentials();
          expect(credentialsService.isAuthenticated()).toBe(false);
          expect(credentialsService.credentials).toBeNull();
        });
      });
    }));
  });
});
