import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { of } from 'rxjs';
import { GlobalizationService, PlayerService, ProdGameService } from '@icore/ngx-portalgateway-api-client-atl';
import { TranslateModule } from '@ngx-translate/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MockCtgApiService } from '@app/@shared/http/ctg-api.service.mock';
import { GameFiltersProvidersDrawerComponent } from './game-filters-providers.component';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheet,
  MatBottomSheetModule,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { MatDialogModule } from '@angular/material/dialog';

describe('GameFiltersProvidersDrawerComponent', () => {
  let component: GameFiltersProvidersDrawerComponent;
  let fixture: ComponentFixture<GameFiltersProvidersDrawerComponent>;

  beforeEach(async () => {
    const paramMap: ParamMap = convertToParamMap({ provider: 'example-provider' });
    const activatedRouteStub = {
      params: of(paramMap),
    };

    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), MatDialogModule, MatBottomSheetModule, GameFiltersProvidersDrawerComponent],
      providers: [
        { provide: MatBottomSheet, useValue: {} },
        { provide: MatBottomSheetRef, useValue: {} },
        { provide: MAT_BOTTOM_SHEET_DATA, useValue: {} },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        // Other providers
        { provide: GlobalizationService, useValue: {} },
        { provide: PlayerService, useClass: MockCtgApiService },
        { provide: ProdGameService, useValue: {} },
        { provide: ProdGameService, useClass: MockCtgApiService },
        provideHttpClient(withInterceptorsFromDi()),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GameFiltersProvidersDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
