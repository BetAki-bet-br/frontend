import { Component, inject } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { FillPlayerInfoDialogComponent } from '@app/@shared/components/fill-player-info-dialog/fill-player-info-dialog.component';
import { DepositDialogComponent } from '@app/@shared/components/deposit-dialog/deposit-dialog.component';
import {
  PromotionActionDialogComponent,
  PromotionActionDialogData,
} from '@app/promotions/promotions/promotion-action-dialog/promotion-action-dialog.component';
import { ActionType } from '@app/promotions/promotions/promotions.component';
import { MessageDialogComponent } from '@app/@shared/components/message-dialog/message-dialog.component';
import { PopupMessageDialogComponent } from '@app/@shared/components/popup-message-dialog/popup-message-dialog.component';
import { MessageResolved } from '@app/@shared/models/message.model';
import { PlayerActivationDialogComponent } from '@app/@shared/components/player-activation-dialog/player-activation-dialog.component';
import { AccessRestrictedDialogComponent } from '@app/@shared/components/access-restricted-dialog/access-restricted-dialog.component';
import { WithdrawalDialogComponent } from '@app/@shared/components/withdrawal-dialog/withdrawal-dialog.component';
import { PausePeriodDialogComponent } from '@app/player-profile/responsible-gambling/pause-period-dialog/pause-period-dialog.component';
import { BonusOptInResultDialogComponent } from '@app/player-profile/promo/bonus-opt-in-result-dialog/bonus-opt-in-result-dialog.component';
import { AccountClosureDialogComponent } from '@app/player-profile/profile-settings/profile-settings-security/account-closure-dialog/account-closure-dialog.component';
import { FaceAuthenticatorDialogComponent } from '@app/@shared/components/face-authenticator-dialog/face-authenticator-dialog.component';
import { AdblockerDialogComponent } from '@app/auth/login/adblocker-dialog/adblocker-dialog.component';
import { AnnualVerificationDialogComponent } from '@app/@shared/components/annual-verification-dialog/annual-verification-dialog.component';
import { AgeConfirmationDialogComponent } from '@app/users/age-confirmation-dialog/age-confirmation-dialog.component';

// I will need to find and import all these components.
// This will be a multi-step process.

@Component({
  selector: 'app-dialog-test',
  templateUrl: './dialog-test.component.html',
  styleUrls: ['./dialog-test.component.scss'],
  standalone: true,
})
export class DialogTestComponent {
  private dialog = inject(Dialog);

  constructor() {}

  openFillPlayerInfoDialog() {
    this.dialog.open(FillPlayerInfoDialogComponent);
  }
  openDepositDialog() {
    this.dialog.open(DepositDialogComponent);
  }
  openPromotionActionDialog_OptIn_Loading() {
    const dialogData: PromotionActionDialogData = {
      type: 'OptIn',
      subtitle: 'Test Promotion',
      description: 'Processing your opt in. This may take a moment.',
      isLoading: true,
    };
    this.dialog.open(PromotionActionDialogComponent, { data: dialogData });
  }
  openPromotionActionDialog_OptIn_Success() {
    const dialogData: PromotionActionDialogData = {
      type: 'OptIn',
      subtitle: 'Test Promotion',
      description: 'You have successfully opt in to this promotion.',
      isLoading: false,
    };
    this.dialog.open(PromotionActionDialogComponent, { data: dialogData });
  }
  openPromotionActionDialog_OptIn_Error() {
    const dialogData: PromotionActionDialogData = {
      type: 'OptIn',
      subtitle: 'Test Promotion',
      description: 'Something went wrong while processing your opt in.',
      isLoading: false,
      error: true,
    };
    this.dialog.open(PromotionActionDialogComponent, { data: dialogData });
  }
  openMessageDialog() {
    this.dialog.open(MessageDialogComponent, {
      data: {
        title: 'Test Message',
        description: 'This is a test message for the MessageDialogComponent.',
      },
    });
  }
  openPlayerActivationDialog() {
    this.dialog.open(PlayerActivationDialogComponent);
  }
  openPopupMessageDialog() {
    const mockMessage: MessageResolved = {
      title: 'Popup Message',
      contents: '<h1>Hello!</h1><p>This is a popup message with <strong>HTML</strong> content.</p>',
      showCloseButton: true,
      actions: [
        { id: 1, name: 'Confirm' },
        { id: 2, name: 'Cancel' },
      ],
    };
    this.dialog.open(PopupMessageDialogComponent, { data: mockMessage });
  }
  openAccessRestrictedDialog() {
    this.dialog.open(AccessRestrictedDialogComponent);
  }
  openPlayerInfoDialog() {
    this.dialog.open(FillPlayerInfoDialogComponent);
    console.log('openPlayerInfoDialog triggered');
  }
  openWithdrawalDialog() {
    this.dialog.open(WithdrawalDialogComponent);
    console.log('openWithdrawalDialog triggered');
  }
  openPausePeriodDialog() {
    this.dialog.open(PausePeriodDialogComponent);
    console.log('openPausePeriodDialog triggered');
  }
  openBonusOptInResultDialog() {
    this.dialog.open(BonusOptInResultDialogComponent);
    console.log('openBonusOptInResultDialog triggered');
  }
  openAccountClosureDialog() {
    this.dialog.open(AccountClosureDialogComponent);
    console.log('openAccountClosureDialog triggered');
  }
  openFaceAuthenticatorDialog() {
    this.dialog.open(FaceAuthenticatorDialogComponent);
    console.log('openFaceAuthenticatorDialog triggered');
  }
  openAdblockerDialog() {
    this.dialog.open(AdblockerDialogComponent);
    console.log('openAdblockerDialog triggered');
  }
  openAnnualVerificationDialog() {
    this.dialog.open(AnnualVerificationDialogComponent);
    console.log('openAnnualVerificationDialog triggered');
  }
  openAgeConfirmationDialog() {
    this.dialog.open(AgeConfirmationDialogComponent);
    console.log('openAgeConfirmationDialog triggered');
  }
}
