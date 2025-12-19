import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentsComponent } from './payments.component';
import { TranslateModule } from '@ngx-translate/core';
import { HttpBackend } from '@angular/common/http';

describe('PaymentsComponent', () => {
  let component: PaymentsComponent;
  let fixture: ComponentFixture<PaymentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaymentsComponent],
      imports: [TranslateModule.forRoot()],
      providers: [HttpBackend],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
