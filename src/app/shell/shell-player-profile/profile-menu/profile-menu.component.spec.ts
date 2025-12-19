import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileMenuComponent } from './profile-menu.component';
import { TranslateModule } from '@ngx-translate/core';
import { PlayerService } from '@icore/ngx-portalgateway-api-client-atl';
import { MockCtgApiService } from '@app/@shared/http/ctg-api.service.mock';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { Dialog } from '@angular/cdk/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';

describe('ProfileMenuComponent', () => {
  let component: ProfileMenuComponent;
  let fixture: ComponentFixture<ProfileMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), MatSnackBarModule, ProfileMenuComponent],
      providers: [
        { provide: PlayerService, useClass: MockCtgApiService },
        { provide: Dialog, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
        provideHttpClient(withInterceptorsFromDi()),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
