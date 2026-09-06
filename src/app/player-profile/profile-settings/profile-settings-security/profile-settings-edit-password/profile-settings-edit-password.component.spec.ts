import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileSettingsEditPasswordComponent } from './profile-settings-edit-password.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('ProfileSettingsEditPasswordComponent', () => {
  let component: ProfileSettingsEditPasswordComponent;
  let fixture: ComponentFixture<ProfileSettingsEditPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatDialogModule, MatSnackBarModule, ProfileSettingsEditPasswordComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileSettingsEditPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
