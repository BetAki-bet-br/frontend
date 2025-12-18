import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderPromotionDialogComponent } from './header-promotion-dialog.component';
import { DIALOG_DATA, DialogModule, DialogRef } from '@angular/cdk/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { GamesService } from '@app/@shared/services/games/games.service';
import { ActivatedRoute } from '@angular/router';
import { MockTemplateService } from '@app/@shared/services/template.service.mock';
import { TemplateService } from '@app/@shared/services/template.service';
import { RenderTemplatePipe } from '@app/@pipes/render-template.pipe';

describe('HeaderPromotionDialogComponent', () => {
  let component: HeaderPromotionDialogComponent;
  let fixture: ComponentFixture<HeaderPromotionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HeaderPromotionDialogComponent, RenderTemplatePipe],
      imports: [DialogModule, TranslateModule.forRoot()],
      providers: [
        { provide: DIALOG_DATA, useValue: { promotion: 'test' } },
        { provide: DialogRef, useValue: {} },
        { provide: GamesService, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
        { provide: TemplateService, useClass: MockTemplateService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderPromotionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
