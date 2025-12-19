import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

export interface TableColumn {
  name: string;
  dataField: string;
  sortingField?: string;
  columnTemplate?: TemplateRef<any>;
  customClass?: string;
}

export interface TableConfig {
  hideHeader?: boolean;
  disableSort?: boolean;
  enableExpandableRows?: boolean;
  expandableRowTemplate?: TemplateRef<any>;
}

export type GenericDataModel<T> = {
  isExpanded?: boolean;
} & T;

@Component({
  selector: 'app-base-table',
  templateUrl: './base-table.component.html',
  styleUrls: ['./base-table.component.scss'],
  imports: [CommonModule, MatTableModule, MatSortModule, MatPaginatorModule, MatIconModule],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseTableComponent<T> implements OnChanges, AfterViewInit {
  @Input() tableColumns?: TableColumn[];
  @Input() tableData?: T[];
  @Input() tableConfig?: TableConfig;
  @Input() noRecordsText: string = marker('No transactions');
  @Input() displayPaginator?: boolean = false;
  @Input() pageSize?: number = 2;
  @Input() expandEnabled = true;

  @Output() rowExtended = new EventEmitter<GenericDataModel<T>>();

  @ViewChild(MatSort, { static: false }) set content(sort: MatSort) {
    this.dataSource.sort = sort;
    this.dataSource.sortingDataAccessor = this.customSortingDataAccessor;
  }

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;

  displayedColumns: string[] = [];
  columnsToDisplayWithExpand = [...this.displayedColumns];
  dataSource = new MatTableDataSource<GenericDataModel<T>>([]);
  paginatorVisibility = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tableColumns'] && this.tableColumns) {
      for (let column of this.tableColumns) {
        this.displayedColumns.push(column.name);
      }

      if (this.EnableExpandableRows) {
        this.columnsToDisplayWithExpand = [...this.displayedColumns, 'expand'];
      } else {
        this.columnsToDisplayWithExpand = [...this.displayedColumns];
      }
    }

    if (changes['tableData'] && this.tableData) {
      const tableDataMapped = this.tableData.map((o) => {
        return {
          isExpanded: false,
          ...o,
        };
      });
      this.dataSource.data = [...tableDataMapped];
    }

    this.paginatorVisibility = this.tableData?.length ? this.displayPaginator ?? false : false;
  }

  ngAfterViewInit() {
    if (this.displayPaginator && this.dataSource && this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  get HideHeader() {
    return !!this.tableConfig?.hideHeader;
  }

  get DisableSort() {
    return !!this.tableConfig?.disableSort;
  }

  get EnableExpandableRows() {
    return !!this.tableConfig?.enableExpandableRows;
  }

  get ExpandableRowTemplate() {
    return this.tableConfig?.expandableRowTemplate ?? null;
  }

  private customSortingDataAccessor = (data: GenericDataModel<T>, sortHeaderId: string) => {
    let value = (data as any)[sortHeaderId];

    if (typeof value === 'string') {
      return value.toLowerCase().trim();
    } else {
      return value;
    }
  };

  expandElement(element: GenericDataModel<T>) {
    if (!this.expandEnabled) return;

    if (element) {
      element.isExpanded = !element.isExpanded;
      this.rowExtended.emit(element);
    }
  }
}
