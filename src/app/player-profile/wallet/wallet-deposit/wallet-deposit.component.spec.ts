import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WalletDepositComponent } from './wallet-deposit.component';
import { PaymentsService } from '@app/@shared/services/payment.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PlayerService } from '@icore/ngx-portalgateway-api-client-atl';
import { MockCtgApiService } from '@app/@shared/http/ctg-api.service.mock';
import { Dialog } from '@angular/cdk/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { PipesModule } from '@app/@pipes/pipes.module';

describe('WalletDepositComponent', () => {
  let component: WalletDepositComponent;
  let fixture: ComponentFixture<WalletDepositComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), HttpClientTestingModule, RouterTestingModule, PipesModule],
      declarations: [WalletDepositComponent],
      providers: [
        { provide: PaymentsService, useValue: {} },
        { provide: MatSnackBar, useValue: {} },
        {
          provide: PlayerService,
          useClass: MockCtgApiService,
        },
        { provide: Dialog, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WalletDepositComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
