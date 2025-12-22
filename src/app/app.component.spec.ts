import { RouterModule } from '@angular/router';
import { TestBed } from '@angular/core/testing';

import { TranslateModule } from '@ngx-translate/core';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AppComponent } from './app.component';
import { AppIconsService } from './@shared/services/app-icons.service';
import { AppStartupService } from './@shared/services/app-startup.service';

class MockAppIconsService {
  init() {}
}

class MockAppStartupService {
  init() {}
}

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), AppComponent, RouterModule],
      providers: [
        { provide: AppIconsService, useClass: MockAppIconsService },
        { provide: AppStartupService, useClass: MockAppStartupService },
        provideHttpClient(withInterceptorsFromDi()),
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });
});
