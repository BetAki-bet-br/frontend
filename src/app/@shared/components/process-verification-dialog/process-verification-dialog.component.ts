import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Logger } from '@app/@shared/logger.service';
import { PlayerProfileService } from '@app/player-profile/player-profile.service';
import { PlayerStatusesResponse } from '@icore/ngx-portalgateway-api-client-atl';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProcessVerificationDialogComponent implements OnInit {
  playerVerificationStatus!: PlayerStatusesResponse;

  ProcessVerificationResultEnum = ProcessVerificationResultEnum;

  constructor(
    private dialogRef: DialogRef<ProcessVerificationResultEnum>,
    private playerProfileService: PlayerProfileService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.playerProfileService.getPlayerVerificationStatus().subscribe((response) => {
      this.playerVerificationStatus = response;
      this.cdr.detectChanges();
    });
  }

  onConfirm(action?: ProcessVerificationResultEnum) {
    this.dialogRef.close(action);
  }

  onCancel() {
    this.dialogRef.close();
  }
}
