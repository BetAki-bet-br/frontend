import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { HelpService } from '@app/help/help.service';
import { CurrentTermsAndConditionsResponse } from '@icore/ngx-portalgateway-api-client-atl';
import { BaseDialogComponent } from '@app/@shared/components/base-dialog/base-dialog.component';
import { ButtonComponent } from '@app/@shared/components/button/button.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface TermsAndConditionsUpdatedDialogResult {
  acceptTC: boolean;
}

@Component({
  selector: 'app-terms-and-conditions-updated-dialog',
  templateUrl: './terms-and-conditions-updated-dialog.component.html',
  styleUrls: ['./terms-and-conditions-updated-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseDialogComponent, MatProgressSpinner, TranslateModule, ButtonComponent],
})
export class TermsAndConditionsUpdatedDialogComponent implements OnInit {
  private dialogRef = inject<DialogRef<TermsAndConditionsUpdatedDialogResult>>(DialogRef);
  private helpService = inject(HelpService);
  private cdr = inject(ChangeDetectorRef);
  destroyRef = inject(DestroyRef);
  // Terms and conditions content should have a div around it for scroll to work
  termsAndConditions: CurrentTermsAndConditionsResponse | undefined;

  ngOnInit(): void {
    this.helpService
      .getTermsAndConditions()
      .pipe(takeUntilDestroyed(this.destroyRef))
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
