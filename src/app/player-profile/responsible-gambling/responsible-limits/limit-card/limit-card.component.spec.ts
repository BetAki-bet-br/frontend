import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LimitCardComponent } from './limit-card.component';
import { TranslateModule } from '@ngx-translate/core';

describe('LimitCardComponent', () => {
  let component: LimitCardComponent;
  let fixture: ComponentFixture<LimitCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), LimitCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LimitCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
