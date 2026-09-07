import { CommonModule, UpperCasePipe } from '@angular/common'; // Added CommonModule and UpperCasePipe
import { MatIconModule } from '@angular/material/icon'; // Added MatIconModule
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, inject } from '@angular/core';
import { Logger } from '@app/@shared/logger.service';
import { PlayerProfileService } from '@app/player-profile/player-profile.service';
import { PlayerVerificationStatuses } from '@app/@core/gateway';
import { TranslateModule } from '@ngx-translate/core'; // Added TranslateModule
import { BaseDialogComponent } from '../base-dialog/base-dialog.component'; // Added BaseDialogComponent
import { CdnizePipe } from '@app/@pipes/cdnize.pipe'; // Added CdnizePipe
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { toSignal } from '@angular/core/rxjs-interop';

const log = new Logger('ProcessVerificationDialog');

export enum ProcessVerificationResultEnum {
  KYC = 1,
  Address,
  Email,
  PhoneNumber,
}

export interface ProcessVerificationDialogData {
  isWithdrawalProcess?: boolean;
}

@Component({
  selector: 'app-process-verification-dialog',
  templateUrl: './process-verification-dialog.component.html',
  styleUrls: ['./process-verification-dialog.component.scss'],
  imports: [
    // Added imports array
    CommonModule,
    MatIconModule,
    TranslateModule,
    BaseDialogComponent,
    CdnizePipe,
    UpperCasePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProcessVerificationDialogComponent {
  private dialogRef = inject<DialogRef<ProcessVerificationResultEnum>>(DialogRef);
  private playerProfileService = inject(PlayerProfileService);
  data = inject<ProcessVerificationDialogData>(DIALOG_DATA, { optional: true });

  playerVerificationStatus = toSignal(this.playerProfileService.getPlayerVerificationStatus(), {
    initialValue: {} as PlayerVerificationStatuses,
  });

  ProcessVerificationResultEnum = ProcessVerificationResultEnum;

  onConfirm(action?: ProcessVerificationResultEnum) {
    this.dialogRef.close(action);
  }

  onCancel() {
    this.dialogRef.close();
  }
}
