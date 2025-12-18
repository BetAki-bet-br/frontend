import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameSearchComponent } from './game-search.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';

describe('GameSearchComponent', () => {
  let component: GameSearchComponent;
  let fixture: ComponentFixture<GameSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GameSearchComponent],
      imports: [HttpClientTestingModule, MatSnackBarModule, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(GameSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
