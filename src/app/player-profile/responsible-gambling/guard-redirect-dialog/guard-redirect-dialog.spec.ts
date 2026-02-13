import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuardRedirectDialog } from './guard-redirect-dialog';

describe('GuardRedirectDialog', () => {
  let component: GuardRedirectDialog;
  let fixture: ComponentFixture<GuardRedirectDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuardRedirectDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuardRedirectDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
