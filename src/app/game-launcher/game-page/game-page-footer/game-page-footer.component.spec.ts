import { RouterModule } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamePageFooterComponent } from './game-page-footer.component';

import { DataStoreService } from '@app/@core';
import { GlobalizationService, PlayerService, ProdGameService } from '@icore/ngx-portalgateway-api-client-atl';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { MockCtgApiService } from '@app/@shared/http/ctg-api.service.mock';
import { MockDataStoreService } from '@app/@core/data-store.service.mock';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('GamePageFooterComponent', () => {
  let component: GamePageFooterComponent;
  let fixture: ComponentFixture<GamePageFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatSnackBarModule, TranslateModule.forRoot(), GamePageFooterComponent, RouterModule],
      providers: [
        { provide: DataStoreService, useClass: MockDataStoreService },
        { provide: GlobalizationService, useValue: {} },
        { provide: PlayerService, useValue: {} },
        { provide: ProdGameService, useClass: MockCtgApiService },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
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
