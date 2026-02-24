import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DialogRef, DialogModule } from '@angular/cdk/dialog';
import { BaseDialogComponent } from '@app/@shared/components/base-dialog/base-dialog.component';
import { CdnizePipe } from '@app/@pipes/cdnize.pipe';

@Component({
  selector: 'app-maintenance-dialog',
  templateUrl: './maintenance-dialog.component.html',
  styleUrls: ['./maintenance-dialog.component.scss'],
  standalone: true,
  imports: [DialogModule, BaseDialogComponent, CdnizePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MaintenanceDialogComponent {
  private dialogRef = inject(DialogRef);

  onAccept() {
    this.dialogRef.close();
  }
}
