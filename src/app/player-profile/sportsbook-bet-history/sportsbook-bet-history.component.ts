import { ButtonComponent } from '@app/@shared/components/button/button.component';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { DateAdapter, MatOption } from '@angular/material/core';
import { MatPaginatorIntl, PageEvent, MatPaginator } from '@angular/material/paginator';
import { DataStoreService } from '@app/@core';
import { ConfigurationService } from '@app/@core/configuration.service';
import { TwentyFourDateFormat } from '@app/@core/date-formats';
import { GenericDataModel, TableColumn } from '@app/@shared/components/base-table/base-table.component';
import {
  Breadcrumbs,
  PageBreadcrumbsComponent,
} from '@app/@shared/components/page-breadcrumbs/page-breadcrumbs.component';
import { SportsbookBetHistoryModelResolved, TransactionStatusEnum } from '@app/@shared/models';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { switchMap } from 'rxjs';
import { PlayerProfileService } from '../player-profile.service';
import { BetStatusEnum } from '@icore/ngx-portalgateway-api-client-atl';
import { MatFormField, MatError } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionPanelHeader, MatExpansionModule } from '@angular/material/expansion';
import { MatDivider } from '@angular/material/divider';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { MatNativeDateModule } from '@angular/material/core';

export interface SportsbookBetHistoryFormGroup {
  period: FormControl<IdLabel | null>;
  dateFrom: FormControl<Date | null>;
  dateTo: FormControl<Date | null>;
  pageNumber: FormControl<number | null>;
  pageSize: FormControl<number | null>;
}

export interface IdLabel {
  id: number;
  label: string;
}

@Component({
  selector: 'app-sportsbook-bet-history',
  templateUrl: './sportsbook-bet-history.component.html',
  styleUrls: ['./sportsbook-bet-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageBreadcrumbsComponent,
    MatFormField,
    MatError,
    MatSelect,
    MatOption,
    MatIcon,
    MatDatepickerModule,
    MatInputModule,
    MatExpansionPanelHeader,
    MatExpansionModule,
    MatPaginator,
    ButtonComponent,
    TranslateModule,
    MatDivider,
    UpperCasePipe,
    DatePipe,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
  ],
})
export class SportsbookHistoryComponent implements OnInit {
  dataStoreService = inject(DataStoreService);
  private configurationService = inject(ConfigurationService);
  private playerProfileService = inject(PlayerProfileService);
  private cdr = inject(ChangeDetectorRef);
  private deviceService = inject(DeviceDetectorService);
  private dateAdapter = inject<DateAdapter<any>>(DateAdapter);
  private translateService = inject(TranslateService);
  private paginatorIntl = inject(MatPaginatorIntl);
  private destroyRef = inject(DestroyRef);

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
      text: 'Sports betting',
    },
  ];

  dateFormat = TwentyFourDateFormat;

  periodList: IdLabel[] = [
    {
      id: 0,
      label: this.translateService.instant('Last 24 hours'),
    },
    {
      id: 1,
      label: this.translateService.instant('Last week'),
    },
    {
      id: 2,
      label: this.translateService.instant('Last month'),
    },
    {
      id: 3,
      label: this.translateService.instant('Last 2 months'),
    },
    {
      id: 4,
      label: this.translateService.instant('Custom'),
    },
  ];

  currentDate = new Date();
  minimumDate = new Date();

  currentDateTo = new Date();

  defaultPageSize = 5;
  defaultDatabasePageSize = 300;

  totalPages = 0;

  pageNumber = 0;
  pageSize = this.defaultPageSize;

  recordsCount = 0;
  startRecord = 0;
  endRecord = 0;

  filterForm: FormGroup<SportsbookBetHistoryFormGroup> = new FormGroup({
    period: new FormControl<IdLabel>(this.periodList[0]),
    dateFrom: new FormControl<Date | null>(null),
    dateTo: new FormControl<Date | null>(null),
    pageNumber: new FormControl<number>(1),
    pageSize: new FormControl<number>(this.defaultPageSize),
  });

  tableColumns: TableColumn[] = [];
  tableData: SportsbookBetHistoryModelResolved[] = [];
  filteredTableData: SportsbookBetHistoryModelResolved[] = [];

  TransactionStatusEnum = TransactionStatusEnum;
  isDataLoading = false;

  playerCurrency: string = '';

  constructor() {
    this.dateAdapter.setLocale(this.playerProfileService.getPlayerLocale());
  }

  ngOnInit(): void {
    const today = new Date();

    let dateFrom = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    let dateTo: Date = today;

    this.filterForm.patchValue({
      dateFrom,
      dateTo,
      pageNumber: 1,
      pageSize: this.defaultDatabasePageSize,
    });

    //this.filterForm.controls.dateFrom.setValidators(this.dateRangeValidator);

    this.loadData();

    this.filterForm
      .get('period')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        if (value) {
          const today = new Date();

          let dateFrom: Date = new Date();
          let dateTo: Date = new Date();

          switch (value.id) {
            case this.periodList[0].id:
              dateFrom = new Date(today.getTime() - 24 * 60 * 60 * 1000);
              dateTo = today;
              break;
            case this.periodList[1].id:
              dateFrom = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
              dateTo = today;
              break;
            case this.periodList[2].id:
              dateFrom = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
              dateTo = today;
              break;
            case this.periodList[3].id:
              dateFrom = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);
              dateTo = today;
              break;
            default:
              dateFrom = new Date(today.getTime() - 24 * 60 * 60 * 1000);
              dateTo = today;
              break;
          }

          this.filterForm.get('dateFrom')?.setValue(dateFrom, { emitEvent: false });
          this.filterForm.get('dateTo')?.setValue(dateTo, { emitEvent: false });
          this.minimumDate = dateFrom;
          this.currentDateTo = dateTo;
        }
      });

    this.filterForm
      .get('dateFrom')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: Date | null) => {
        if (value) {
          value.setHours(0, 0, 0, 0);
          this.filterForm.get('dateFrom')?.setValue(value, { emitEvent: false });

          const dateTo = this.filterForm.get('dateTo')?.value;
          if (dateTo && dateTo < value) {
            this.filterForm.get('dateTo')?.setValue(value, { emitEvent: false });
          }

          this.filterForm.get('period')?.setValue(this.periodList[4], { emitEvent: false });

          this.minimumDate = value;
        }
      });

    this.filterForm
      .get('dateTo')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: Date | null) => {
        if (value) {
          value.setHours(23, 59, 59, 999);
          this.filterForm.get('dateTo')?.setValue(value, { emitEvent: false });

          if (this.currentDateTo === value) {
            return;
          }

          this.currentDateTo = value;

          this.filterForm.get('period')?.setValue(this.periodList[4], { emitEvent: false });
        }
      });

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

  isMobile() {
    return this.deviceService.isMobile() || this.deviceService.isTablet();
  }

  toggleExpand(item: SportsbookBetHistoryModelResolved) {
    this.onRowExtended(item);
  }

  onRowExtended(element: GenericDataModel<SportsbookBetHistoryModelResolved>) {
    if (element.wasExpanded !== true && element.settleId) {
      this.playerProfileService
        .getTransactionDetails(element.settleId.toString())
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((result) => {
          element.transactionDetails = result;
          if (result?.length > 0) {
            const currencySymbol = new Intl.NumberFormat(element.locale ?? '', {
              style: 'currency',
              currency: this.playerCurrency,
            })
              .format(0)
              .replace(/\d|\.|\,/g, '')
              .trim();

            const decimalFormatter = new Intl.NumberFormat(element?.locale ?? '', {
              style: 'decimal',
              maximumFractionDigits: 2,
              minimumFractionDigits: 2,
            });

            element.balanceBefore = element.transactionDetails[0].balanceBefore;
            element.balanceBeforeResolved = `${currencySymbol} ${decimalFormatter.format(element.balanceBefore ?? 0)}`;
            element.balanceAfter = element.transactionDetails[result.length - 1].balanceAfter;
            element.balanceAfterResolved = `${currencySymbol} ${decimalFormatter.format(element.balanceAfter ?? 0)}`;
            element.wasExpanded = true;
          }

          this.cdr.detectChanges();
        });
    }
  }

  private loadData() {
    if (this.filterForm.invalid) {
      return;
    }

    this.isDataLoading = true;

    this.configurationService
      .getPlayerInfo()
      .pipe(
        switchMap((playerInfo) => {
          this.playerCurrency = playerInfo?.currencyCode ?? this.dataStoreService.defaultCurrency;
          return this.playerProfileService.getSportsbookBetHistory(this.filterForm.value);
        }),
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.tableData = data.historyListResolved ? [...data.historyListResolved] : [];

          this.recordsCount = data.recordCount ?? 0;

          this.pageNumber = 0;
          this.totalPages = Math.ceil(this.recordsCount / this.pageSize);

          this.updatePagedData();

          this.isDataLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.isDataLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  onPageChange(event: PageEvent) {
    this.pageNumber = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagedData();
  }

  updatePagedData() {
    const start = this.pageNumber * this.pageSize;
    const end = start + this.pageSize;
    this.filteredTableData = this.tableData.slice(start, end);
    this.cdr.detectChanges();
  }

  searchItems() {
    this.pageNumber = 0;
    this.pageSize = this.defaultPageSize;

    this.loadData();
  }

  resetfilter() {
    this.pageNumber = 0;
    this.pageSize = this.defaultPageSize;

    const today = new Date();

    let dateFrom = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    let dateTo: Date = today;

    this.filterForm.patchValue({
      dateFrom,
      dateTo,
      period: this.periodList[0],
    });

    this.loadData();
  }

  findIcon(provider: string): string {
    if (provider.toLowerCase() === 'pix') {
      return 'finance-pix';
    }

    return 'finance-extract';
  }

  getStatusItemClass(item: SportsbookBetHistoryModelResolved) {
    switch (item.statusId) {
      case BetStatusEnum.Won:
        return 'win-class';
      case BetStatusEnum.Lost:
        return 'loss-class';
      case BetStatusEnum.Running:
        return 'running-class';
      default:
        return 'unknown-class';
    }
  }

  isCompleted(status: TransactionStatusEnum) {
    const transactions = [
      TransactionStatusEnum.Approved,
      TransactionStatusEnum.Paid,
      TransactionStatusEnum.Refunded,
      TransactionStatusEnum.ChargedBack,
      TransactionStatusEnum.ChargeBackReversed,
      TransactionStatusEnum.Returned,
      TransactionStatusEnum.ReturnReversed,
      TransactionStatusEnum.Completed,
    ];

    return transactions.indexOf(status) >= 0;
  }

  isAborted(status: TransactionStatusEnum) {
    const transactions = [
      TransactionStatusEnum.Declined,
      TransactionStatusEnum.Cancelled,
      TransactionStatusEnum.ErrorOrTimeout,
    ];

    return transactions.indexOf(status) >= 0;
  }

  isPending(status: TransactionStatusEnum) {
    const transactions = [TransactionStatusEnum.Pending];

    return transactions.indexOf(status) >= 0;
  }

  /**
   * Validator for checking that `datetimeFrom` is less or equal `datetimeTo`
   */
  private dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const from = control.get('dateFrom');
    const to = control.get('dateTo');

    if (from && from.value && to && to.value && from.value > to.value) {
      from.setErrors({ dateRangeError: true });
      return {
        dateRangeError: true,
      };
    }

    return null;
  }
}
