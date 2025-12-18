import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VipLevelComponent } from './vip-level.component';

describe('VipLevelComponent', () => {
  let component: VipLevelComponent;
  let fixture: ComponentFixture<VipLevelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VipLevelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VipLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
