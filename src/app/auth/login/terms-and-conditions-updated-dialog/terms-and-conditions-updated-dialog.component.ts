import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HelpService } from '@app/help/help.service';
import { CurrentTermsAndConditionsResponse } from '@icore/ngx-portalgateway-api-client-atl';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

export interface TermsAndConditionsUpdatedDialogResult {
  acceptTC: boolean;
}

@UntilDestroy()
@Component({
  selector: 'app-terms-and-conditions-updated-dialog',
  templateUrl: './terms-and-conditions-updated-dialog.component.html',
  styleUrls: ['./terms-and-conditions-updated-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TermsAndConditionsUpdatedDialogComponent implements OnInit {
  // Terms and conditions content should have a div around it for scroll to work
  termsAndConditions: CurrentTermsAndConditionsResponse | undefined;

  constructor(
    private dialogRef: DialogRef<TermsAndConditionsUpdatedDialogResult>,
    private helpService: HelpService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.helpService
      .getTermsAndConditions()
      .pipe(untilDestroyed(this))
      .subscribe((result) => {
        this.termsAndConditions = result;
        this.cdr.markForCheck();
      });
  }

  confirm() {
    this.dialogRef.close({ acceptTC: true });
  }

  cancel() {
    this.dialogRef.close({ acceptTC: false });
  }
}
