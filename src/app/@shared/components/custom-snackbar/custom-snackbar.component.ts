import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { MatIcon } from '@angular/material/icon';

export interface CustomSnackbarComponentData {
  message: string;
  type: 'success' | 'error';
}

@Component({
  selector: 'app-custom-snackbar',
  templateUrl: './custom-snackbar.component.html',
  styleUrls: ['./custom-snackbar.component.scss'],
  imports: [MatIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomSnackbarComponent implements OnInit {
  data = inject<CustomSnackbarComponentData>(MAT_SNACK_BAR_DATA);
  private snackbarRef = inject<MatSnackBarRef<CustomSnackbarComponent>>(MatSnackBarRef);

  ngOnInit(): void {}

  close() {
    this.snackbarRef?.dismiss();
  }
}
