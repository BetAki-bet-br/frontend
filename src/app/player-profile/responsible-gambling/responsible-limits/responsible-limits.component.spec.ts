// import { ComponentFixture, TestBed } from '@angular/core/testing';

// import {
//   PlayerService,
//   ProdGameService,
//   GlobalizationService,
//   BalanceService,
//   BonusService,
//   LoyaltyService,
//   SportsbookService,
// } from '@icore/ngx-portalgateway-api-client-atl';
// import { TranslateModule } from '@ngx-translate/core';
// import { MockCtgApiService } from '@app/@shared/http/ctg-api.service.mock';
// import { DateAdapter, NativeDateAdapter } from '@angular/material/core';
// import { Dialog } from '@angular/cdk/dialog';
// import { ResponsibleLimitsComponent } from './responsible-limits.component';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { PlayerProfileService } from '@app/player-profile/player-profile.service';
// import { PlayerProfileServiceMock } from '@app/player-profile/player-profile.service.mock';
// import { SnackbarService } from '@app/@core/snackbar.service';
// import { MatSnackBar } from '@angular/material/snack-bar';
// import { MatSelectModule } from '@angular/material/select';

// describe('ResponsibleLimitsComponent', () => {
//   let component: ResponsibleLimitsComponent;
//   let fixture: ComponentFixture<ResponsibleLimitsComponent>;

//   beforeEach(async () => {
//     await TestBed.configureTestingModule({
//       imports: [FormsModule, MatSelectModule, ReactiveFormsModule, TranslateModule.forRoot()],
//       declarations: [ResponsibleLimitsComponent],
//       providers: [
//         SnackbarService,
//         MatSnackBar,
//         {
//           provide: PlayerService,
//           useClass: MockCtgApiService,
//         },
//         { provide: ProdGameService, useValue: {} },
//         { provide: GlobalizationService, useValue: {} },
//         { provide: BalanceService, useClass: MockCtgApiService },
//         { provide: LoyaltyService, useClass: MockCtgApiService },
//         { provide: BonusService, useValue: {} },
//         { provide: DateAdapter, useClass: NativeDateAdapter },
//         { provide: SportsbookService, useClass: MockCtgApiService },
//         { provide: Dialog, useValue: {} },
//         { provide: PlayerProfileService, useClass: PlayerProfileServiceMock },
//       ],
//     }).compileComponents();

//     fixture = TestBed.createComponent(ResponsibleLimitsComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });
