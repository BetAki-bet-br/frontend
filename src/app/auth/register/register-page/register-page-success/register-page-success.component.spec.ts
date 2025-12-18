import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterPageSuccessComponent } from './register-page-success.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PipesModule } from '@app/@pipes/pipes.module';

describe('RegisterPageSuccessComponent', () => {
  let component: RegisterPageSuccessComponent;
  let fixture: ComponentFixture<RegisterPageSuccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegisterPageSuccessComponent],
      imports: [
        TranslateModule.forRoot(),
        MatInputModule,
        BrowserAnimationsModule,
        MatFormFieldModule,
        HttpClientTestingModule,
        PipesModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterPageSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
