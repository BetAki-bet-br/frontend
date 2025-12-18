import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CasinoWinsComponent } from './casino-wins.component';
import { TranslateModule } from '@ngx-translate/core';
import {
  BalanceService,
  GlobalizationService,
  PlayerService,
  ProdGameService,
} from '@icore/ngx-portalgateway-api-client-atl';
import { MockCtgApiService } from '@app/@shared/http/ctg-api.service.mock';
import { HttpBackend } from '@angular/common/http';

describe('CasinoWinsComponent', () => {
  let component: CasinoWinsComponent;
  let fixture: ComponentFixture<CasinoWinsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), CasinoWinsComponent],
      providers: [
        { provide: GlobalizationService, useValue: {} },
        {
          provide: PlayerService,
          useClass: MockCtgApiService,
        },
        { provide: ProdGameService, useClass: MockCtgApiService },
        { provide: BalanceService, useClass: MockCtgApiService },
        HttpBackend,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CasinoWinsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
