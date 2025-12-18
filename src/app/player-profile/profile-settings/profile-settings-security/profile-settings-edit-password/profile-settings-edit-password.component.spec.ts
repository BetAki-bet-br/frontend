import { RouterModule } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileSettingsEditPasswordComponent } from './profile-settings-edit-password.component';
import { TranslateModule } from '@ngx-translate/core';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ProfileSettingsEditPasswordComponent', () => {
  let component: ProfileSettingsEditPasswordComponent;
  let fixture: ComponentFixture<ProfileSettingsEditPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatDialogModule,
        MatSnackBarModule,
        ProfileSettingsEditPasswordComponent,
        RouterModule,
      ],
      providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileSettingsEditPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
