import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordStrengthIndicatorComponent } from './password-strength-indicator.component';
import { TranslateModule } from '@ngx-translate/core';

describe('PasswordStrengthIndicatorComponent', () => {
  let component: PasswordStrengthIndicatorComponent;
  let fixture: ComponentFixture<PasswordStrengthIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [PasswordStrengthIndicatorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordStrengthIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
