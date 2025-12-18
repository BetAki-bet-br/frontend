/*
 * @Copyright (C) 2020 Comtrade d.o.o. all rights reserved.
 *
 * Possession of this software does not grant any rights to use, reproduce,
 * modify or distribute it or to use any concept it may contain.
 *
 * Licensed under Comtrade d.o.o. license ('the License'); you may not use
 * this software unless in compliance with the License. Any use of the software
 * without such license is a violation of copyright laws and may be subject to
 * legal actions (remedies and/or criminal prosecution).
 *
 * NOTE: If you receive this content in error, please let us know by contacting
 * Comtrade d.o.o. legal department (legal@comtradegroup.com) and destroy any copy
 * you may have.
 */

import { Injectable, NgZone } from '@angular/core';
import { MatSnackBar, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { MatSnackBarHorizontalPosition } from '@angular/material/snack-bar';
import { MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import {
  CustomSnackbarComponent,
  CustomSnackbarComponentData,
} from '@app/@shared/components/custom-snackbar/custom-snackbar.component';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  constructor(public snackBar: MatSnackBar, public translateService: TranslateService, private zone: NgZone) {}

  /* public openPrimary(
    message: string = '',
    duration: number = 2000,
    panelClass: string[] = ['mat-primary'],
    horizontalPosition: MatSnackBarHorizontalPosition = 'center',
    verticalPosition: MatSnackBarVerticalPosition = 'bottom'
  ): MatSnackBarRef<TextOnlySnackBar> {
    const result: MatSnackBarRef<TextOnlySnackBar> = this.snackBar.open(message, undefined, {
      duration,
      panelClass,
      horizontalPosition,
      verticalPosition,
    });
    return result;
  }

  public openSuccess(
    message: string = '',
    duration: number = 3000,
    panelClass: string[] = ['snackbar-success'],
    horizontalPosition: MatSnackBarHorizontalPosition = 'center',
    verticalPosition: MatSnackBarVerticalPosition = 'bottom'
  ): MatSnackBarRef<TextOnlySnackBar> {
    const result: MatSnackBarRef<TextOnlySnackBar> = this.snackBar.open(message, undefined, {
      duration,
      panelClass,
      horizontalPosition,
      verticalPosition,
    });
    return result;
  }

  public openWarning(
    message: string = '',
    duration: number = 3000,
    panelClass: string[] = ['snackbar-warning'],
    horizontalPosition: MatSnackBarHorizontalPosition = 'center',
    verticalPosition: MatSnackBarVerticalPosition = 'bottom'
  ): MatSnackBarRef<TextOnlySnackBar> {
    const result: MatSnackBarRef<TextOnlySnackBar> = this.snackBar.open(message, undefined, {
      duration,
      panelClass,
      horizontalPosition,
      verticalPosition,
    });
    return result;
  }

  public openError(
    message: string = '',
    duration: number = 3000,
    panelClass: string[] = ['snackbar-error'],
    horizontalPosition: MatSnackBarHorizontalPosition = 'center',
    verticalPosition: MatSnackBarVerticalPosition = 'bottom'
  ): MatSnackBarRef<TextOnlySnackBar> {
    const result: MatSnackBarRef<TextOnlySnackBar> = this.snackBar.open(message, undefined, {
      duration,
      panelClass,
      horizontalPosition,
      verticalPosition,
    });
    return result;
  }

  public openLoading(
    message: string = '',
    duration: number = 3000,
    panelClass: string[] = ['snackbar-loading'],
    horizontalPosition: MatSnackBarHorizontalPosition = 'center',
    verticalPosition: MatSnackBarVerticalPosition = 'bottom'
  ): MatSnackBarRef<TextOnlySnackBar> {
    const result: MatSnackBarRef<TextOnlySnackBar> = this.snackBar.open(message, undefined, {
      duration,
      panelClass,
      horizontalPosition,
      verticalPosition,
    });
    return result;
  } */

  public openCustomSuccess(
    message: string = '',
    horizontalPosition: MatSnackBarHorizontalPosition = 'end',
    verticalPosition: MatSnackBarVerticalPosition = 'bottom',
    duration: number = 3000
  ): MatSnackBarRef<CustomSnackbarComponent> {
    const result: MatSnackBarRef<CustomSnackbarComponent> = this.snackBar.openFromComponent(CustomSnackbarComponent, {
      data: { message: this.translateService.instant(message), type: 'success' } as CustomSnackbarComponentData,
      horizontalPosition,
      verticalPosition,
      panelClass: ['custom-component-snackbar', 'success'],
      duration,
    });
    return result;
  }

  // TODO: if needed
  /* public openCustomInfo(
    message: string = '',
    horizontalPosition: MatSnackBarHorizontalPosition = 'end',
    verticalPosition: MatSnackBarVerticalPosition = 'bottom',
    duration: number = 3000
  ): MatSnackBarRef<CustomSnackbarComponent> {
    const result: MatSnackBarRef<CustomSnackbarComponent> = this.snackBar.openFromComponent(CustomSnackbarComponent, {
      data: { message, type: 'info' } as CustomSnackbarComponentData,
      horizontalPosition,
      verticalPosition,
      panelClass: ['custom-component-snackbar', 'info'],
      duration,
    });
    return result;
  }

  public openCustomWarning(
    message: string = '',
    horizontalPosition: MatSnackBarHorizontalPosition = 'end',
    verticalPosition: MatSnackBarVerticalPosition = 'bottom',
    duration: number = 3000
  ): MatSnackBarRef<CustomSnackbarComponent> {
    const result: MatSnackBarRef<CustomSnackbarComponent> = this.snackBar.openFromComponent(CustomSnackbarComponent, {
      data: { message, type: 'warning' } as CustomSnackbarComponentData,
      horizontalPosition,
      verticalPosition,
      panelClass: ['custom-component-snackbar', 'warning'],
      duration,
    });
    return result;
  } */

  public openCustomError(
    message: string = '',
    horizontalPosition: MatSnackBarHorizontalPosition = 'end',
    verticalPosition: MatSnackBarVerticalPosition = 'bottom',
    duration: number = 300000
  ): MatSnackBarRef<CustomSnackbarComponent> {
    const result: MatSnackBarRef<CustomSnackbarComponent> = this.snackBar.openFromComponent(CustomSnackbarComponent, {
      data: { message: this.translateService.instant(message), type: 'error' } as CustomSnackbarComponentData,
      horizontalPosition,
      verticalPosition,
      panelClass: ['custom-component-snackbar', 'error'],
      duration,
    });
    return result;
  }
}
