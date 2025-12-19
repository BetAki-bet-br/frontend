import { CommonModule, UpperCasePipe } from '@angular/common'; // Added CommonModule and UpperCasePipe
import { MatIconModule } from '@angular/material/icon'; // Added MatIconModule
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { Logger } from '@app/@shared/logger.service';
import { PlayerProfileService } from '@app/player-profile/player-profile.service';
import { PlayerStatusesResponse } from '@icore/ngx-portalgateway-api-client-atl';
import { TranslateModule } from '@ngx-translate/core'; // Added TranslateModule
import { BaseDialogComponent } from '../base-dialog/base-dialog.component'; // Added BaseDialogComponent
import { CdnizePipe } from '@app/@pipes/cdnize.pipe'; // Added CdnizePipe
import { DialogRef } from '@angular/cdk/dialog';

const log = new Logger('ProcessVerificationDialog');

export enum ProcessVerificationResultEnum {
  KYC = 1,
  Address,
  Email,
  PhoneNumber,
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
export class ProcessVerificationDialogComponent implements OnInit {
  private dialogRef = inject<DialogRef<ProcessVerificationResultEnum>>(DialogRef);
  private playerProfileService = inject(PlayerProfileService);
  private cdr = inject(ChangeDetectorRef);

  playerVerificationStatus: PlayerStatusesResponse = {
    kycStatus: false,
    address: false,
    email: false,
    phoneNumber: false,
  } as PlayerStatusesResponse;

  ProcessVerificationResultEnum = ProcessVerificationResultEnum;

  constructor() {
    this.playerProfileService.getPlayerVerificationStatus().subscribe((response) => {
      this.playerVerificationStatus = response;
      this.cdr.detectChanges();
    });
  }

  ngOnInit(): void {}

  onConfirm(action?: ProcessVerificationResultEnum) {
    this.dialogRef.close(action);
  }

  onCancel() {
    this.dialogRef.close();
  }
}
