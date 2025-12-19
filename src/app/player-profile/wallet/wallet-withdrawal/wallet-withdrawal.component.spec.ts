import { RouterModule } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WalletWithdrawalComponent } from './wallet-withdrawal.component';
import { PaymentsService } from '@app/@shared/services/payment.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { Dialog } from '@angular/cdk/dialog';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { PipesModule } from '@app/@pipes/pipes.module';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('WalletWithdrawalComponent', () => {
  let component: WalletWithdrawalComponent;
  let fixture: ComponentFixture<WalletWithdrawalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), PipesModule, WalletWithdrawalComponent, RouterModule],
      providers: [
        { provide: PaymentsService, useValue: {} },
        { provide: MatSnackBar, useValue: {} },
        { provide: Dialog, useValue: {} },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
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
