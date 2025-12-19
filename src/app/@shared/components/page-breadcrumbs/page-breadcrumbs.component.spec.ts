import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageBreadcrumbsComponent } from './page-breadcrumbs.component';
import { TranslateModule } from '@ngx-translate/core';
import { HttpBackend, HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
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
      imports: [TranslateModule.forRoot(), MatSnackBarModule, PageBreadcrumbsComponent],
      providers: [
        DataStoreService,
        ExternalConfigsLoader,
        HttpClient,
        HttpBackend,
        { provide: Dialog, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
        provideHttpClient(withInterceptorsFromDi()),
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
