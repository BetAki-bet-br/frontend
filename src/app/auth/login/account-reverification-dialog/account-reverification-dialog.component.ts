import { DialogRef, DialogModule } from '@angular/cdk/dialog'; // Added DialogModule
// Added CommonModule
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'; // Added ReactiveFormsModule
import { MatButtonModule } from '@angular/material/button'; // Added MatButtonModule
import { MatFormFieldModule } from '@angular/material/form-field'; // Added MatFormFieldModule
import { MatInputModule } from '@angular/material/input'; // Added MatInputModule
import { MatIconModule } from '@angular/material/icon'; // Added MatIconModule (assuming mat-icon is used with mat-error)
// Added MatError
import { BaseDialogComponent } from '@app/@shared/components/base-dialog/base-dialog.component'; // Added BaseDialogComponent
// Added LoaderComponent
import { cpfValidator } from '@app/@shared/form-utils';
import { TranslateModule } from '@ngx-translate/core'; // Added TranslateModule

export interface AccountReverificationDialogResult {
  activate?: boolean;
}

@Component({
  selector: 'app-account-reverification-dialog',
  templateUrl: './account-reverification-dialog.component.html',
  styleUrls: ['./account-reverification-dialog.component.scss'],
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    BaseDialogComponent,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    DialogModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountReverificationDialogComponent {
  private dialogRef = inject<DialogRef<AccountReverificationDialogResult>>(DialogRef);

  error: string = '';
  isDataLoading = false;

  cpfForm = new FormGroup({
    cpf: new FormControl<string>('', [Validators.required, cpfValidator()]),
  });

  activateAccount() {
    this.dialogRef.close({
      activate: true,
    });
  }
}
