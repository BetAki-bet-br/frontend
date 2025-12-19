import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerInfoDialogComponent } from './player-info-dialog.component';
import { PlayerStatusService } from '@app/@shared/services/player.service';
import { MockPlayerStatusService } from '@app/@shared/services/player-service.mock';
import { TranslateModule } from '@ngx-translate/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { AuthenticationService } from '@app/auth';
import { MockAuthenticationService } from '@app/auth/authentication.service.mock';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpBackend } from '@angular/common/http';

describe('PlayerInfoDialogComponent', () => {
  let component: PlayerInfoDialogComponent;
  let fixture: ComponentFixture<PlayerInfoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [PlayerInfoDialogComponent],
      providers: [
        { provide: DialogRef, useValue: {} },
        { provide: DIALOG_DATA, useValue: {} },
        { provide: PlayerStatusService, useClass: MockPlayerStatusService },
        { provide: AuthenticationService, useClass: MockAuthenticationService },
        { provide: MatSnackBar, useValue: {} },
        HttpBackend,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
