import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TermsAndConditionsUpdatedDialogComponent } from './terms-and-conditions-updated-dialog.component';
import { DialogRef } from '@angular/cdk/dialog';
import { TemplateService } from '@icore/ngx-portalgateway-api-client-atl';
import { MockCtgApiService } from '@app/@shared/http/ctg-api.service.mock';
import { TranslateModule } from '@ngx-translate/core';
import { HttpBackend } from '@angular/common/http';
import { PipesModule } from '@app/@pipes/pipes.module';

describe('TermsAndConditionsUpdatedDialogComponent', () => {
  let component: TermsAndConditionsUpdatedDialogComponent;
  let fixture: ComponentFixture<TermsAndConditionsUpdatedDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), PipesModule, TermsAndConditionsUpdatedDialogComponent],
      providers: [
        { provide: DialogRef, useValue: {} },
        { provide: TemplateService, useClass: MockCtgApiService },
        HttpBackend,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TermsAndConditionsUpdatedDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
