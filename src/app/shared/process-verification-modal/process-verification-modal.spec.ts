import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessVerificationModal } from './process-verification-modal';

describe('ProcessVerificationModal', () => {
  let component: ProcessVerificationModal;
  let fixture: ComponentFixture<ProcessVerificationModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcessVerificationModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessVerificationModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
