import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalSearchComponent } from './global-search.component';
import { GlobalizationService, PlayerService, ProdGameService } from '@icore/ngx-portalgateway-api-client-atl';
import { TranslateModule } from '@ngx-translate/core';
import { MockCtgApiService } from '@app/@shared/http/ctg-api.service.mock';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('GlobalSearchComponent', () => {
  let component: GlobalSearchComponent;
  let fixture: ComponentFixture<GlobalSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GlobalSearchComponent],
      imports: [TranslateModule.forRoot(), HttpClientModule, MatSnackBarModule],
      providers: [
        { provide: ProdGameService, useClass: MockCtgApiService },
        { provide: GlobalizationService, useValue: {} },
        { provide: PlayerService, useClass: MockCtgApiService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GlobalSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
