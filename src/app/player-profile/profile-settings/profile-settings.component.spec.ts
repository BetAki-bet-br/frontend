import { RouterModule } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dialog } from '@angular/cdk/dialog';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MockCtgApiService } from '@app/@shared/http/ctg-api.service.mock';
import { PlayerService } from '@icore/ngx-portalgateway-api-client-atl';
import { TranslateModule } from '@ngx-translate/core';
import { ProfileSettingsComponent } from './profile-settings.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ProfileSettingsComponent', () => {
  let component: ProfileSettingsComponent;
  let fixture: ComponentFixture<ProfileSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), ProfileSettingsComponent, RouterModule],
      providers: [
        MatSnackBar,
        {
          provide: PlayerService,
          useClass: MockCtgApiService,
        },
        { provide: Dialog, useValue: {} },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
