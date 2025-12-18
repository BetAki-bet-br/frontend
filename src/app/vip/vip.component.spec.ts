import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VipComponent } from './vip.component';
import { TranslateModule } from '@ngx-translate/core';

describe('VipComponent', () => {
  let component: VipComponent;
  let fixture: ComponentFixture<VipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), VipComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
