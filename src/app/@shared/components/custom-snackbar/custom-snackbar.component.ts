import { Component, Inject, OnInit } from '@angular/core';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

export interface CustomSnackbarComponentData {
  message: string;
  type: 'success' | 'error';
}

@Component({
  selector: 'app-custom-snackbar',
  templateUrl: './custom-snackbar.component.html',
  styleUrls: ['./custom-snackbar.component.scss'],
})
export class CustomSnackbarComponent implements OnInit {
  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: CustomSnackbarComponentData,
    private snackbarRef: MatSnackBarRef<CustomSnackbarComponent>
  ) {}

  ngOnInit(): void {}

  close() {
    this.snackbarRef?.dismiss();
  }
}
