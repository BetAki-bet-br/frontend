import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';

import { ResetPaswordComponent } from './reset-pasword.component';
import { TranslateModule } from '@ngx-translate/core';
import {
  BannerService,
  BonusService,
  PlayerService,
  ProdGameService,
  PromotionService,
} from '@icore/ngx-portalgateway-api-client-atl';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MockCtgApiService } from '@app/@shared/http/ctg-api.service.mock';
import { RenderTemplatePipe } from '@app/@pipes/render-template.pipe';
import { EllipsisPipe } from '@app/@pipes/ellipsis.pipe';
import { TemplateService } from '@app/@shared/services/template.service';
import { MockTemplateService } from '@app/@shared/services/template.service.mock';
import { Dialog } from '@angular/cdk/dialog';

describe('ResetPaswordComponent', () => {
  let component: ResetPaswordComponent;
  let fixture: ComponentFixture<ResetPaswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), MatInputModule, BrowserAnimationsModule, ResetPaswordComponent],
      providers: [
        MatSnackBar,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ token: 'test-token' }),
            },
          },
        },
        PlayerService,
        HttpClient,
        { provide: BonusService, useClass: MockCtgApiService },
        { provide: PromotionService, useClass: MockCtgApiService },
        { provide: ProdGameService, useClass: MockCtgApiService },
        { provide: BannerService, useClass: MockCtgApiService },
        { provide: TemplateService, useClass: MockTemplateService },
        RenderTemplatePipe,
        EllipsisPipe,
        { provide: Dialog, useValue: {} },
        provideHttpClient(withInterceptorsFromDi()),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPaswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be visible when app is loading', () => {
    component.isLoading = true;
    fixture.detectChanges();

    const loaderElement = fixture.nativeElement.querySelector('.loader');
    expect(loaderElement).not.toBeNull();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
