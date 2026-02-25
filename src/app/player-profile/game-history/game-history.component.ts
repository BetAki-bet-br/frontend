import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { DateAdapter, MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { DataStoreService } from '@app/@core';
import { ConfigurationService } from '@app/@core/configuration.service';
import { TwentyFourDateFormat } from '@app/@core/date-formats';
import {
  GenericDataModel,
  TableColumn,
  BaseTableComponent,
} from '@app/@shared/components/base-table/base-table.component';
import {
  PageBreadcrumbsComponent,
  Breadcrumbs,
} from '@app/@shared/components/page-breadcrumbs/page-breadcrumbs.component';
import { BaseTableMsgsComponent } from '@app/@shared/components/base-table-msgs/base-table-msgs.component';
import { HistoryResolved, TransactionStatusEnum } from '@app/@shared/models';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { switchMap } from 'rxjs';
import { PlayerProfileService } from '../player-profile.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ButtonComponent } from '@app/@shared/components/button/button.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltip } from '@angular/material/tooltip';

export interface GameHistoryFormGroup {
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
  selector: 'app-game-history',
  templateUrl: './game-history.component.html',
  styleUrls: ['./game-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    MatIconModule,
    ButtonComponent,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatExpansionModule,
    MatPaginatorModule,
    MatDividerModule,
    PageBreadcrumbsComponent,
    MatTooltip,
  ],
})
export class GameHistoryComponent implements OnInit {
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
      text: 'Casino',
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

  filterForm: FormGroup<GameHistoryFormGroup> = new FormGroup({
    period: new FormControl<IdLabel>(this.periodList[0]),
    dateFrom: new FormControl<Date | null>(null),
    dateTo: new FormControl<Date | null>(null),
    pageNumber: new FormControl<number>(1),
    pageSize: new FormControl<number>(this.defaultPageSize),
  });

  tableColumns: TableColumn[] = [];
  tableData: HistoryResolved[] = [];
  filteredTableData: HistoryResolved[] = [];

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

  toggleExpand(item: HistoryResolved) {
    this.onRowExtended(item);
  }

  onRowExtended(element: GenericDataModel<HistoryResolved>) {
    if (element.wasExpanded !== true && element.id) {
      this.playerProfileService
        .getTransactionDetails(element.id.toString())
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
          return this.playerProfileService.getGameHistory(this.filterForm.value);
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
