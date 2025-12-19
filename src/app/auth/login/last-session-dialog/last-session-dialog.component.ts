import { DialogRef, DIALOG_DATA, DialogModule } from '@angular/cdk/dialog'; // Added DialogModule
import { CommonModule, DatePipe } from '@angular/common'; // Added CommonModule, DatePipe
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TwentyFourDateFormat } from '@app/@core/date-formats';
import { BaseDialogComponent } from '@app/@shared/components/base-dialog/base-dialog.component'; // Added BaseDialogComponent
import { MatButtonModule } from '@angular/material/button'; // Added MatButtonModule
import { TranslateModule } from '@ngx-translate/core'; // Added TranslateModule

@Component({
  selector: 'app-last-session-dialog',
  templateUrl: './last-session-dialog.component.html',
  styleUrls: ['./last-session-dialog.component.scss'],
  imports: [
    // Added imports array
    CommonModule,
    TranslateModule,
    BaseDialogComponent,
    MatButtonModule,
    DialogModule,
    DatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LastSessionDialogComponent {
  private dialogRef = inject<DialogRef<LastSessionDialogComponent>>(DialogRef);
  lastLoginTime = inject(DIALOG_DATA);

  dateFormat = TwentyFourDateFormat;

  currentDate = new Date();

  onClose() {
    this.dialogRef.close();
  }
}
