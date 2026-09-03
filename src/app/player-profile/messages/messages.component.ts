import { animate, state, style, transition, trigger } from '@angular/animations';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
  inject,
  DestroyRef,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import {
  BaseConfirmationDialogData,
  BaseConfirmationDialogResult,
  ConfirmationDialogComponent,
} from '@app/@shared/components/confirmation-dialog/confirmation-dialog.component';
import {
  Breadcrumbs,
  PageBreadcrumbsComponent,
} from '@app/@shared/components/page-breadcrumbs/page-breadcrumbs.component';
import { PlayerMessageResolved } from '@app/@shared/models';
import { MessageService } from '@app/@shared/services/message.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ChangeMessageTypeEnum, PopupStateEnum } from '@icore/ngx-portalgateway-api-client-atl';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { concatMap, from } from 'rxjs';
import { PlayerProfileService } from '../player-profile.service';
import { getTableColumns } from './table.config';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { TableColumn, TableConfig } from '@app/@shared/components/base-table/base-table.component';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss'],
  animations: [
    trigger('expandCollapse', [
      state('expanded', style({ height: '*', opacity: 1, overflow: 'hidden' })),
      state('collapsed', style({ height: '0px', opacity: 0, overflow: 'hidden' })),
      transition('collapsed <=> expanded', animate('300ms ease-in-out')),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    TranslateModule,
    MatIconModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatDialogModule,
    MatExpansionModule,
    PageBreadcrumbsComponent,
  ],
})
export class MessagesComponent implements OnInit {
  playerProfileService = inject(PlayerProfileService);
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);
  private dialog = inject(MatDialog);
  private translateService = inject(TranslateService);
  private paginatorIntl = inject(MatPaginatorIntl);
  private destroyRef = inject(DestroyRef);

  readonly arrowTemplate = viewChild<TemplateRef<any>>('arrowTemplate');
  readonly expandableRowTemplate = viewChild<TemplateRef<any>>('expandableRowTemplate');

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
      text: 'Messages',
    },
  ];

  allMessagesSelected = false;
  partiallySelected = false;

  defaultPageSize = 5;
  defaultDatabasePageSize = 99999;

  totalPages = 0;

  pageNumber = 0;
  pageSize = this.defaultPageSize;

  recordsCount = 0;
  startRecord = 0;
  endRecord = 0;

  isDataLoading = false;
  tableColumns: TableColumn[] = [];
  tableData: PlayerMessageResolved[] = [];
  filteredTableData: PlayerMessageResolved[] = [];

  tableConfig: TableConfig = {
    hideHeader: true,
    expandableRowTemplate: this.expandableRowTemplate(),
  };

  selectAll = false;
  selection: number[] = [];

  PopupStateEnum = PopupStateEnum;

  ngOnInit(): void {
    this.tableColumns = getTableColumns(this.arrowTemplate());
    this.messageService.messages$?.subscribe((data) => {
      if (data) {
        if (this.tableData.length === 0) {
          this.tableData = [...data];
          this.tableData.sort((a, b) => {
            if (a.state === PopupStateEnum.Unread && b.state !== PopupStateEnum.Unread) {
              return -1;
            }
            if (a.state !== PopupStateEnum.Unread && b.state === PopupStateEnum.Unread) {
              return 1;
            }
            return (b.id ?? 0) - (a.id ?? 0);
          });
          this.pageNumber = 0;
        } else {
          let newData: PlayerMessageResolved[] = [];
          let currentMessageIds = this.tableData.map((x) => x.id ?? 0);
          let newMessageIds = data.map((x) => x.id ?? 0);

          data.forEach((message) => {
            if (message.id && !currentMessageIds.includes(message.id)) {
              newData.push(message);
            }
          });

          this.tableData.forEach((message) => {
            if (message.id && newMessageIds.includes(message.id)) {
              newData.push(message);
            }
          });

          this.tableData = [...newData];
          this.tableData.sort((a, b) => {
            if (a.state === PopupStateEnum.Unread && b.state !== PopupStateEnum.Unread) {
              return -1;
            }
            if (a.state !== PopupStateEnum.Unread && b.state === PopupStateEnum.Unread) {
              return 1;
            }
            return (b.id ?? 0) - (a.id ?? 0);
          });
        }

        this.recordsCount = this.tableData.length ?? 0;
        this.totalPages = Math.ceil(this.recordsCount / this.pageSize);

        this.updatePagedData();
        this.cdr.markForCheck();
      }
    });

    this.messageService.updateMessages();
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

  checked(id?: number | null) {
    if (!id) {
      return false;
    }

    return this.tableData.find((x) => x.id === id)?.selected;
  }

  updateSelection(id?: number | null) {
    if (!id && id !== 0) {
      return;
    }

    if (id === 0) {
      let select = false;

      if (this.tableData.some((x) => x.selected === false)) {
        select = true;
      }

      this.tableData.forEach((x) => (x.selected = select));
      this.allMessagesSelected = select;
      this.partiallySelected = false;
    } else {
      const data = this.tableData.find((x) => x.id === id);

      if (data) {
        data.selected = !data.selected;
      }

      if (this.tableData.every((x) => x.selected)) {
        this.allMessagesSelected = true;
        this.partiallySelected = false;
      } else if (this.tableData.every((x) => x.selected === false)) {
        this.allMessagesSelected = false;
        this.partiallySelected = false;
      } else {
        this.allMessagesSelected = false;
        this.partiallySelected = true;
      }
    }
  }

  deleteSelected() {
    let message = marker('Selected message(s) will be deleted.');

    // open confirmation dialog
    const dialogRef = this.dialog.open<
      ConfirmationDialogComponent,
      BaseConfirmationDialogData,
      BaseConfirmationDialogResult
    >(ConfirmationDialogComponent, {
      data: {
        title: marker('Are you sure?'),
        message,
        cancelButtonText: marker('Cancel'),
        confirmButtonText: marker('Delete'),
      },
      autoFocus: false,
    });

    // on dialog closed
    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result && result?.success) {
          const selected = this.tableData.filter((x) => x.selected).map((y) => y.id ?? 0) ?? [];

          from(selected)
            .pipe(concatMap((id) => this.playerProfileService.deleteMessage(id)))
            .subscribe({
              next: (res) => {},
              complete: () => {
                this.tableData = this.tableData.filter((x) => x.selected === false);
                this.updatePagedData();
                this.allMessagesSelected = false;
                this.partiallySelected = false;
                this.messageService.updateMessages();
                this.cdr.markForCheck();
              },
              error: (err) => {},
            });
        }
      });
  }

  displayRow(row: PlayerMessageResolved) {
    if (row.id && row.state !== ChangeMessageTypeEnum.Read) {
      this.playerProfileService.toReadMessage(row.id).subscribe({
        next: (data: any) => {
          row.state = ChangeMessageTypeEnum.Read;
          this.messageService.updateUnreadCount();
        },
        error: (err) => {},
      });
    }
  }
}
