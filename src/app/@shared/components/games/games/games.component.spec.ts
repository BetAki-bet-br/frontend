import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameTilesComponent } from './games.component';
import { ProdGameService } from '@icore/ngx-portalgateway-api-client-atl';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';

describe('GameTilesComponent', () => {
  let component: GameTilesComponent;
  let fixture: ComponentFixture<GameTilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GameTilesComponent],
      imports: [TranslateModule.forRoot(), HttpClientModule],
      providers: [{ provide: ProdGameService, useValue: {} }],
    }).compileComponents();

    fixture = TestBed.createComponent(GameTilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
