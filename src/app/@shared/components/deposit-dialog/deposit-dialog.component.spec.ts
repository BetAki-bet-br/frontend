import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepositDialogComponent } from './deposit-dialog.component';
import { PaymentsService } from '@app/@shared/services/payment.service';
import { Observable, of } from 'rxjs';
import { GlobalizationService, PlayerService, ProdGameService } from '@icore/ngx-portalgateway-api-client-atl';
import { MockCtgApiService } from '@app/@shared/http/ctg-api.service.mock';
import { Dialog } from '@angular/cdk/dialog';
import { FirstDepositCheckService } from '@app/@shared/services/first-deposit-check.service';
import { TranslateModule } from '@ngx-translate/core';

class MockPaymentsService {
  createDeposit(): Observable<any> {
    return of({});
  }
}

describe('DepositDialogComponent', () => {
  let component: DepositDialogComponent;
  let fixture: ComponentFixture<DepositDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DepositDialogComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: PaymentsService, useClass: MockPaymentsService }, // Use the mock service
        { provide: GlobalizationService, MockCtgApiService },
        { provide: PlayerService, useClass: MockCtgApiService },
        { provide: ProdGameService, useClass: MockCtgApiService },
        { provide: Dialog, useValue: {} },
        { provide: FirstDepositCheckService, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DepositDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
