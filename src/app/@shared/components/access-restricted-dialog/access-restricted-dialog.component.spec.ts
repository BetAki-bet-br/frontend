import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessRestrictedDialogComponent } from './access-restricted-dialog.component';

describe('AccessRestrictedDialogComponent', () => {
  let component: AccessRestrictedDialogComponent;
  let fixture: ComponentFixture<AccessRestrictedDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessRestrictedDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AccessRestrictedDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
