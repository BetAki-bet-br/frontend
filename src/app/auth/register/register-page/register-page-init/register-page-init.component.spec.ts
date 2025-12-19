import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterPageInitComponent } from './register-page-init.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PipesModule } from '@app/@pipes/pipes.module';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('RegisterPageInitComponent', () => {
  let component: RegisterPageInitComponent;
  let fixture: ComponentFixture<RegisterPageInitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatInputModule,
        BrowserAnimationsModule,
        MatFormFieldModule,
        PipesModule,
        RegisterPageInitComponent,
      ],
      providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterPageInitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
