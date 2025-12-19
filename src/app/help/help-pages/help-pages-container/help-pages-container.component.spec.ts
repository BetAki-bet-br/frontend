import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpPagesContainerComponent } from './help-pages-container.component';

describe('HelpPagesContainerComponent', () => {
  let component: HelpPagesContainerComponent;
  let fixture: ComponentFixture<HelpPagesContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HelpPagesContainerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HelpPagesContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
