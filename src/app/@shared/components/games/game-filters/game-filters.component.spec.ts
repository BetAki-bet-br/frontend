import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { of } from 'rxjs';

import { GameFiltersComponent } from './game-filters.component';
import { GlobalizationService, PlayerService, ProdGameService } from '@icore/ngx-portalgateway-api-client-atl';
import { TranslateModule } from '@ngx-translate/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MockCtgApiService } from '@app/@shared/http/ctg-api.service.mock';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheet,
  MatBottomSheetModule,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';

describe('GameFiltersComponent', () => {
  let component: GameFiltersComponent;
  let fixture: ComponentFixture<GameFiltersComponent>;

  beforeEach(async () => {
    const paramMap: ParamMap = convertToParamMap({ provider: 'example-provider' });
    const activatedRouteStub = {
      params: of(paramMap),
    };

    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), MatBottomSheetModule, GameFiltersComponent],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: MatBottomSheet, useValue: {} },
        { provide: MatBottomSheetRef, useValue: {} },
        { provide: MAT_BOTTOM_SHEET_DATA, useValue: {} },
        // Other providers
        { provide: ProdGameService, useValue: {} },
        { provide: GlobalizationService, useValue: {} },
        { provide: PlayerService, useClass: MockCtgApiService },
        { provide: ProdGameService, useClass: MockCtgApiService },
        provideHttpClient(withInterceptorsFromDi()),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GameFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
