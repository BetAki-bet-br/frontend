/*
 * @Copyright (C) 2023 Comtrade d.o.o. all rights reserved.
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

import { Directive, EventEmitter, HostBinding, HostListener, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Directive({
  selector: '[appFileUpload]',
})
export class FileUploadDirective {
  @Output() emitItems = new EventEmitter<any>();
  // Used for setting the class when user is using drag'n'drop
  @HostBinding('class.fileover') fileover?: boolean;

  constructor(public snackbar: MatSnackBar, private translateService: TranslateService) {}

  /**
   * Sets fileover to true when user drags a file over the div
   *
   * @param event In this case mouse dragover event.
   */
  @HostListener('dragover', ['$event']) public onDragOver(event: any) {
    event.preventDefault();
    event.stopPropagation();
    this.fileover = true;
  }

  /**
   * Sets fileover to false when user leaves div
   *
   * @param event In this case mouse dragleave event.
   */
  @HostListener('dragleave', ['$event']) public onDragLeave(event: any) {
    event.preventDefault();
    event.stopPropagation();
    this.fileover = false;
  }

  /**
   * Triggered when user drops file inside div. Emits file to parent
   *
   * @param event In this case file drop event.
   */
  @HostListener('drop', ['$event']) public onDrop(event: any) {
    event.preventDefault();
    event.stopPropagation();

    this.fileover = false;
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      this.emitItems.emit(files);
    }
  }
}
