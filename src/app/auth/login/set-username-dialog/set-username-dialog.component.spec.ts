import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetUsernameDialogComponent } from './set-username-dialog.component';
import { TranslateModule } from '@ngx-translate/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { AuthenticationService } from '@app/auth/authentication.service';
import { MockAuthenticationService } from '@app/auth/authentication.service.mock';
import { PlayerService } from '@icore/ngx-portalgateway-api-client-atl';
import { HttpBackend } from '@angular/common/http';

describe('SetUsernameDialogComponent', () => {
  let component: SetUsernameDialogComponent;
  let fixture: ComponentFixture<SetUsernameDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), SetUsernameDialogComponent],
      providers: [
        { provide: DialogRef, useValue: {} },
        { provide: DIALOG_DATA, useValue: {} },
        { provide: AuthenticationService, useClass: MockAuthenticationService },
        { provide: PlayerService, useValue: {} },
        HttpBackend,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SetUsernameDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
