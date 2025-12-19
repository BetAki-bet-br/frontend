import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthLayoutPage } from './auth-layout-page';

describe('AuthLayoutPage', () => {
  let component: AuthLayoutPage;
  let fixture: ComponentFixture<AuthLayoutPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthLayoutPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthLayoutPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
