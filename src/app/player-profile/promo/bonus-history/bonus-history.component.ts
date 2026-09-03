import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ChangeDetectorRef,
  TemplateRef,
  OnDestroy,
  inject,
  DestroyRef,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ShortDateFormat } from '@app/@core/date-formats';
import { Logger } from '@app/@shared/logger.service';
import { PlayerBonusResolved } from '@app/@shared/models';
import { PlayerBonusHistoryStatusEnum } from '@icore/ngx-portalgateway-api-client-atl';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { DeviceDetectorService } from 'ngx-device-detector';
import { BonusesService } from '@app/@shared/services/bonuses.service';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { DataStoreService } from '@app/@core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface BonusHistoryFormGroup {
  period: FormControl<IdLabel | null>;
  dateFrom: FormControl<Date | null>;
  dateTo: FormControl<Date | null>;
  status: FormControl<IdLabel[] | null>;
}

export enum BonusHistoryStatusEnum {
  Redeemed = 'Redeemed',
  Lost = 'Lost',
  Declined = 'Declined',
  Expired = 'Expired',
}

interface IdLabel {
  id: number;
  label: string;
}

const log = new Logger('BonusHistoryComponent');

@Component({
  selector: 'app-bonus-history',
  templateUrl: './bonus-history.component.html',
  styleUrls: ['../../wallet/wallet-history/wallet-history.component.scss', './bonus-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
    MatDividerModule,
    MatCardModule,
    MatTooltipModule,
  ],
})
export class BonusHistoryComponent implements OnInit, OnDestroy {
  private bonusesService = inject(BonusesService);
  private cdr = inject(ChangeDetectorRef);
  private translateService = inject(TranslateService);
  private deviceService = inject(DeviceDetectorService);
  private destroyRef = inject(DestroyRef);
  dataStoreService = inject(DataStoreService);

  readonly paginator = viewChild.required(MatPaginator);

  bonusHistoryData: PlayerBonusResolved[] = [];
  pagedData: PlayerBonusResolved[] = [];

  currentySelectedStatus: IdLabel[] = [];
  statusList: IdLabel[] = Object.values(BonusHistoryStatusEnum).map((key: any, index: number) => ({
    id: index,
    label: key,
  }));

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
  currentDateTo = new Date();
  minimumDate = new Date();
  dateFormat = ShortDateFormat;

  filterForm: FormGroup<BonusHistoryFormGroup> = new FormGroup({
    status: new FormControl<IdLabel[] | null>(null, Validators.required),
    period: new FormControl<IdLabel>(this.periodList[0]),
    dateFrom: new FormControl<Date | null>(null, Validators.required),
    dateTo: new FormControl<Date | null>(null, Validators.required),
  });

  recordsCount = 0;
  pageNumber = 1;
  pageSize = 300;
  totalPages = 0;
  tablePageSize = 5;
  currentPage = 0;

  private subscription: Subscription = new Subscription();

  ngOnInit(): void {
    const today = new Date();
    let dateFrom = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    let dateTo: Date = today;

    this.statusList.unshift({ id: 3, label: 'All' });

    this.filterForm.patchValue({
      status: [this.statusList.find((s) => s.label === 'All')!],
      dateFrom: this.setHours(dateFrom, true),
      dateTo: this.setHours(dateTo, false),
    });

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
          if (this.currentDateTo === value) {
            return;
          }
          this.currentDateTo = value;
          this.filterForm.get('period')?.setValue(this.periodList[4], { emitEvent: false });
        }
      });

    this.currentySelectedStatus = this.statusList.filter((s) => s.label === 'All') ?? [];
    this.statusChanges();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  searchItems() {
    this.getBonusHistory();
  }

  updatePagedData() {
    const start = this.currentPage * this.tablePageSize;
    const end = start + this.tablePageSize;
    this.pagedData = this.bonusHistoryData.slice(start, end);
    this.cdr.detectChanges();
  }

  isMobile() {
    return this.deviceService.isMobile() || this.deviceService.isTablet();
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagedData();
  }

  private getBonusHistory(): void {
    this.bonusHistoryData = [];

    this.subscription.add(
      this.bonusesService.getPlayerBonusesHistory().subscribe({
        next: (bonusHistory: PlayerBonusResolved[]) => {
          if (bonusHistory && bonusHistory !== null && bonusHistory.length > 0) {
            // filter out all bonuses with ineligible statuses
            const allowedStatuses = Object.values(BonusHistoryStatusEnum);
            const allowedBonuses = bonusHistory.filter(
              (bonus): bonus is PlayerBonusResolved & { status: PlayerBonusHistoryStatusEnum } =>
                !!bonus.status && allowedStatuses.includes(bonus.status as unknown as BonusHistoryStatusEnum),
            );

            // filter by period
            const filteredBonuses = allowedBonuses.filter((bonus) => {
              if (!bonus.acceptedDate) return false;

              const bonusDate = new Date(bonus.acceptedDate);
              const from = this.setHours(this.filterForm.controls.dateFrom?.value, true);
              const to = this.setHours(this.filterForm.controls.dateTo?.value, false);

              return bonusDate >= from && bonusDate <= to;
            });

            if (this.filterForm.controls.status.value?.some((opt) => opt.label === 'All'))
              this.bonusHistoryData = filteredBonuses;
            else {
              const selectedStatusLabels = (this.filterForm.controls.status.value ?? []).map((s) => s.label);
              this.bonusHistoryData = filteredBonuses.filter((item) =>
                selectedStatusLabels.includes(item.status || ''),
              );
            }

            this.bonusHistoryData.sort(
              (a, b) => new Date(b.acceptedDate ?? '').getTime() - new Date(a.acceptedDate ?? '').getTime(),
            );

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

  private setHours(date: Date | null, start: boolean) {
    let newDate = new Date();

    if (date) newDate = new Date(date);
    if (start) newDate.setHours(0, 0, 0, 0);
    else newDate.setHours(23, 59, 59, 999);

    return newDate;
  }
}
