import { TestBed } from '@angular/core/testing';
import { SportsbookService } from './sportsbook.service';
import { Dialog } from '@angular/cdk/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';

describe('SportsbookService', () => {
  let service: SportsbookService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, TranslateModule.forRoot()],
      providers: [
        { provide: SportsbookService },
        { provide: Dialog, useValue: {} },
        { provide: MatSnackBar, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
      ],
    });
    service = TestBed.inject(SportsbookService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
