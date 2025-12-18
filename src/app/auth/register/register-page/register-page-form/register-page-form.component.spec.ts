import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterPageFormComponent } from './register-page-form.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PipesModule } from '@app/@pipes/pipes.module';
import { Dialog } from '@angular/cdk/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('RegisterPageFormComponent', () => {
  let component: RegisterPageFormComponent;
  let fixture: ComponentFixture<RegisterPageFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatInputModule,
        BrowserAnimationsModule,
        MatFormFieldModule,
        PipesModule,
        MatSnackBarModule,
        RegisterPageFormComponent,
      ],
      providers: [
        { provide: Dialog, useValue: {} },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterPageFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
