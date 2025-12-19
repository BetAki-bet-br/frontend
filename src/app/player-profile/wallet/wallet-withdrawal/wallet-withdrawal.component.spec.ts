import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WalletWithdrawalComponent } from './wallet-withdrawal.component';
import { PaymentsService } from '@app/@shared/services/payment.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { Dialog } from '@angular/cdk/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PipesModule } from '@app/@pipes/pipes.module';

describe('WalletWithdrawalComponent', () => {
  let component: WalletWithdrawalComponent;
  let fixture: ComponentFixture<WalletWithdrawalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), HttpClientTestingModule, RouterTestingModule, PipesModule],
      declarations: [WalletWithdrawalComponent],
      providers: [
        { provide: PaymentsService, useValue: {} },
        { provide: MatSnackBar, useValue: {} },
        { provide: Dialog, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WalletWithdrawalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
