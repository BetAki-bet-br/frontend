import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileSettingsLoginCredentialsComponent } from './profile-settings-login-credentials.component';

describe('ProfileSettingsLoginCredentialsComponent', () => {
  let component: ProfileSettingsLoginCredentialsComponent;
  let fixture: ComponentFixture<ProfileSettingsLoginCredentialsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileSettingsLoginCredentialsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileSettingsLoginCredentialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
