import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PaymentMethod } from '@app/@shared/models';
import { DepositMethods, WithdrawMethods } from './payments.data';
import { CredentialsService } from '@app/auth';

import { TranslateModule } from '@ngx-translate/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonModule } from '@angular/material/button';
import { PaymentsTableComponent } from './payments-table/payments-table.component';
import { BasicPageContainerComponent } from '@app/@shared/components/basic-page-container/basic-page-container.component';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [
    TranslateModule,
    MatButtonToggleModule,
    MatButtonModule,
    PaymentsTableComponent,
    BasicPageContainerComponent,
  ],
})
export class PaymentsComponent {
  private credentialsService = inject(CredentialsService);

  depositMethods: PaymentMethod[] = DepositMethods;
  withdrawMethods: PaymentMethod[] = WithdrawMethods;

  selectedWithdrawal = false;
  selectedDeposit = true;

  get username(): string {
    const credentials = this.credentialsService.credentials;
    return credentials ? credentials.username : '';
  }

  selectDeposit() {
    if (!this.selectedDeposit) {
      this.selectedDeposit = true;
      this.selectedWithdrawal = false;
    }
  }

  selectWithdrawal() {
    if (!this.selectedWithdrawal) {
      this.selectedWithdrawal = true;
      this.selectedDeposit = false;
    }
  }
}
