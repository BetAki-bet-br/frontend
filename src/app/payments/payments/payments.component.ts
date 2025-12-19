import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PaymentMethod } from '@app/@shared/models';
import { DepositMethods, WithdrawMethods } from './payments.data';
import { CredentialsService } from '@app/auth';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class PaymentsComponent {
  depositMethods: PaymentMethod[] = DepositMethods;
  withdrawMethods: PaymentMethod[] = WithdrawMethods;

  constructor(private credentialsService: CredentialsService) {}

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
