import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvidersList } from './providers-list';

describe('ProvidersList', () => {
  let component: ProvidersList;
  let fixture: ComponentFixture<ProvidersList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProvidersList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProvidersList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
