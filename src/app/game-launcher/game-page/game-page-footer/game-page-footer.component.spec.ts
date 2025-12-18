import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamePageFooterComponent } from './game-page-footer.component';
import { RouterTestingModule } from '@angular/router/testing';
import { DataStoreService } from '@app/@core';
import { GlobalizationService, PlayerService, ProdGameService } from '@icore/ngx-portalgateway-api-client-atl';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { MockCtgApiService } from '@app/@shared/http/ctg-api.service.mock';
import { MockDataStoreService } from '@app/@core/data-store.service.mock';

describe('GamePageFooterComponent', () => {
  let component: GamePageFooterComponent;
  let fixture: ComponentFixture<GamePageFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GamePageFooterComponent],
      imports: [RouterTestingModule, HttpClientTestingModule, MatSnackBarModule, TranslateModule.forRoot()],
      providers: [
        { provide: DataStoreService, useClass: MockDataStoreService },
        { provide: GlobalizationService, useValue: {} },
        { provide: PlayerService, useValue: {} },
        { provide: ProdGameService, useClass: MockCtgApiService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GamePageFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
