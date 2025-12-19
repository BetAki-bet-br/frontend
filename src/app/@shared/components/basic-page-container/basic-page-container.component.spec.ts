import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicPageContainerComponent } from './basic-page-container.component';

describe('BasicPageContainerComponent', () => {
  let component: BasicPageContainerComponent;
  let fixture: ComponentFixture<BasicPageContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasicPageContainerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BasicPageContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
