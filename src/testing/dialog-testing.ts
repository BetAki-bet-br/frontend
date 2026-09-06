import { Provider } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';

/**
 * Doubles for the handles a dialog component gets from the overlay that opened it. Without them
 * `TestBed.createComponent(SomeDialogComponent)` fails on `inject(DialogRef)` before the test can
 * assert anything.
 *
 * Both the CDK tokens (`DialogRef`/`DIALOG_DATA`) and the Material ones are provided: components
 * here use either, depending on which era they were written in.
 *
 * @param data payload the component reads from `DIALOG_DATA`.
 */
export function provideDialogTesting(data: unknown = {}): Provider[] {
  const dialogRef = {
    close: () => {},
    updateSize: () => {},
    updatePosition: () => {},
    addPanelClass: () => {},
    removePanelClass: () => {},
    afterClosed: () => of(undefined),
    backdropClick: () => of(undefined),
    keydownEvents: () => of(undefined),
    disableClose: false,
  };

  return [
    { provide: DialogRef, useValue: dialogRef },
    { provide: MatDialogRef, useValue: dialogRef },
    { provide: DIALOG_DATA, useValue: data },
    { provide: MAT_DIALOG_DATA, useValue: data },
    { provide: MatDialog, useValue: { open: () => dialogRef, closeAll: () => {} } },
  ];
}
