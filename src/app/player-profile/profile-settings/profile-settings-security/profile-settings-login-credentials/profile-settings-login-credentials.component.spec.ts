import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileSettingsLoginCredentialsComponent } from './profile-settings-login-credentials.component';
import { TranslateModule } from '@ngx-translate/core';

describe('ProfileSettingsLoginCredentialsComponent', () => {
  let component: ProfileSettingsLoginCredentialsComponent;
  let fixture: ComponentFixture<ProfileSettingsLoginCredentialsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfileSettingsLoginCredentialsComponent],
      imports: [TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileSettingsLoginCredentialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
