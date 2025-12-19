import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FillPlayerInfoDialogComponent } from './fill-player-info-dialog.component';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import {
  BalanceService,
  BonusService,
  GlobalizationService,
  LoyaltyService,
  PlayerService,
  ProdGameService,
} from '@icore/ngx-portalgateway-api-client-atl';
import { TranslateModule } from '@ngx-translate/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MockCtgApiService } from '@app/@shared/http/ctg-api.service.mock';
import { RenderTemplatePipe } from '@app/@pipes/render-template.pipe';
import { EllipsisPipe } from '@app/@pipes/ellipsis.pipe';
import { ActivatedRoute } from '@angular/router';

describe('FillPlayerInfoDialogComponent', () => {
  let component: FillPlayerInfoDialogComponent;
  let fixture: ComponentFixture<FillPlayerInfoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), FillPlayerInfoDialogComponent],
      providers: [
        { provide: DialogRef, useValue: {} },
        { provide: PlayerService, useClass: MockCtgApiService },
        { provide: ProdGameService, useClass: MockCtgApiService },
        { provide: GlobalizationService, MockCtgApiService },
        { provide: BalanceService, MockCtgApiService },
        { provide: BonusService, MockCtgApiService },
        { provide: LoyaltyService, MockCtgApiService },
        { provide: HttpClient, useValue: {} },
        { provide: MatSnackBar, useValue: {} },
        { provide: Dialog, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
        HttpBackend,
        RenderTemplatePipe,
        EllipsisPipe,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FillPlayerInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
