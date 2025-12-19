import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLimitDialogComponent } from './edit-limit-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ControlContainer, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Dialog, DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  BalanceService,
  BonusService,
  GlobalizationService,
  LoyaltyService,
  PlayerService,
  ProdGameService,
  SportsbookService,
} from '@icore/ngx-portalgateway-api-client-atl';
import { TranslateModule } from '@ngx-translate/core';
import { MockCtgApiService } from '@app/@shared/http/ctg-api.service.mock';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { RenderTemplatePipe } from '@app/@pipes/render-template.pipe';
import { PlayerProfileService } from '@app/player-profile/player-profile.service';
import { PlayerProfileServiceMock } from '@app/player-profile/player-profile.service.mock';

describe('EditLimitDialogComponent', () => {
  let component: EditLimitDialogComponent;
  let fixture: ComponentFixture<EditLimitDialogComponent>;

  const fb = new FormBuilder();
  const form = fb.group({
    amount: [null],
    time: [null],
  });
  const fgd = { control: form };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, MatDialogModule, TranslateModule.forRoot()],
      declarations: [EditLimitDialogComponent],
      providers: [
        { provide: ControlContainer, useValue: fgd },
        { provide: DialogRef, useValue: {} },
        { provide: DIALOG_DATA, useValue: {} },
        { provide: PlayerService, useClass: MockCtgApiService },
        { provide: LoyaltyService, useClass: MockCtgApiService },
        { provide: GlobalizationService, useValue: {} },
        { provide: ProdGameService, useValue: {} },
        { provide: BalanceService, useValue: {} },
        { provide: BonusService, useValue: {} },
        { provide: DateAdapter, useClass: NativeDateAdapter },
        { provide: SportsbookService, useClass: MockCtgApiService },
        { provide: Dialog, useValue: {} },
        MatSnackBar,
        RenderTemplatePipe,
        { provide: PlayerProfileService, useClass: PlayerProfileServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditLimitDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
