import { TestBed } from '@angular/core/testing';

import { AuthenticationGuard, AuthenticationService } from '@app/auth';
import { MockAuthenticationService } from '@app/auth/authentication.service.mock';
import { Shell } from './shell.service';
import { ShellComponent } from './shell-common/shell.component';
import { ShellPlayerProfileComponent } from './shell-player-profile/shell-player-profile.component';

describe('Shell', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShellComponent, ShellPlayerProfileComponent],
      providers: [AuthenticationGuard, { provide: AuthenticationService, useClass: MockAuthenticationService }],
    });
  });

  describe('childRoutes', () => {
    it('should create routes as children of shell', () => {
      // Prepare
      const testRoutes = [{ path: 'test' }];

      // Act
      const result = Shell.childRoutes(testRoutes);

      // Assert
      expect(result.path).toBe('');
      expect(result.children).toBe(testRoutes);
      expect(result.component).toBe(ShellComponent);
    });
  });
});
