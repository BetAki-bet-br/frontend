import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamesListByCategoryPage } from './games-list-by-category-page';

describe('GamesListByCategoryPage', () => {
  let component: GamesListByCategoryPage;
  let fixture: ComponentFixture<GamesListByCategoryPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GamesListByCategoryPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GamesListByCategoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
