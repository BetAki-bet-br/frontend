import { ChatService } from '@app/@shared/services/chat.service';
import { AuthenticationService } from '@app/auth';
import { AccountVerificationActionEnum, AuthDialogService, FaceAuthParams } from '@app/auth/auth-dialog.service';
import { PlayerSessionStatus, SessionHistoryQuery } from '@app/@core/gateway';
import { PlayerProfileService } from '@app/player-profile/player-profile.service';
import { IdLabel } from '@app/player-profile/wallet/wallet-history/wallet-history.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Observable, Subject, Subscription, interval, map, of, switchMap, take, takeUntil, tap } from 'rxjs';
import {
  AccountClosureDialogComponent,
  AccountClosureDialogResult,
} from './account-closure-dialog/account-closure-dialog.component';
import { CommonModule } from '@angular/common';
import { BaseTableMsgsComponent } from '@app/@shared/components/base-table-msgs/base-table-msgs.component';
import { FaceAuthenticatorDialogComponent } from '@app/@shared/components/face-authenticator-dialog/face-authenticator-dialog.component';
import { MatTooltip } from '@angular/material/tooltip';
import { DialogModule, Dialog } from '@angular/cdk/dialog';
import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  inject,
  ChangeDetectorRef,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink, Router } from '@angular/router';
import { TwentyFourDateFormat } from '@app/@core/date-formats';
import { SnackbarService } from '@app/@core/snackbar.service';
import { Logger } from '@app/@shared';
import { TableColumn, TableConfig } from '@app/@shared/components/base-table/base-table.component';
import {
  PageBreadcrumbsComponent,
  Breadcrumbs,
} from '@app/@shared/components/page-breadcrumbs/page-breadcrumbs.component';
import { SessionHistory } from '@app/@shared/models';

export interface SessionHistoryFormGroup {
  dateFrom: FormControl<Date | null>;
  dateTo: FormControl<Date | null>;
  status: FormControl<IdLabel[] | null>;
}

const log = new Logger('ProfileSettingsSecurityComponent');

@Component({
  selector: 'app-profile-settings-security',
  templateUrl: './profile-settings-security.component.html',
  styleUrls: ['./profile-settings-security.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    TranslateModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatExpansionModule,
    MatPaginatorModule,
    MatCardModule,
    PageBreadcrumbsComponent,
    DialogModule,
    MatTooltip,
  ],
})
export class ProfileSettingsSecurityComponent implements OnInit, OnDestroy {
  private cdr = inject(ChangeDetectorRef);
  private deviceService = inject(DeviceDetectorService);
  private dialog = inject(Dialog);
  private playerProfileService = inject(PlayerProfileService);
  private snackbarService = inject(SnackbarService);
  private translateService = inject(TranslateService);
  private chatService = inject(ChatService);
  private authDialogService = inject(AuthDialogService);
  private authenticationService = inject(AuthenticationService);
  private router = inject(Router);
  private paginatorIntl = inject(MatPaginatorIntl);

  readonly userAgentTemplate = viewChild<TemplateRef<any>>('userAgentTemplate');
  readonly statusTemplate = viewChild<TemplateRef<any>>('statusTemplate');
  readonly dateTemplate = viewChild<TemplateRef<any>>('dateTemplate');
  readonly dateEndTemplate = viewChild<TemplateRef<any>>('dateEndTemplate');

  breadcrumbs: Breadcrumbs[] = [
    {
      svgIcon: 'essentials-home',
      url: '/',
    },
    {
      text: 'My account',
      url: '/profile',
    },
    {
      text: 'Login and security',
    },
  ];

  //twoFactorAuthentication = new FormControl<boolean>(true);

  loginCredentialsExpanded = false;
  sessionHistoryExpanded = false;
  closeAccountExpanded = false;

  LogonSessionStatusEnum = PlayerSessionStatus;

  statusList: IdLabel[] = Object.values(PlayerSessionStatus).map((key: any, index: number) => ({
    id: index,
    label: key,
  }));

  currentDate = new Date();
  currentDateTo = new Date();

  filterForm: FormGroup<SessionHistoryFormGroup> = new FormGroup({
    status: new FormControl<IdLabel[] | null>(null, Validators.required),
    dateFrom: new FormControl<Date | null>(null, Validators.required),
    dateTo: new FormControl<Date | null>(null, Validators.required),
  });

  recordsCount = 0;
  pageNumber = 1;
  pageSize = 300;
  totalPages = 0;

  pagedData: SessionHistory[] = [];
  tablePageSize = 5;
  currentPage = 0;

  /* OLD */

  tableColumns: TableColumn[] = [];

  tableConfig: TableConfig = {
    hideHeader: false,
  };

  faceAuthUrl: string | null | undefined;
  providerId: string | null | undefined;

  sessionHistoryData: SessionHistory[] = [];

  isLoading = false;

  dateFormat = TwentyFourDateFormat;

  currentySelectedStatus: IdLabel[] = [];

  private subscription: Subscription = new Subscription();

  searchItems() {
    this.getSessionHistory();
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagedData();
  }

  updatePagedData() {
    const start = this.currentPage * this.tablePageSize;
    const end = start + this.tablePageSize;
    this.pagedData = this.sessionHistoryData.slice(start, end);
    this.cdr.detectChanges();
  }

  isMobile() {
    return this.deviceService.isMobile() || this.deviceService.isTablet();
  }

  ngOnInit(): void {
    const today = new Date();

    let dateFrom = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    let dateTo: Date = today;

    this.statusList.unshift({ id: 3, label: 'All' });

    this.filterForm.setValue({
      status: [this.statusList.find((s) => s.label === 'All')!],
      dateFrom: this.setHours(dateFrom, true),
      dateTo: this.setHours(dateTo, false),
    });

    this.currentySelectedStatus = this.statusList.filter((s) => s.label === 'All') ?? [];

    this.statusChanges();

    this.paginatorIntl.nextPageLabel = this.translateService.instant('Next page');
    this.paginatorIntl.previousPageLabel = this.translateService.instant('Previous page');

    this.paginatorIntl.getRangeLabel = (page: number, pageSize: number, length: number) => {
      const startIndex = page * pageSize;
      const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
      return this.translateService.instant('recordInfoLabel', {
        start: startIndex + 1,
        end: endIndex,
        total: length,
      });
    };
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private statusChanges(): void {
    this.subscription.add(
      this.filterForm.get('status')?.valueChanges.subscribe((selected: IdLabel[] | null) => {
        // Find the 'All' option in the status list
        const allOption = this.statusList.find((opt) => opt.label === 'All');

        // Determine which status was added
        const addedStatus = selected?.find((opt) => !this.currentySelectedStatus.includes(opt));

        // Create a new array to hold the new selected options
        const newSelected: IdLabel[] = [];

        // If the 'All' option was added, add it to the newSelected array
        if (allOption && (addedStatus === allOption || selected?.length === 0)) {
          newSelected.push(allOption);
        } else {
          // If the 'All' option was not added, add all other options to the newSelected array
          newSelected.push(...(selected?.filter((opt) => opt !== allOption) ?? []));
        }

        // Set the value of the status form control
        this.filterForm.get('status')?.setValue(newSelected, { emitEvent: false });

        // Update the currentySelectedStatus array
        this.currentySelectedStatus = this.filterForm.get('status')?.value ?? [];
      }),
    );
  }

  async terminateSession(session: SessionHistory) {
    const cpySessionHistory: SessionHistory[] = this.sessionHistoryData.map((h) => h);
    const activeCount: number = cpySessionHistory.filter((sh) => sh.status === PlayerSessionStatus.Active)?.length;

    const subject: Subject<any> = new Subject<any>();
    const intervalInstance: Observable<SessionHistory[]> = interval(1000)
      .pipe(
        takeUntil(subject.asObservable()),
        tap((val) => {
          return val;
        }),
      )
      .pipe(
        switchMap((intervalIndex: number) => {
          if (intervalIndex === 10) {
            subject.next('interval limit reached');
          }
          return this.playerProfileService.getSessionHistory().pipe(
            map((sessionHistoryData: SessionHistory[]) => {
              if (sessionHistoryData && sessionHistoryData !== null && sessionHistoryData.length > 0) {
                const newActiveCount: number = sessionHistoryData.filter(
                  (sh) => sh.status === PlayerSessionStatus.Active,
                )?.length;
                if (activeCount !== newActiveCount) {
                  subject.next('success');
                }
              }
              return sessionHistoryData;
            }),
          );
        }),
      );

    this.subscription.add(
      this.playerProfileService
        .terminateAllSessions()
        .pipe(
          take(1),
          tap((x) => {
            this.snackbarService.openCustomSuccess(
              this.translateService.instant('Session terminated successfully'),
              'center',
              'top',
            );
          }),
          switchMap((y) => intervalInstance),
        )
        .subscribe({
          next: (data: SessionHistory[]) => {
            if (data && data !== null && data.length > 0) {
              this.sessionHistoryData = data;
              this.cdr.detectChanges();
            }
          },
          complete: () => {},
          error: (err) => {
            this.snackbarService.openCustomError(
              this.translateService.instant('Failed to terminate session'),
              'center',
              'top',
            );
          },
        }),
    );
  }

  closeAccount() {
    const dialogRef = this.dialog.open<AccountClosureDialogResult>(AccountClosureDialogComponent, { autoFocus: false });

    dialogRef.closed
      .pipe(
        switchMap((result) => {
          if (result?.save) {
            return this.playerProfileService.closePlayerAccount();
          }
          return of(null);
        }),
        switchMap((response) => {
          if (response?.referenceId) {
            const faceAuthParams: FaceAuthParams = {
              providerId: response.referenceId,
              faceAuthUrl: response?.url ?? undefined,
              faceAuthUrlQR: response?.qrCodeUrl ?? undefined,
            };
            return this.authDialogService.initAccountVerificationWithParams(
              AccountVerificationActionEnum.Account,
              faceAuthParams,
            );
          }

          return of(null);
        }),
        switchMap((response) => {
          if (response?.success) {
            this.snackbarService.openCustomSuccess(
              this.translateService.instant('Your account has been closed.'),
              'center',
              'top',
              4000,
            );
            return this.authenticationService.logout(false).pipe(
              tap(() => {
                this.router.navigate(['/'], { replaceUrl: true });
              }),
            );
          }

          return of(null);
        }),
      )
      .subscribe();
  }

  annualReportRequest() {
    return this.playerProfileService.requestAnnualReport().subscribe({
      next: () => {
        this.snackbarService.openCustomSuccess(
          this.translateService.instant('Annual income report successfully requested'),
          'center',
          'top',
        );
      },
      error: () => {
        this.snackbarService.openCustomError(
          this.translateService.instant('Failed to request annual income report'),
          'center',
          'top',
        );
      },
    });
  }

  onChatClick(): void {
    this.chatService.showChat();
  }

  private getSessionHistory(): void {
    this.sessionHistoryData = [];

    let filter: SessionHistoryQuery = {
      pageSize: this.pageSize,
      from: this.setHours(this.filterForm.controls.dateFrom?.value, true) ?? undefined,
      to: this.setHours(this.filterForm.controls.dateTo?.value, false) ?? undefined,
    };

    this.subscription.add(
      this.playerProfileService.getSessionHistory(filter).subscribe({
        next: (sessionHistory: SessionHistory[]) => {
          if (sessionHistory && sessionHistory !== null && sessionHistory.length > 0) {
            if (this.filterForm.controls.status.value?.some((opt) => opt.label === 'All'))
              this.sessionHistoryData = sessionHistory;
            else {
              const selectedStatusLabels = (this.filterForm.controls.status.value ?? []).map((s) => s.label);
              this.sessionHistoryData = sessionHistory.filter((item) =>
                selectedStatusLabels.includes(item.status || ''),
              );
            }
            this.cdr.detectChanges();
          }
        },
        complete: () => {
          this.updatePagedData();
        },
        error: (err) => {},
      }),
    );
  }

  private setHours(date: Date | null, start: boolean) {
    let newDate = new Date();

    if (date) newDate = new Date(date);

    if (start) newDate.setHours(0, 0, 0, 0);
    else newDate.setHours(23, 59, 59, 999);

    return newDate;
  }
}
