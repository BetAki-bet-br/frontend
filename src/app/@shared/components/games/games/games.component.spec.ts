import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameTilesComponent } from './games.component';
import { ProdGameService } from '@icore/ngx-portalgateway-api-client-atl';
import { TranslateModule } from '@ngx-translate/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('GameTilesComponent', () => {
  let component: GameTilesComponent;
  let fixture: ComponentFixture<GameTilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), GameTilesComponent],
      providers: [{ provide: ProdGameService, useValue: {} }, provideHttpClient(withInterceptorsFromDi())],
    }).compileComponents();

    fixture = TestBed.createComponent(GameTilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
