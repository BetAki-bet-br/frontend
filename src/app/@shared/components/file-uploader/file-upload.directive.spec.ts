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

import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { FileUploadDirective } from './file-upload.directive';

describe('ICBOFileUploadDirective', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [MatSnackBarModule, TranslateModule.forRoot()] });
  });

  it('should create an instance', () => {
    const directive = TestBed.runInInjectionContext(() => new FileUploadDirective());
    expect(directive).toBeTruthy();
  });
});
