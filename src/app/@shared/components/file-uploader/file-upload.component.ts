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

import { Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SnackbarService } from '@app/@core/snackbar.service';

/**
 * Configuration for file upload component.
 *
 * fileType: Array of accepted file type extensions (without '.')
 *
 * maxFileSizeMB: maximum allowed file size in kB
 */
export interface FileUploadConfiguration {
  fileType: string[];
  maxFileSizeKB: number;
}

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
})
export class FileUploadComponent implements OnInit {
  @ViewChild('uploadInput', { static: true }) uploadInput?: ElementRef;
  // Emits an array of strings when csv is either dropper or uploaded via browsing
  @Output() emitItems = new EventEmitter<any>();
  @Output() emitFileName = new EventEmitter<string>();
  @Input() configuration: FileUploadConfiguration = {
    fileType: ['*'],
    maxFileSizeKB: 2000,
  };
  @Input() inputId: string = 'file';
  @Input() isFileLoading: boolean = false;

  progress = 0;
  filePresent = false;
  fileName = '';
  acceptedFileTypes = '';

  get fileTypesCsv(): string {
    return this.configuration.fileType.join(', ');
  }

  constructor(
    private snackbarService: SnackbarService,
    private renderer: Renderer2,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    if (this.configuration.maxFileSizeKB == null) {
      this.configuration.maxFileSizeKB = 2000;
    }
    this.acceptedFileTypes = this.configuration.fileType.map((el) => '.' + el).join(',');
  }

  /**
   * Called when user uploads a file via browsing
   *
   * @param file File input from from input
   */
  fileUpload(file: FileList) {
    this.fileLoad(file);
    this.emitFileName.emit(file?.item(0)?.name);
  }

  onUploadInputChange(event: Event): void {
    const inputTarget = event.target as HTMLInputElement;
    if (inputTarget.files) {
      this.fileUpload(inputTarget.files);
    }
  }

  /**
   * Main file load method. Is called whenever user uploads a file.
   *
   * @param files List of files to be read
   */
  fileLoad(files: FileList) {
    if (!files || (this.configuration.maxFileSizeKB > 0 && files[0].size / 1000 > this.configuration.maxFileSizeKB)) {
      this.snackbarService.openCustomError(this.translateService.instant('File exceeds max file size.'));
      return;
    }

    const fileExtension =
      this.configuration.fileType.length === 1 && this.configuration.fileType[0] === '*'
        ? '.*'
        : this.configuration.fileType.join('|');
    const regex = RegExp(`^.+\.(${fileExtension})$`, 'i');

    // Add this if we ever need to check the file types on client side
    // If file does not end with correct extension, it is not accepted.
    // if (!regex.test(files.item(0)?.name ?? '')) {
    //   this.snackbarService.openCustomError(
    //     this.translateService.instant('Incorrect file type.'),
    //     this.translateService.instant('OK')
    //   );
    //   return;
    // }

    const fileReader = new FileReader();
    this.progress = 0;
    this.filePresent = true;

    const isCsv = /^.+\.(csv)$/i.test(files.item(0)?.name ?? '');

    // File is read and split by '\n' (new line) separator to create an array of lines from csv.
    fileReader.onload = () => {
      let fileOutput: any = null;

      // If file is of type csv, it is split into rows and sent to parent as array of strings
      if (isCsv) {
        fileOutput = fileReader?.result?.toString().split('\n');
      } else {
        fileOutput = files.item(0);
      }

      fileOutput.inputId = this.inputId;

      // Items are emitted to parent component.
      this.emitItems.emit(fileOutput);
      // Value of browse is set to null to be able to upload the same file one after the other.
      this.renderer.setProperty(this.uploadInput?.nativeElement, 'value', null);
    };

    // Progress bar value calculation
    fileReader.onprogress = (data) => {
      if (data.lengthComputable) {
        this.progress = Math.round((data.loaded / data.total) * 100);
      }
    };

    if (files.item(0)) {
      const file = files ? files.item(0) : null;
      this.fileName = file ? file.name : '';
      // Triggers reading of file. If file is csv, it is read as text, otherwise it is just
      if (isCsv) {
        if (file) fileReader.readAsText(file);
      } else {
        if (file) fileReader.readAsDataURL(file);
      }
    }
  }
}
