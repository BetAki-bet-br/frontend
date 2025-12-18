import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaceAuthenticatorDialogComponent } from './face-authenticator-dialog.component';
import { Dialog, DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { TranslateModule } from '@ngx-translate/core';
import {
  BannerService,
  BonusService,
  GlobalizationService,
  MessageService,
  PaymentService,
  PlayerService,
  ProdGameService,
  PromotionService,
  TemplateService,
} from '@icore/ngx-portalgateway-api-client-atl';
import { MockCtgApiService } from '@app/@shared/http/ctg-api.service.mock';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RenderTemplatePipe } from '@app/@pipes/render-template.pipe';
import { EllipsisPipe } from '@app/@pipes/ellipsis.pipe';
import { HttpBackend } from '@angular/common/http';

describe('FaceAuthenticatorDialogComponent', () => {
  let component: FaceAuthenticatorDialogComponent;
  let fixture: ComponentFixture<FaceAuthenticatorDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [FaceAuthenticatorDialogComponent],
      providers: [
        { provide: PlayerService, useClass: MockCtgApiService },
        { provide: MessageService, useClass: MockCtgApiService },
        { provide: GlobalizationService, useClass: MockCtgApiService },
        { provide: ProdGameService, useClass: MockCtgApiService },
        { provide: BonusService, useClass: MockCtgApiService },
        { provide: PromotionService, useClass: MockCtgApiService },
        { provide: TemplateService, useClass: MockCtgApiService },
        { provide: BannerService, useClass: MockCtgApiService },
        { provide: PaymentService, useClass: MockCtgApiService },
        { provide: DIALOG_DATA, useValue: {} },
        { provide: Dialog, useValue: {} },
        { provide: DialogRef, useValue: {} },
        { provide: MatSnackBar, useValue: {} },
        RenderTemplatePipe,
        EllipsisPipe,
        HttpBackend,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FaceAuthenticatorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
