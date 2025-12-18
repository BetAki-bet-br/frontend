import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageBreadcrumbsComponent } from './page-breadcrumbs.component';
import { TranslateModule } from '@ngx-translate/core';
import { HttpBackend, HttpClient, HttpClientModule } from '@angular/common/http';
import { DataStoreService } from '@app/@core';
import { ExternalConfigsLoader } from '@app/@core/external-configs-loader';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Dialog } from '@angular/cdk/dialog';
import { ActivatedRoute } from '@angular/router';

describe('PageBreadcrumbsComponent', () => {
  let component: PageBreadcrumbsComponent;
  let fixture: ComponentFixture<PageBreadcrumbsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PageBreadcrumbsComponent],
      imports: [TranslateModule.forRoot(), HttpClientModule, MatSnackBarModule],

      providers: [
        DataStoreService,
        ExternalConfigsLoader,
        HttpClient,
        HttpBackend,
        { provide: Dialog, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PageBreadcrumbsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
