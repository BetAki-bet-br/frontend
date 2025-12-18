import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '@app/material.module';

import { CredentialsService } from '@app/auth';
import { MockAuthenticationService } from '@app/auth/authentication.service.mock';
import { MockCredentialsService } from '@app/auth/credentials.service.mock';

import { I18nModule } from '@app/i18n';
import { ShellPlayerProfileComponent } from './shell-player-profile.component';
import { DataStoreService } from '@app/@core';
import { ConfigurationService } from '@app/@core/configuration.service';
import { MockConfigurationService } from '@app/@core/configuration.service.mock';
import { PlayerStatusService } from '@app/@shared/services/player.service';
import { MockPlayerStatusService } from '@app/@shared/services/player-service.mock';

describe('ShellPlayerProfileComponent', () => {
  let component: ShellPlayerProfileComponent;
  let fixture: ComponentFixture<ShellPlayerProfileComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), I18nModule, BrowserAnimationsModule, MaterialModule, RouterTestingModule],
      providers: [
        { provide: MockAuthenticationService, deps: [DataStoreService, CredentialsService] },
        { provide: CredentialsService, useClass: MockCredentialsService },
        { provide: ConfigurationService, useClass: MockConfigurationService },
        { provide: PlayerStatusService, useClass: MockPlayerStatusService },
      ],
      declarations: [ShellPlayerProfileComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShellPlayerProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
