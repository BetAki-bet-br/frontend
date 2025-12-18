import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@app/@shared';
import { MaterialModule } from '@app/material.module';
import { TranslateModule } from '@ngx-translate/core';

import { CredentialsService, Credentials } from './credentials.service';

const credentialsKey = 'credentials';

describe('CredentialsService', () => {
  let credentialsService: CredentialsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, SharedModule, MaterialModule, RouterTestingModule, TranslateModule.forRoot()],
      providers: [FormBuilder, CredentialsService],
    });

    credentialsService = TestBed.inject(CredentialsService);
  });

  afterEach(() => {
    // Cleanup
    localStorage.removeItem(credentialsKey);
    sessionStorage.removeItem(credentialsKey);
  });

  describe('setCredentials', () => {
    it('should authenticate user if credentials are set', () => {
      // Act
      credentialsService.setCredentials({
        username: 'me',
        jwt: '123',
        sessionKey: 'abc',
        userId: 1,
        renewalToken: '123',
      });

      // Assert
      expect(credentialsService.isAuthenticated()).toBe(true);
      expect((credentialsService.credentials as Credentials).username).toBe('me');
    });

    it('should clean authentication', () => {
      // Act
      credentialsService.setCredentials();

      // Assert
      expect(credentialsService.isAuthenticated()).toBe(false);
    });

    it('should persist credentials in local storage', () => {
      // Act
      credentialsService.setCredentials({
        username: 'me',
        jwt: '123',
        sessionKey: 'abc',
        userId: 1,
        renewalToken: '123',
      });

      // Assert
      expect(localStorage.getItem(credentialsKey)).not.toBeNull();
    });

    it('should clear user authentication', () => {
      // Act
      credentialsService.setCredentials();

      // Assert
      expect(credentialsService.isAuthenticated()).toBe(false);
      expect(credentialsService.credentials).toBeNull();
      expect(sessionStorage.getItem(credentialsKey)).toBeNull();
      expect(localStorage.getItem(credentialsKey)).toBeNull();
    });
  });
});
